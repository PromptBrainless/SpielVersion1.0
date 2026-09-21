import { useEffect, useId, useRef, useState } from "react";
import {
  Download,
  Eye,
  Gamepad2,
  HardDrive,
  RotateCcw,
  Trash2,
  Type,
  Volume2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BEWEGUNG_NAME,
  TEXTGROESSE_NAME,
  setzeEinstellung,
  setzeZurueck,
  type Bewegung,
  type Schriftart,
  type Textgroesse,
} from "@/game/einstellungen";
import { useEinstellungen } from "@/game/use-einstellungen";
import { entsperreKlang, spieleKlang } from "@/game/klang";
import {
  clearSavedGameForName,
  exportiereSpielstand,
  leseSpielstand,
  listSavedGameDetails,
  type SaveSlotDetail,
} from "@/game/save";

type Fach = "ton" | "bild" | "text" | "spiel" | "staende";

const FAECHER: Array<{ id: Fach; name: string; Symbol: typeof Volume2 }> = [
  { id: "ton", name: "Ton", Symbol: Volume2 },
  { id: "bild", name: "Bild", Symbol: Eye },
  { id: "text", name: "Text", Symbol: Type },
  { id: "spiel", name: "Spiel", Symbol: Gamepad2 },
  { id: "staende", name: "Stände", Symbol: HardDrive },
];

