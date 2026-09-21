import { useCallback, useEffect, useRef, useState } from "react";
import { Runtime } from "@/game/runtime";
import { spielen } from "@/game/script";
import { ART, LAGEN_ART, PORTRAITS } from "@/game/art";
import { cloneHeld, type EffektId, type Held, type SceneView } from "@/game/types";
import { hasSavedGame, importiereSpielstand, listSavedGames, loadGame, loadGameByName, saveGame, type SaveSlotInfo } from "@/game/save";
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
import { deriveKnowledge } from "@/game/knowledge";
import { loadFilePack } from "@/game/text-pack";
import { introAlsSzene } from "@/game/content";
import { CreateHero } from "./CreateHero";
import { RulesScreen } from "./RulesScreen";
import { SceneStage } from "./SceneStage";
import { TitleScreen } from "./TitleScreen";
import { leiterFrei } from "@/game/leiter-login";
import { LeiterLogin } from "./LeiterLogin";
import { WeltEditor } from "@/components/welt/WeltEditor";

type Mode = "title" | "rules" | "create" | "play";

export function GameApp() {
  const [mode, setMode] = useState<Mode>("title");
  const [view, setView] = useState<SceneView | null>(null);
  const [held, setHeld] = useState<Held | null>(null);
  const [slots, setSlots] = useState<SaveSlotInfo[]>(() => listSavedGames());
  const [canLoad, setCanLoad] = useState(() => hasSavedGame());
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [debug] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug"));
  const [leiterOpen, setLeiterOpen] = useState(false);
  const [leiterLogin, setLeiterLogin] = useState(false);
  const [patch, setPatch] = useState<KartePatch>({});
  const [schluessel, setSchluessel] = useState("");
  const [lageIndex, setLageIndex] = useState<number | null>(null);
  const runtimeRef = useRef<Runtime | null>(null);
  const liveRef = useRef<Held | null>(null);
  const kartenFortRef = useRef<EffektId[]>([]);

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
    for (const src of [...Object.values(ART), ...Object.values(PORTRAITS), ...Object.values(LAGEN_ART)]) {
      const image = new Image();
      image.src = src;
    }
  }, []);

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
    if (mode !== "play") return;
    const current = view?.held ?? held;
    if (!current) return;
    const timer = window.setTimeout(() => {
      if (saveGame(current)) refreshSaves();
    }, 500);
    return () => window.clearTimeout(timer);
  }, [held, mode, refreshSaves, view?.held]);

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
        return;
      }
      if (!(event.altKey && event.key.toLowerCase() === "s")) return;
      event.preventDefault();
      requestLeiter();
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
      setSaveMessage(`Gespeichert unter „${current.name}“. Derselbe Name lädt den Stand.`);
    } else {
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
        />
        {welt}
        {login}
      </>
    );
  }
  if (mode === "rules") {
    return (
      <>
        <RulesScreen onBack={() => setMode("title")} onWelt={requestLeiter} />
        {welt}
        {login}
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
        />
        {welt}
        {login}
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
      onChoose={(index) => runtimeRef.current?.choose(index)}
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
      wissenAnzahl={shown.held ? deriveKnowledge(shown.held).size : 0}
      weltAnzahl={anzahlAuflagen()}
      weltPunkt={!auflageLeer(kartenPatch)}
      onEffekt={onEffekt}
      onTageszeit={onTageszeit}
      onHerkunft={onHerkunft}
      onLageVorlegen={onLageVorlegen}
      lageIndex={lageIndex}
      onLageAntwort={(antwortIndex) => {
        if (lageIndex === null) return;
        onHerkunft(lageIndex, antwortIndex);
      }}
      onLageSchliessen={() => setLageIndex(null)}
    />
    {welt}
    {login}
    </>
  );
}
