import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Coins,
  FlaskConical,
  Heart,
  KeyRound,
  Save,
  ScrollText,
  Settings2,
} from "lucide-react";
import { HEILTRANK, SCHLUESSEL, type EffektId, type Held } from "@/game/types";
import { mapHeldToPlayerHud } from "@/game/gm/mapHeldToPlayerHud";
import { rufListe } from "@/game/reputation";
import { TAGESZEIT_TEXT } from "@/game/tageszeit";
import { Button } from "@/components/ui/button";
import { spieleKlang } from "@/game/klang";
import { SeitenFuss } from "./SeitenFuss";
import { ZustandLeiste } from "./ZustandLeiste";

/** Farbe des Lebensbalkens folgt dem Zustand, nicht nur seine Breite. */
function lpFarbe(anteil: number): string {
  if (anteil <= 30) return "bg-hp";
  if (anteil <= 60) return "bg-warn";
  return "bg-ok";
}

export function Hud({
  held,
  onSave,
  saveMessage,
  onKnowledge,
  onLeiter,
  onSystem,
  leiterOpen,
  wissenAnzahl = 0,
  weltAnzahl = 0,
  weltPunkt = false,
  hinzu,
  nimmt,
  fort,
}: {
  held: Held;
  onSave: () => void;
  saveMessage: string | null;
  onKnowledge: () => void;
  onLeiter: () => void;
  onSystem?: () => void;
  leiterOpen: boolean;
  wissenAnzahl?: number;
  weltAnzahl?: number;
  weltPunkt?: boolean;
  hinzu?: EffektId[];
  nimmt?: EffektId[];
  fort?: EffektId[];
}) {
  const [offen, setOffen] = useState(false);
  const hud = mapHeldToPlayerHud(held);
  const hpPct = Math.max(0, Math.min(100, (hud.lp / hud.maxLp) * 100));
  const anzahl = hud.gunst.length + hud.last.length;
  const rufe = rufListe(held);
  const zeit = TAGESZEIT_TEXT[hud.tageszeit];
  const spieltag = hud.spieltag;
  const knapp = hpPct <= 30;

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-ink/94 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-md sm:px-4">
      <div className="mx-auto flex max-w-5xl items-center gap-1.5 text-xs text-fg sm:gap-3 sm:text-sm">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 sm:gap-3">
            <p className="min-w-0 truncate font-display text-base font-semibold tracking-tight sm:text-lg">
              {hud.name}
            </p>
            <span
              className={`inline-flex shrink-0 items-center gap-1 font-mono tabular-nums ${
                knapp ? "text-hp" : "text-muted-fg"
              }`}
              title={`Lebenspunkte ${hud.lp} von ${hud.maxLp}`}
            >
              <Heart
                className={`size-3.5 text-hp ${knapp ? "lp-knapp rounded-full" : ""}`}
                aria-hidden
              />
              {hud.lp}/{hud.maxLp}
            </span>
            <span className="hidden shrink-0 text-muted-fg sm:inline">
              {zeit.name} · Tag {spieltag}
            </span>
          </div>
          <div
            className="mt-1 h-1.5 max-w-64 overflow-hidden rounded-full bg-surface-2"
            role="meter"
            aria-valuenow={hud.lp}
            aria-valuemin={0}
            aria-valuemax={hud.maxLp}
            aria-label="Lebenspunkte"
          >
            <div
              className={`lp-balken h-full rounded-full ${lpFarbe(hpPct)}`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>
        <div className="hidden min-w-0 sm:block">
          <ZustandLeiste held={held} nurWerte />
        </div>
        <button
          type="button"
          className="pointer-events-auto inline-flex h-11 shrink-0 items-center gap-1 rounded-sm border border-border px-1.5 text-xs text-muted-fg sm:px-2 transition-colors duration-[var(--motion-quick)] hover:border-accent hover:text-fg"
          onClick={() => setOffen((wert) => !wert)}
          aria-expanded={offen}
          aria-label={anzahl ? `Status, ${anzahl} Zustände` : "Status"}
        >
          <span className="tabular-nums">
            {anzahl ? (
              <>
                <span className="sm:hidden">{anzahl}</span>
                <span className="hidden sm:inline">{anzahl} Zustände</span>
              </>
            ) : (
              <span className="hidden sm:inline">Status</span>
            )}
          </span>
          <ChevronDown
            className={`size-4 transition-transform duration-[var(--motion-fast)] ${offen ? "rotate-180" : ""}`}
          />
        </button>
        <Button
          type="button"
          variant="secondary"
          className="pointer-events-auto h-11 shrink-0 px-1.5 text-xs sm:px-3"
          onClick={onSave}
          title="Spielstand speichern"
          aria-label="Speichern"
        >
          <Save className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Speichern</span>
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="pointer-events-auto h-11 shrink-0 px-1.5 text-xs sm:px-3"
          onClick={onKnowledge}
          title="Wissenstagebuch öffnen"
          aria-label={wissenAnzahl ? `Wissen (${wissenAnzahl})` : "Wissen"}
        >
          <BookOpen className="size-3.5" aria-hidden />
          <span className="tabular-nums sm:hidden">{wissenAnzahl || ""}</span>
          <span className="hidden sm:inline">Wissen{wissenAnzahl ? ` (${wissenAnzahl})` : ""}</span>
        </Button>
        {onSystem ? (
          <Button
            type="button"
            variant="secondary"
            className="pointer-events-auto h-11 shrink-0 px-1.5 text-xs sm:px-3"
            onClick={() => {
              spieleKlang("oeffnen");
              onSystem();
            }}
            title="Einstellungen (E)"
            aria-label="Einstellungen"
          >
            <Settings2 className="size-3.5" aria-hidden />
          </Button>
        ) : null}
        <Button
          type="button"
          variant={leiterOpen ? "default" : "secondary"}
          className="pointer-events-auto h-11 shrink-0 px-1.5 text-xs sm:px-3"
          onClick={onLeiter}
          title="Weltwerkzeug (Alt+S)"
          aria-pressed={leiterOpen}
          aria-label={
            weltPunkt
              ? `Welt, diese Karte weicht ab, ${weltAnzahl} Auflagen`
              : weltAnzahl
                ? `Welt, ${weltAnzahl} Auflagen`
                : "Welt"
          }
        >
          <ScrollText className="size-3.5" aria-hidden />
          <span className="tabular-nums sm:hidden">
            {weltPunkt ? "●" : ""}
            {weltAnzahl || ""}
          </span>
          <span className="hidden sm:inline">
            Welt{weltPunkt ? " ●" : ""}
            {weltAnzahl ? ` ${weltAnzahl}` : ""}
          </span>
        </Button>
      </div>
      {offen ? (
        <div className="herein mx-auto mt-2 max-w-5xl border-t border-border pt-2">
          <ZustandLeiste held={held} />
          <p className="mt-1.5 text-xs text-muted-fg">
            {zeit.satz} Tag {spieltag}.
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-fg">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Coins className="size-3.5" aria-hidden />
              {hud.gold}
            </span>
            {hud.inventar.includes(HEILTRANK) ? (
              <span className="inline-flex items-center gap-1">
                <FlaskConical className="size-3.5" aria-hidden />
                Trank
              </span>
            ) : null}
            {hud.inventar.includes(SCHLUESSEL) ? (
              <span className="inline-flex items-center gap-1">
                <KeyRound className="size-3.5" aria-hidden />
                Schlüssel
              </span>
            ) : null}
            {saveMessage ? <span className="text-ok">{saveMessage}</span> : null}
          </div>
          {rufe.length ? (
            <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-fg">
              {rufe.map((item) => (
                <span key={item.ziel} className={item.wert > 0 ? "text-ok" : "text-hp"}>
                  {item.ziel} {item.wert > 0 ? "+" : ""}
                  {item.wert}
                </span>
              ))}
            </p>
          ) : null}
          <SeitenFuss held={held} hinzu={hinzu} nimmt={nimmt} fort={fort} kompakt />
        </div>
      ) : null}
    </div>
  );
}