export function Systemsteuerung({ onClose }: { onClose: () => void }) {
  const e = useEinstellungen();
  const [fach, setFach] = useState<Fach>("ton");
  const rahmen = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey, true);
    rahmen.current?.focus();
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 overflow-y-auto bg-bg/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="systemsteuerung-titel"
    >
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-3 py-4 sm:px-5 sm:py-8">
        <div
          ref={rahmen}
          tabIndex={-1}
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-ink/95 shadow-lg outline-none sm:flex-none"
        >
          <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.22em] text-accent">Systemsteuerung</p>
              <h2
                id="systemsteuerung-titel"
                className="font-display text-xl font-semibold tracking-tight"
              >
                Einstellungen
              </h2>
            </div>
            <Button
              variant="ghost"
              className="h-11 shrink-0 px-3 text-sm"
              onClick={onClose}
              aria-label="Einstellungen schließen"
            >
              <X className="size-4" aria-hidden />
              <span className="hidden sm:inline">Schließen</span>
            </Button>
          </header>

          <nav
            className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2"
            aria-label="Bereiche"
          >
            {FAECHER.map(({ id, name, Symbol }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setFach(id);
                  spieleKlang("zeiger");
                }}
                aria-current={fach === id}
                className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-sm px-3 text-sm transition-colors duration-[var(--motion-quick)] ${
                  fach === id
                    ? "bg-surface-2 text-fg"
                    : "text-muted-fg hover:bg-surface/70 hover:text-fg"
                }`}
              >
                <Symbol className="size-4" aria-hidden />
                {name}
              </button>
            ))}
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {fach === "ton" ? <FachTon /> : null}
            {fach === "bild" ? <FachBild /> : null}
            {fach === "text" ? <FachText /> : null}
            {fach === "spiel" ? <FachSpiel /> : null}
            {fach === "staende" ? <FachStaende /> : null}
          </div>

          <footer className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-fg">
              {e.ton.an ? "Ton an" : "Ton aus"} · {TEXTGROESSE_NAME[e.optik.textgroesse]} · Bewegung{" "}
              {BEWEGUNG_NAME[e.optik.bewegung].toLocaleLowerCase("de-DE")}
            </p>
            <Button
              variant="ghost"
              className="h-10 px-3 text-xs"
              onClick={() => {
                setzeZurueck();
                spieleKlang("schliessen");
              }}
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Zurücksetzen
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Fächer

function FachTon() {
  const { ton } = useEinstellungen();
  return (
    <Gruppe titel="Ton" hinweis="Alle Klänge entstehen im Browser. Es wird nichts geladen.">
      <Schalter
        name="Ton an"
        hinweis="Wind, Wasser, Feuer und kurze Rückmeldungen."
        an={ton.an}
        onChange={(an) => {
          setzeEinstellung("ton", { an });
          if (an) {
            entsperreKlang();
            window.setTimeout(() => spieleKlang("oeffnen"), 60);
          }
        }}
      />
      <Regler
        name="Gesamt"
        wert={ton.gesamt}
        aus={!ton.an}
        onChange={(gesamt) => setzeEinstellung("ton", { gesamt })}
        onFertig={() => spieleKlang("wahl")}
      />
      <Regler
        name="Umgebung"
        hinweis="Der Ort selbst — Wind, Tropfen, Hammer, Stimmen."
        wert={ton.ambiente}
        aus={!ton.an}
        onChange={(ambiente) => setzeEinstellung("ton", { ambiente })}
      />
      <Regler
        name="Rückmeldungen"
        hinweis="Würfel, Wahl, Speichern, Treffer."
        wert={ton.effekte}
        aus={!ton.an}
        onChange={(effekte) => setzeEinstellung("ton", { effekte })}
        onFertig={() => spieleKlang("wuerfel")}
      />
      <div className="flex flex-wrap gap-2 pt-1">
        {(["wuerfel", "erfolg", "misserfolg", "seite", "treffer"] as const).map((name) => (
          <Button
            key={name}
            variant="secondary"
            className="h-9 px-3 text-xs"
            disabled={!ton.an}
            onClick={() => {
              entsperreKlang();
              spieleKlang(name);
            }}
          >
            {name === "wuerfel"
              ? "Würfel"
              : name === "erfolg"
                ? "Erfolg"
                : name === "misserfolg"
                  ? "Misserfolg"
                  : name === "seite"
                    ? "Seite"
                    : "Treffer"}
          </Button>
        ))}
      </div>
    </Gruppe>
  );
}

function FachBild() {
  const { optik } = useEinstellungen();
  return (
    <>
      <Gruppe
        titel="Bewegung"
        hinweis="Weniger Bewegung hilft bei Übelkeit und schont schwache Geräte."
      >
        <Auswahl
          name="Bewegung"
          wert={optik.bewegung}
          werte={(["voll", "wenig", "aus"] as Bewegung[]).map((id) => ({
            id,
            name: BEWEGUNG_NAME[id],
          }))}
          onChange={(bewegung) => setzeEinstellung("optik", { bewegung })}
        />
        <Schalter
          name="Langsamer Bildzug"
          hinweis="Der Hintergrund wandert unmerklich."
          an={optik.kenBurns}
          aus={optik.bewegung === "aus"}
          onChange={(kenBurns) => setzeEinstellung("optik", { kenBurns })}
        />
      </Gruppe>
      <Gruppe titel="Bild">
        <Regler
          name="Bildhöhe"
          hinweis="Wie viel Platz das Szenenbild einnimmt."
          wert={optik.bildhoehe}
          klein={0.6}
          gross={1.3}
          schritt={0.05}
          format={(wert) => `${Math.round(wert * 100)} %`}
          onChange={(bildhoehe) => setzeEinstellung("optik", { bildhoehe })}
        />
        <Schalter
          name="Randabdunklung"
          hinweis="Dunkle Ecken führen den Blick zur Mitte."
          an={optik.vignette}
          onChange={(vignette) => setzeEinstellung("optik", { vignette })}
        />
        <Schalter
          name="Körnung"
          hinweis="Feines Korn über dem Bild, wie alte Ölmalerei."
          an={optik.koernung}
          onChange={(koernung) => setzeEinstellung("optik", { koernung })}
        />
        <Schalter
          name="Tageszeit-Schleier"
          hinweis="Nacht und Dämmerung färben die Szene."
          an={optik.schleier}
          onChange={(schleier) => setzeEinstellung("optik", { schleier })}
        />
      </Gruppe>
    </>
  );
}

function FachText() {
  const { optik } = useEinstellungen();
  return (
    <>
      <Gruppe titel="Schrift" hinweis="Gilt für die ganze Oberfläche.">
        <Auswahl
          name="Textgröße"
          wert={optik.textgroesse}
          werte={(["klein", "normal", "gross", "riesig"] as Textgroesse[]).map((id) => ({
            id,
            name: TEXTGROESSE_NAME[id],
          }))}
          onChange={(textgroesse) => setzeEinstellung("optik", { textgroesse })}
        />
        <Auswahl
          name="Schriftart"
          wert={optik.schriftart}
          werte={[
            { id: "serif" as Schriftart, name: "Serifen" },
            { id: "gut-lesbar" as Schriftart, name: "Gut lesbar" },
          ]}
          onChange={(schriftart) => setzeEinstellung("optik", { schriftart })}
        />
        <Regler
          name="Zeilenabstand"
          wert={optik.zeilenabstand}
          klein={1.3}
          gross={2.1}
          schritt={0.05}
          format={(wert) => wert.toFixed(2)}
          onChange={(zeilenabstand) => setzeEinstellung("optik", { zeilenabstand })}
        />
        <Auswahl
          name="Kontrast"
          wert={optik.kontrast}
          werte={[
            { id: "normal" as const, name: "Normal" },
            { id: "hoch" as const, name: "Hoch" },
          ]}
          onChange={(kontrast) => setzeEinstellung("optik", { kontrast })}
        />
      </Gruppe>
      <div className="rounded-md border border-border bg-surface/60 px-4 py-3">
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-fg">Probe</p>
        <p className="leading-[var(--zeilenabstand)]">
          Der Regen steht über dem Tal wie eine Entscheidung, die niemand treffen will. Am Brunnen
          zählt eine Frau Eimer, die es nicht mehr gibt.
        </p>
      </div>
    </>
  );
}

function FachSpiel() {
  const { spiel } = useEinstellungen();
  return (
    <>
      <Gruppe titel="Spiel">
        <Schalter
          name="Autospeichern"
          hinweis="Nach jeder Szene, im Namensfach des Helden."
          an={spiel.autospeichern}
          onChange={(autospeichern) => setzeEinstellung("spiel", { autospeichern })}
        />
        <Schalter
          name="Wahl per Zifferntaste"
          hinweis="1 bis 9 wählt direkt."
          an={spiel.ziffernwahl}
          onChange={(ziffernwahl) => setzeEinstellung("spiel", { ziffernwahl })}
        />
        <Schalter
          name="Tastenhinweise zeigen"
          hinweis="Die Ziffer steht vor jeder Wahl."
          an={spiel.tastenhinweise}
          onChange={(tastenhinweise) => setzeEinstellung("spiel", { tastenhinweise })}
        />
        <Schalter
          name="Proben erklären"
          hinweis="Wurf, Bonus und Schwelle im Klartext."
          an={spiel.probeErklaeren}
          onChange={(probeErklaeren) => setzeEinstellung("spiel", { probeErklaeren })}
        />
      </Gruppe>
      <Gruppe titel="Tasten">
        <dl className="grid gap-1.5 text-sm">
          {[
            ["1 – 9", "Wahl treffen"],
            ["Enter", "Weiter, wenn es nur einen Weg gibt"],
            ["E", "Einstellungen"],
            ["M", "Ton stumm oder laut"],
            ["Esc", "Überlagerung schließen"],
            ["Alt + S", "Weltwerkzeug"],
          ].map(([taste, zweck]) => (
            <div
              key={taste}
              className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-1.5"
            >
              <dt className="font-mono text-xs text-accent">{taste}</dt>
              <dd className="text-right text-muted-fg">{zweck}</dd>
            </div>
          ))}
        </dl>
      </Gruppe>
    </>
  );
}

function FachStaende() {
  const [staende, setStaende] = useState<SaveSlotDetail[]>(() => listSavedGameDetails());
  const [meldung, setMeldung] = useState<string | null>(null);

  function lade() {
    setStaende(listSavedGameDetails());
  }

  function hole(name: string) {
    const held = leseSpielstand(name);
    if (!held) {
      setMeldung("Dieser Stand ließ sich nicht lesen.");
      return;
    }
    const blob = new Blob([exportiereSpielstand(held)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lindendorf-${name.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    spieleKlang("speichern");
    setMeldung(`„${name}“ als Datei geholt.`);
  }

  return (
    <Gruppe
      titel="Spielstände"
      hinweis="Die Stände liegen nur in diesem Browser. Eine Datei überlebt ihn."
    >
      {staende.length === 0 ? (
        <p className="text-sm text-muted-fg">Noch kein Stand gespeichert.</p>
      ) : (
        <ul className="grid gap-2">
          {staende.map((stand) => (
            <li
              key={stand.nameKey}
              className="rounded-md border border-border bg-surface/60 px-3 py-2.5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate font-display text-base font-semibold">{stand.name}</p>
                <p className="shrink-0 text-xs tabular-nums text-muted-fg">
                  {new Date(stand.savedAt).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <p className="mt-0.5 text-xs text-muted-fg tabular-nums">
                {stand.lebend ? `LP ${stand.lp}` : "gefallen"} · {stand.gold} Gold · {stand.log}{" "}
                Entscheidungen
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  variant="secondary"
                  className="h-9 px-3 text-xs"
                  onClick={() => hole(stand.name)}
                >
                  <Download className="size-3.5" aria-hidden />
                  Datei
                </Button>
                <Button
                  variant="ghost"
                  className="h-9 px-3 text-xs text-hp hover:bg-hp/10"
                  onClick={() => {
                    if (!window.confirm(`„${stand.name}“ endgültig löschen?`)) return;
                    clearSavedGameForName(stand.name);
                    lade();
                    spieleKlang("schliessen");
                    setMeldung(`„${stand.name}“ gelöscht.`);
                  }}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Löschen
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {meldung ? <p className="text-xs text-accent">{meldung}</p> : null}
    </Gruppe>
  );
}

// ---------------------------------------------------------------- Bausteine

function Gruppe({
  titel,
  hinweis,
  children,
}: {
  titel: string;
  hinweis?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 last:mb-0">
      <h3 className="font-display text-lg font-semibold tracking-tight">{titel}</h3>
      {hinweis ? (
        <p className="mb-3 mt-0.5 text-xs text-muted-fg">{hinweis}</p>
      ) : (
        <div className="mb-3" />
      )}
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Schalter({
  name,
  hinweis,
  an,
  aus,
  onChange,
}: {
  name: string;
  hinweis?: string;
  an: boolean;
  aus?: boolean;
  onChange: (an: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={an}
      disabled={aus}
      onClick={() => onChange(!an)}
      className="flex w-full items-center justify-between gap-4 rounded-md border border-border bg-surface/50 px-3 py-2.5 text-left transition-colors duration-[var(--motion-quick)] hover:bg-surface-2 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="min-w-0">
        <span className="block text-sm text-fg">{name}</span>
        {hinweis ? <span className="mt-0.5 block text-xs text-muted-fg">{hinweis}</span> : null}
      </span>
      <span
        aria-hidden
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-[var(--motion-fast)] ${
          an ? "border-accent bg-accent/80" : "border-border bg-surface-2"
        }`}
      >
        <span
          className={`absolute top-0.5 size-4.5 rounded-full transition-[left] duration-[var(--motion-fast)] ease-[var(--ease-out)] ${
            an ? "left-[1.5rem] bg-accent-fg" : "left-0.5 bg-muted-fg"
          }`}
          style={{ height: "1.125rem", width: "1.125rem" }}
        />
      </span>
    </button>
  );
}

