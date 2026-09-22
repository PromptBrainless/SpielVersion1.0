import { useCallback, useEffect, useRef, useState } from "react";
import { Runtime } from "@/game/runtime";
import { spielen } from "@/game/script";
import { ART, LAGEN_ART, PORTRAITS, artSrcFor } from "@/game/art";
import { cloneHeld, type EffektId, type Held, type SceneView } from "@/game/types";
import {
  hasSavedGame,
  importiereSpielstand,
  listSavedGames,
  loadGame,
  loadGameByName,
  saveGame,
  type SaveSlotInfo,
} from "@/game/save";
import { hatEffekt, setzeEffekt } from "@/game/effekte";
import { type Tageszeit } from "@/game/tageszeit";
import { vorschauGmCommand, wendeGmCommandAn } from "@/game/gm/gmCommand";
import { wendeHerkunftAn } from "@/game/herkunft";
import {
  anzahlAuflagen,
  auflageFuerSicht,
  auflageLeer,
  loescheAuflage,
  merkeAuflage,
  rueckgaengigAuflage,
  setzeWeltAktiv,
  sichtbareHerkunft,
  weltAktiv,
  wendePatchAn,
  type KartePatch,
} from "@/game/welt";
import { wissenTafeln } from "@/game/wissen-tafeln";
import { kartenFokus, neueKarten, neueQuest, neuesWissen, questGeschichte, wissenFokus, type FokusEintrag } from "@/game/fokus";
import { loadFilePack } from "@/game/text-pack";
import { introAlsSzene } from "@/game/content";
import { CreateHero } from "./CreateHero";
import { Fokus } from "./Fokus";
import { RulesScreen } from "./RulesScreen";
import { SceneStage } from "./SceneStage";
import { TitleScreen } from "./TitleScreen";
import { leiterFrei } from "@/game/leiter-login";
import { LeiterLogin } from "./LeiterLogin";
import { WeltEditor } from "@/components/welt/WeltEditor";
import { Systemsteuerung } from "./Systemsteuerung";
import { leseEinstellungen, setzeEinstellung, wendeEinstellungenAn } from "@/game/einstellungen";
import { useEinstellungen } from "@/game/use-einstellungen";
import {
  ambienteFuerBild,
  bindeKlang,
  entsperreKlang,
  haltAmbiente,
  setzeAmbiente,
  spieleKlang,
} from "@/game/klang";
import { leseTageszeit } from "@/game/tageszeit";

type Mode = "title" | "rules" | "create" | "play";

