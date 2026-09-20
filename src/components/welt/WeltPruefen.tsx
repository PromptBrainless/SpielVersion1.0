import { lazy, Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { pruefeAssets } from "@/game/editor-assets";
import { FLUSS, knoten, toteFlussKnoten, unbekannteKanten } from "@/game/editor-fluss";
import { QUEST_PFADE, probePfad } from "@/game/editor-quests";
import { lagerToteKnoten } from "@/game/testTools";
import { auflageLeer, kanonDiff, WeltAuflageSchema, type WeltAuflage } from "@/game/welt";
import { knowledgeLabels } from "@/game/knowledge";
import { modulFuerSzene, moduleDerSzene, modulNachSchluessel } from "@/game/szenen-katalog";
import { entwerfeSzene, legeKanonAufGithub } from "@/game/werkstatt.server";
import { redirectToLoginIfRequired } from "@/lib/app-data";
import type { Held, SceneView } from "@/game/types";

const JsonMonaco = lazy(() => import("./JsonMonaco"));

type Quelle = string;

function speichere(name: string, inhalt: string) {
  const blob = new Blob([inhalt], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

async function mitLimit<T>(arbeit: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      arbeit,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function WeltPruefen({
  szene,
  auflage,
  schluessel = "",
  held = null,
  onChange,
  seite = false,
}: {
  szene: SceneView | null;
  auflage: WeltAuflage;
  schluessel?: string;
  held?: Held | null;
  onChange?: (next: WeltAuflage) => void;
  seite?: boolean;
}) {
  const haupt = modulFuerSzene(szene);
  const [netz, setNetz] = useState<string[] | null>(null);
  const [bilder, setBilder] = useState<string[] | null>(null);
  const [questId, setQuestId] = useState(QUEST_PFADE[0]!.id);
  const [quest, setQuest] = useState<string[] | null>(null);
  const [ort, setOrt] = useState("intro-weg");
  const [importMeldung, setImportMeldung] = useState<string | null>(null);
  const [codeOffen, setCodeOffen] = useState(seite);
  const [quelle, setQuelle] = useState<Quelle>(haupt.schluessel);
  const [code, setCode] = useState(() => haupt.inhalt(szene, auflage));
  const [busy, setBusy] = useState<"entwurf" | "github" | null>(null);
  const kanon = szene?.original ?? (szene ? { title: szene.title, lines: szene.lines, choices: szene.choices } : null);
  const diff = kanon ? kanonDiff(kanon, auflage) : null;
  const aktueller = knoten(ort);
  const datei = (modulNachSchluessel(quelle, szene) ?? haupt).datei;

  useEffect(() => {
    const next = modulFuerSzene(szene);
    setQuelle(next.schluessel);
    setCode(next.inhalt(szene, auflage));
    setImportMeldung(null);
  }, [szene?.id, szene?.textKey]);

  function ladeQuelle(next: Quelle) {
    const modul = modulNachSchluessel(next, szene) ?? modulFuerSzene(szene);
    setQuelle(modul.schluessel);
    setCode(modul.inhalt(szene, auflage));
    setImportMeldung(null);
  }

  return (
    <div>
      <Button
        type="button"
        variant="secondary"
        className="h-9 px-3 text-xs"
        onClick={() => {
          const tot = toteFlussKnoten();
          const kanten = unbekannteKanten();
          const lager = lagerToteKnoten();
          setNetz([
            tot.length ? `Tote Knoten: ${tot.join(", ")}` : "Keine toten Knoten im Prüfgraph.",
            kanten.length ? `Kanten: ${kanten.join(", ")}` : "Alle Kanten existieren.",
            lager.length ? `Lager tot: ${lager.join(", ")}` : "Lager: jeder Weg hängt am Hub.",
          ]);
        }}
      >
        Netz
      </Button>
      {netz ? (
        <ul className="mt-2 text-sm">
          {netz.map((z) => (
            <li key={z}>{z}</li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-xs text-muted-fg">Fluss — keine Partie</p>
      <p className="font-display text-lg">{aktueller?.titel ?? ort}</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {(aktueller?.weiter ?? []).map((kante) => (
          <Button key={kante.id} variant="secondary" className="h-9 px-2 text-xs" onClick={() => setOrt(kante.id)}>
            {kante.label}
          </Button>
        ))}
      </div>
      <button type="button" className="mt-1 text-xs text-muted-fg" onClick={() => setOrt("intro-weg")}>
        Von vorn
      </button>
      <p className="mt-1 text-xs text-subtle-fg">{FLUSS.length} Orte im Prüfgraph</p>

      <p className="mt-3 text-xs text-muted-fg">Questpfad</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {QUEST_PFADE.map((item) => (
          <Button key={item.id} variant={questId === item.id ? "default" : "secondary"} className="h-9 px-2 text-xs" onClick={() => setQuestId(item.id)}>
            {item.titel}
          </Button>
        ))}
      </div>
      <Button
        type="button"
        className="mt-2 h-9 px-3 text-xs"
        onClick={() => {
          const fund = probePfad(questId);
          setQuest(fund.sicher.length ? fund.sicher : ["Kein Journal-Satz."]);
        }}
      >
        Pfad legen
      </Button>
      {quest ? (
        <ul className="mt-2 space-y-1 text-sm text-ok">
          {quest.map((z) => (
            <li key={z}>{z}</li>
          ))}
        </ul>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        className="mt-3 h-9 px-3 text-xs"
        onClick={async () => {
          const liste = await pruefeAssets();
          setBilder(
            liste.map((item) =>
              item.hinweis
                ? `${item.art} ${item.schluessel}: ${item.ok ? "da" : "fehlt"} — ${item.hinweis}`
                : `${item.art} ${item.schluessel}: ${item.ok ? "da" : "fehlt"}`,
            ),
          );
        }}
      >
        Bilder
      </Button>
      {bilder ? (
        <ul className="mt-2 text-xs">
          {bilder.map((z) => (
            <li key={z}>{z}</li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-xs text-muted-fg">
        JSON — {datei}
        {szene?.id ? ` · ${szene.id}` : ""}
      </p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {moduleDerSzene(szene).map((modul) => (
          <Button
            key={modul.schluessel}
            variant={quelle === modul.schluessel ? "default" : "secondary"}
            className="h-9 px-2 text-xs"
            onClick={() => ladeQuelle(modul.schluessel)}
          >
            {modul.label}
          </Button>
        ))}
        <Button variant={codeOffen ? "default" : "secondary"} className="h-9 px-2 text-xs" onClick={() => setCodeOffen((an) => !an)}>
          {codeOffen ? "Editor zu" : "Editor"}
        </Button>
      </div>
      {codeOffen ? (
        <div className="mt-2">
          <Suspense fallback={<p className="text-xs text-muted-fg">Editor lädt…</p>}>
            <JsonMonaco wert={code} onChange={setCode} hoehe={seite ? "28rem" : "16rem"} />
          </Suspense>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              className="h-9 px-3 text-xs"
              onClick={() => {
                try {
                  const modul = modulNachSchluessel(quelle, szene) ?? modulFuerSzene(szene);
                  modul.pruefen(code);
                  setImportMeldung(`Gültig · ${modul.datei}`);
                  if ((quelle === "auflage" || quelle === "szene") && onChange) {
                    const roh = JSON.parse(code) as WeltAuflage;
                    onChange(WeltAuflageSchema.parse({
                      title: roh.title,
                      lines: roh.lines,
                      choices: roh.choices,
                      art: roh.art,
                      portrait: roh.portrait,
                    }) as WeltAuflage);
                    setImportMeldung("Gültig. Als Auflage gemerkt.");
                  }
                } catch (fehler) {
                  setImportMeldung(fehler instanceof Error ? fehler.message : "ungenau");
                }
              }}
            >
              Prüfen
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-9 px-3 text-xs"
              onClick={() => speichere(datei, code)}
            >
              Holen
            </Button>
            <label className="inline-flex h-9 cursor-pointer items-center rounded-md border border-border bg-surface-2 px-3 text-xs text-fg">
              Datei
              <input
                type="file"
                accept="application/json"
                className="sr-only"
                onChange={async (event) => {
                  const dateiEingang = event.target.files?.[0];
                  event.target.value = "";
                  if (!dateiEingang) return;
                  const roh = await dateiEingang.text();
                  setCode(roh);
                  setCodeOffen(true);
                  try {
                    (modulNachSchluessel(quelle, szene) ?? modulFuerSzene(szene)).pruefen(roh);
                    setImportMeldung(`${dateiEingang.name}: gültig.`);
                  } catch (fehler) {
                    setImportMeldung(`${dateiEingang.name}: ${fehler instanceof Error ? fehler.message : "ungenau"}`);
                  }
                }}
              />
            </label>
          </div>
        </div>
      ) : null}
      {importMeldung ? <p className="mt-2 text-xs text-muted-fg">{importMeldung}</p> : null}

      <p className="mt-3 text-xs text-muted-fg">Entwurf — nur Werkstatt, nie im Spiel</p>
      <div className="mt-1 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          className="h-9 px-3 text-xs"
          disabled={!szene || busy !== null}
          onClick={async () => {
            if (!szene) return;
            setBusy("entwurf");
            setImportMeldung("Entwurf läuft…");
            try {
              const wissen = held ? knowledgeLabels(held).sicher : [];
              const fund = await mitLimit(
                entwerfeSzene({
                  data: {
                    title: szene.title,
                    lines: szene.lines,
                    choices: szene.choices,
                    wissen,
                  },
                }),
                20_000,
                { ok: false as const, error: "Zeitüberschreitung. Entwurf abgebrochen." },
              );
              if (!fund.ok) {
                setImportMeldung(fund.error);
                return;
              }
              setQuelle("szene");
              setCodeOffen(true);
              setCode(JSON.stringify({ title: fund.title, lines: fund.lines, choices: fund.choices }, null, 2));
              setImportMeldung("Entwurf. Lesen, dann Prüfen. Nicht Kanon.");
            } finally {
              setBusy(null);
            }
          }}
        >
          {busy === "entwurf" ? "…" : "Szene entwerfen"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-9 px-3 text-xs"
          disabled={!szene || busy !== null || auflageLeer(auflage)}
          onClick={async () => {
            setBusy("github");
            setImportMeldung("GitHub…");
            try {
              const fund = await legeKanonAufGithub({
                data: { schluessel: schluessel || szene?.id || szene?.title || "karte", inhalt: JSON.stringify(auflage) },
              });
              if ("loginRequired" in fund && fund.loginRequired) {
                redirectToLoginIfRequired({
                  ok: false,
                  data: null,
                  loginRequired: true,
                  loginUrl: "loginUrl" in fund ? fund.loginUrl : undefined,
                });
                setImportMeldung("GitHub anmelden, dann noch einmal.");
                return;
              }
              if (!fund.ok) {
                setImportMeldung(fund.error);
                return;
              }
              setImportMeldung(`Auf GitHub: ${fund.pfad}. Noch nicht im Spiel.`);
            } finally {
              setBusy(null);
            }
          }}
        >
          {busy === "github" ? "…" : "An GitHub"}
        </Button>
      </div>

      {diff ? (
        <div className="mt-3 rounded-md border border-border px-2 py-2 text-xs text-muted-fg">
          <p>In den Kanon — nur Anzeige, kein Schreiben.</p>
          {diff.titel || diff.zeilen.length || diff.wahlen.length ? (
            <>
              {diff.titel ? <p>Titel weicht ab.</p> : null}
              {diff.zeilen.slice(0, 6).map((z, i) => (
                <p key={i}>
                  − {z.kanon || "—"}
                  <br />+ {z.auflage || "—"}
                </p>
              ))}
            </>
          ) : (
            <p>Diese Karte gleicht dem Kanon.</p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-fg">Kanon-Diff braucht eine offene Szene.</p>
      )}
    </div>
  );
}