function Regler({
  name,
  hinweis,
  wert,
  klein = 0,
  gross = 1,
  schritt = 0.05,
  aus,
  format,
  onChange,
  onFertig,
}: {
  name: string;
  hinweis?: string;
  wert: number;
  klein?: number;
  gross?: number;
  schritt?: number;
  aus?: boolean;
  format?: (wert: number) => string;
  onChange: (wert: number) => void;
  onFertig?: () => void;
}) {
  const id = useId();
  return (
    <div
      className={`rounded-md border border-border bg-surface/50 px-3 py-2.5 ${aus ? "opacity-40" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm text-fg">
          {name}
        </label>
        <span className="font-mono text-xs tabular-nums text-muted-fg">
          {format ? format(wert) : `${Math.round(wert * 100)} %`}
        </span>
      </div>
      {hinweis ? <p className="mt-0.5 text-xs text-muted-fg">{hinweis}</p> : null}
      <input
        id={id}
        type="range"
        min={klein}
        max={gross}
        step={schritt}
        value={wert}
        disabled={aus}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerUp={onFertig}
        onKeyUp={onFertig}
        className="regler mt-2 w-full"
      />
    </div>
  );
}

function Auswahl<T extends string>({
  name,
  wert,
  werte,
  onChange,
}: {
  name: string;
  wert: T;
  werte: Array<{ id: T; name: string }>;
  onChange: (wert: T) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-surface/50 px-3 py-2.5">
      <p className="mb-2 text-sm text-fg">{name}</p>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={name}>
        {werte.map((eintrag) => (
          <button
            key={eintrag.id}
            type="button"
            role="radio"
            aria-checked={wert === eintrag.id}
            onClick={() => {
              onChange(eintrag.id);
              spieleKlang("zeiger");
            }}
            className={`h-9 rounded-sm border px-3 text-sm transition-colors duration-[var(--motion-quick)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              wert === eintrag.id
                ? "border-accent bg-accent text-accent-fg"
                : "border-border bg-surface text-muted-fg hover:bg-surface-2 hover:text-fg"
            }`}
          >
            {eintrag.name}
          </button>
        ))}
      </div>
    </div>
  );
}