export function GameApp() {
  const [mode, setMode] = useState<Mode>("title");
  const [view, setView] = useState<SceneView | null>(null);
  const [held, setHeld] = useState<Held | null>(null);
  const [slots, setSlots] = useState<SaveSlotInfo[]>(() => listSavedGames());
  const [canLoad, setCanLoad] = useState(() => hasSavedGame());
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [debug] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug"),
  );
  const [leiterOpen, setLeiterOpen] = useState(false);
  const [leiterLogin, setLeiterLogin] = useState(false);
  const [systemOffen, setSystemOffen] = useState(false);
  const einstellungen = useEinstellungen();
  const [patch, setPatch] = useState<KartePatch>({});
  const [schluessel, setSchluessel] = useState("");
  const [lageIndex, setLageIndex] = useState<number | null>(null);
  const [fokus, setFokus] = useState<FokusEintrag[]>([]);
  const runtimeRef = useRef<Runtime | null>(null);
  const liveRef = useRef<Held | null>(null);
  const kartenFortRef = useRef<EffektId[]>([]);
  const fokusStand = useRef<{ bereit: boolean; src?: string; held?: Held | null }>({ bereit: false });

  const refreshSaves = useCallback(() => {
    setSlots(listSavedGames());
    setCanLoad(hasSavedGame());
  }, []);

  const stopPlay = useCallback(() => {
    runtimeRef.current?.cancel();
    runtimeRef.current = null;
    liveRef.current = null;
    setView(null);
  }, []);

  useEffect(() => {
    for (const src of [
      ...Object.values(ART),
      ...Object.values(PORTRAITS),
      ...Object.values(LAGEN_ART),
    ]) {
      const image = new Image();
      image.src = src;
    }
  }, []);

  // Einstellungen ins DOM schreiben und den Ton ans Fenster hängen.
  useEffect(() => {
    wendeEinstellungenAn();
    const loesen = bindeKlang();
    return () => {
      loesen();
      haltAmbiente();
    };
  }, []);

  // Der Ort bestimmt die Umgebung, die Tageszeit ihre Farbe.
  useEffect(() => {
    if (mode !== "play" || !view) {
      setzeAmbiente("titel", "nacht");
      return;
    }
    setzeAmbiente(ambienteFuerBild(view.art), leseTageszeit(view.held ?? held));
  }, [held, mode, view]);

  // Klangliche Antwort auf die Szene: erst der Wurf, dann sein Urteil.
  const sichtRef = useRef<SceneView | null>(null);
  sichtRef.current = view;
  const szenenKey = view ? `${view.textKey ?? ""}|${view.title}` : "";
  useEffect(() => {
    const szene = sichtRef.current;
    if (mode !== "play" || !szene || !szenenKey) return;
    if (szene.probe) {
      spieleKlang("wuerfel");
      const erfolg = szene.probe.erfolg;
      const urteil = window.setTimeout(() => spieleKlang(erfolg ? "erfolg" : "misserfolg"), 560);
      return () => window.clearTimeout(urteil);
    }
    if (szene.ending) {
      spieleKlang("ende");
      return;
    }
    if (szene.held && szene.held.lebend === false) {
      spieleKlang("tod");
      return;
    }
    spieleKlang("seite");
  }, [mode, szenenKey]);

  useEffect(() => {
    if (mode !== "play") {
      fokusStand.current = { bereit: false };
      setFokus([]);
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "play" || !view) return;
    const src = artSrcFor(view.art, view.artSrc, view.id);
    const stand = fokusStand.current;
    if (!stand.bereit) {
      fokusStand.current = { bereit: true, src, held: view.held ? cloneHeld(view.held) : null };
      setFokus([{ art: "bild", src, titel: view.title }]);
      return;
    }
    if (leiterOpen) {
      fokusStand.current = { bereit: true, src, held: view.held ? cloneHeld(view.held) : null };
      return;
    }
    const queue: FokusEintrag[] = [];
    if (src !== stand.src) queue.push({ art: "bild", src, titel: view.title });
    if (view.held) {
      queue.push(...wissenFokus(neuesWissen(stand.held, view.held)));
      queue.push(...kartenFokus(neueKarten(stand.held, view.held)));
      const quest = neueQuest(stand.held, view.held);
      if (quest) {
        const geschichte = questGeschichte(quest.quest, quest.wert);
        if (geschichte) queue.push(geschichte);
      }
    }
    fokusStand.current = { bereit: true, src, held: view.held ? cloneHeld(view.held) : null };
    if (queue.length) {
      if (queue.some((item) => item.art === "wissen")) spieleKlang("oeffnen");
      if (queue.some((item) => item.art === "quest")) spieleKlang("ende");
      setFokus((alt) => [...alt, ...queue]);
    }
  }, [leiterOpen, mode, view]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (!(query.has("welt") || query.has("gm") || query.has("spielleiter"))) return;
    if (leiterFrei()) {
      setzeWeltAktiv(true);
      setLeiterOpen(true);
    } else {
      setLeiterLogin(true);
    }
  }, []);

  useEffect(() => () => stopPlay(), [stopPlay]);

  useEffect(() => {
    if (mode !== "play" || !einstellungen.spiel.autospeichern) return;
    const current = view?.held ?? held;
    if (!current) return;
    const timer = window.setTimeout(() => {
      if (saveGame(current)) refreshSaves();
    }, 500);
    return () => window.clearTimeout(timer);
  }, [einstellungen.spiel.autospeichern, held, mode, refreshSaves, view?.held]);

  useEffect(() => {
    const quelle = view ?? introAlsSzene();
    const gefunden = auflageFuerSicht(quelle);
    setSchluessel(gefunden.schluessel);
    setPatch(gefunden.patch);
  }, [view]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLeiterOpen(false);
        setLeiterLogin(false);
        setSystemOffen(false);
        return;
      }
      if (event.altKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        requestLeiter();
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const ziel = event.target as HTMLElement | null;
      if (
        ziel &&
        (ziel.tagName === "TEXTAREA" || ziel.tagName === "INPUT" || ziel.isContentEditable)
      )
        return;
      const taste = event.key.toLowerCase();
      if (taste === "e") {
        event.preventDefault();
        setSystemOffen((offen) => !offen);
        return;
      }
      if (taste === "m") {
        event.preventDefault();
        const an = !leseEinstellungen().ton.an;
        setzeEinstellung("ton", { an });
        if (an) entsperreKlang();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const startAdventure = useCallback(
    (hero: Held, resume = false) => {
      stopPlay();
      const live = cloneHeld(hero);
      liveRef.current = live;
      setHeld(live);
      setSaveMessage(null);
      setKnowledgeOpen(false);
      setLageIndex(null);
      setLeiterOpen(weltAktiv() && leiterFrei());
      setMode("play");
      const runtime = new Runtime(setView, setHeld);
      runtimeRef.current = runtime;
      void spielen(runtime, live, resume)
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          if (runtimeRef.current === runtime) {
            if (liveRef.current) saveGame(liveRef.current);
            runtimeRef.current = null;
            liveRef.current = null;
            setHeld(null);
            setMode("title");
            setView(null);
            refreshSaves();
          }
        });
    },
    [refreshSaves, stopPlay],
  );

  const loadAdventure = useCallback(() => {
    const saved = loadGame();
    if (saved) startAdventure(saved, true);
    else refreshSaves();
  }, [refreshSaves, startAdventure]);

  const loadAdventureByName = useCallback(
    (name: string) => {
      const saved = loadGameByName(name);
      if (!saved) return false;
      startAdventure(saved, true);
      return true;
    },
    [startAdventure],
  );

  const importAdventure = useCallback(
    (roh: string) => {
      const saved = importiereSpielstand(roh);
      if (!saved) {
        setSaveMessage("Die Datei ist kein gültiger Spielstand.");
        return false;
      }
      refreshSaves();
      startAdventure(saved, true);
      return true;
    },
    [refreshSaves, startAdventure],
  );

  const saveCurrentGame = useCallback(() => {
    const current = view?.held ?? held;
    if (current && saveGame(current)) {
      refreshSaves();
      spieleKlang("speichern");
      setSaveMessage(`Gespeichert unter „${current.name}“. Derselbe Name lädt den Stand.`);
    } else {
      spieleKlang("fehler");
      setSaveMessage("Speichern war in diesem Browser nicht möglich.");
    }
  }, [held, refreshSaves, view]);

  const onPatch = useCallback(
    (next: KartePatch) => {
      setPatch(next);
      if (!schluessel) {
        setSaveMessage("Kein Kartenschlüssel — Text nur in diesem Bildschirm.");
        return;
      }
      if (!merkeAuflage(schluessel, next, view?.original ?? view ?? undefined)) {
        setSaveMessage("Auflage zu groß für diesen Browser. Hol die JSON-Datei unter Prüfen.");
      }
    },
    [schluessel, view],
  );

  const onResetKarte = useCallback(() => {
    setPatch({});
    if (schluessel) loescheAuflage(schluessel);
  }, [schluessel]);

  const onRueckgaengig = useCallback(() => {
    if (!schluessel) return;
    const restored = rueckgaengigAuflage(schluessel);
    if (restored) setPatch(restored);
  }, [schluessel]);

  const fokusWeiter = useCallback(() => {
    setFokus((rest) => rest.slice(1));
  }, []);

  const onEffekt = useCallback((id: EffektId, an: boolean) => {
    const live = liveRef.current;
    if (!live) return;
    const cmd = { art: "effekt" as const, id, an };
    vorschauGmCommand(cmd);
    const next = wendeGmCommandAn(live, cmd);
    liveRef.current = next;
    setHeld(next);
    setView((current) => (current ? { ...current, held: next } : current));
  }, []);

  const onTageszeit = useCallback((zeit: Tageszeit) => {
    const live = liveRef.current;
    if (!live) return;
    const cmd = { art: "tageszeit" as const, zeit };
    vorschauGmCommand(cmd);
    const next = wendeGmCommandAn(live, cmd);
    liveRef.current = next;
    setHeld(next);
    setView((current) => (current ? { ...current, held: next } : current));
  }, []);

  const onHerkunft = useCallback((frageIndex: number, antwortIndex: number) => {
    const live = liveRef.current;
    if (!live) return;
    const getroffen = wendeHerkunftAn(live, frageIndex, antwortIndex, sichtbareHerkunft());
    if (!getroffen) return;
    const next = cloneHeld(live);
    setHeld(next);
    setView((current) => (current ? { ...current, held: next } : current));
    setLageIndex(null);
  }, []);

  const onLageVorlegen = useCallback((frageIndex: number) => {
    setLageIndex(frageIndex);
    setLeiterOpen(false);
  }, []);

  useEffect(() => {
    const live = liveRef.current;
    if (!live) return;
    let changed = false;
    for (const id of kartenFortRef.current) {
      if (hatEffekt(live, id)) {
        setzeEffekt(live, id, false);
        changed = true;
      }
    }
    for (const id of patch.effekte ?? []) {
      if (!hatEffekt(live, id)) {
        setzeEffekt(live, id, true);
        changed = true;
      }
    }
    kartenFortRef.current = patch.effekteFort ?? [];
    if (!changed) return;
    const next = cloneHeld(live);
    setHeld(next);
    setView((current) => (current ? { ...current, held: next } : current));
  }, [patch.effekte, patch.effekteFort, view?.textKey]);

  function requestLeiter() {
    setLeiterOpen((open) => {
      if (open) return false;
      if (leiterFrei()) {
        setzeWeltAktiv(true);
        return true;
      }
      setLeiterLogin(true);
      return false;
    });
  }

  const rawSicht = view ? (view.held ? view : held ? { ...view, held } : view) : introAlsSzene();
  const gefunden = auflageFuerSicht(rawSicht);
  const kartenPatch = gefunden.schluessel === schluessel ? patch : gefunden.patch;

  const welt = leiterOpen ? (
    <WeltEditor
      szene={rawSicht}
      auflage={kartenPatch}
      schluessel={gefunden.schluessel}
      held={view?.held ?? held}
      onChange={onPatch}
      onReset={onResetKarte}
      onClose={() => setLeiterOpen(false)}
      onEffekt={onEffekt}
      onLage={onLageVorlegen}
      onRueckgaengig={onRueckgaengig}
      onTageszeit={onTageszeit}
      startFach={mode === "create" ? "held" : "karte"}
      onLadeSpieler={(name) => {
        loadAdventureByName(name);
      }}
      onSpielerGeaendert={refreshSaves}
    />
  ) : null;
  const system = systemOffen ? <Systemsteuerung onClose={() => setSystemOffen(false)} /> : null;
  const oeffneSystem = () => {
    entsperreKlang();
    spieleKlang("oeffnen");
    setSystemOffen(true);
  };
  const login = leiterLogin ? (
    <LeiterLogin
      onOk={() => {
        setzeWeltAktiv(true);
        setLeiterLogin(false);
        setLeiterOpen(true);
      }}
      onClose={() => setLeiterLogin(false)}
    />
  ) : null;

  if (mode === "title") {
    return (
      <>
        <TitleScreen
          onStart={() => setMode("create")}
          onRules={() => setMode("rules")}
          onLoad={loadAdventure}
          onLoadName={loadAdventureByName}
          canLoad={canLoad}
          slots={slots}
          onWelt={requestLeiter}
          onImport={importAdventure}
          onSystem={oeffneSystem}
        />
        {welt}
        {login}
        {system}
      </>
    );
  }
  if (mode === "rules") {
    return (
      <>
        <RulesScreen
          onBack={() => setMode("title")}
          onWelt={requestLeiter}
          onSystem={oeffneSystem}
        />
        {welt}
        {login}
        {system}
      </>
    );
  }
  if (mode === "create") {
    return (
      <>
        <CreateHero
          onReady={startAdventure}
          onBack={() => setMode("title")}
          onWelt={requestLeiter}
          onLoadName={loadAdventureByName}
          onSystem={oeffneSystem}
        />
        {welt}
        {login}
        {system}
      </>
    );
  }

  if (!view) {
    return (
      <>
        <div className="flex min-h-dvh items-center justify-center bg-bg text-muted-fg">
          Der Wald hält den Atem an…
        </div>
        {welt}
        {login}
        {system}
      </>
    );
  }

  const raw = rawSicht;
  const shown = wendePatchAn(raw, kartenPatch);

  return (
    <>
      <SceneStage
        view={shown}
        original={raw}
        onChoose={(index) => {
          spieleKlang("wahl");
          runtimeRef.current?.choose(index);
        }}
        onSystem={oeffneSystem}
        onSave={saveCurrentGame}
        saveMessage={saveMessage}
        onKnowledge={() => setKnowledgeOpen((open) => !open)}
        knowledgeOpen={knowledgeOpen}
        debug={debug}
        leiterOpen={leiterOpen}
        patch={kartenPatch}
        schluessel={gefunden.schluessel}
        onLeiter={requestLeiter}
        onPatch={onPatch}
        onResetKarte={onResetKarte}
        onRueckgaengig={onRueckgaengig}
        authorMode={leiterOpen}
        wissenAnzahl={shown.held ? wissenTafeln(shown.held).filter((t) => !t.offen).length : 0}
        weltAnzahl={anzahlAuflagen()}
        weltPunkt={!auflageLeer(kartenPatch)}
        onEffekt={onEffekt}
        onTageszeit={onTageszeit}
        onProbe={(ergebnis) => {
          spieleKlang(ergebnis.erfolg ? "erfolg" : "misserfolg");
          setView((current) => (current ? { ...current, probe: ergebnis } : current));
        }}
        onHerkunft={onHerkunft}
        onLageVorlegen={onLageVorlegen}
        lageIndex={lageIndex}
        onLageAntwort={(antwortIndex) => {
          if (lageIndex === null) return;
          onHerkunft(lageIndex, antwortIndex);
        }}
        onLageSchliessen={() => setLageIndex(null)}
      />
      {fokus[0] ? <Fokus eintrag={fokus[0]} onWeiter={fokusWeiter} /> : null}
      {welt}
      {login}
      {system}
    </>
  );
}
