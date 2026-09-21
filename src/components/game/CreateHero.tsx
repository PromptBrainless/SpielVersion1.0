import { useMemo, useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ART, lageBild } from "@/game/art";
import { EFFEKTE, werteMitEffekt } from "@/game/effekte";
import { baueHeldAusHerkunft } from "@/game/herkunft";
import { fasseEthik, SCHULE_NAME } from "@/game/ethik";
import { peekSaveForName } from "@/game/save";
import { sichtbareHerkunft } from "@/game/welt";
import type { Held } from "@/game/types";

export function CreateHero({
  onReady,
  onBack,
  onWelt,
  onSystem,
  onLoadName,
}: {
  onReady: (held: Held) => void;
  onBack: () => void;
  onWelt: () => void;
  onSystem?: () => void;
  onLoadName?: (name: string) => boolean;
}) {
  const [name, setName] = useState("");
  const [schritt, setSchritt] = useState(-1);
  const [antworten, setAntworten] = useState<number[]>([]);

  const fragen = sichtbareHerkunft();
  const frage = schritt >= 0 ? fragen[schritt] : undefined;
  const fertig = schritt >= fragen.length;
  const held = fertig ? baueHeldAusHerkunft(name, antworten, fragen) : null;
  const vorhandenerStand = useMemo(() => peekSaveForName(name), [name]);
  const hintergrund = fertig ? ART.village : frage ? lageBild(frage.id) || ART.road : ART.road;

  function waehle(index: number) {
    const next = [...antworten.slice(0, schritt), index];
    setAntworten(next);
    setSchritt(schritt + 1);
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden overflow-y-auto bg-bg text-fg">
      <img src={hintergrund} alt="" className="absolute inset-0 size-full object-cover grayscale" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/35" />
      <div
        className={`safe-bottom relative z-10 mx-auto flex min-h-dvh max-w-xl flex-col px-5 py-8 ${
          schritt < 0 || fertig ? "justify-end sm:justify-center" : "justify-start pt-16 sm:justify-center"
        }`}
      >
        <div className="rounded-xl border border-border bg-ink/80 p-5 shadow-sm backdrop-blur-md sm:p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-accent">Heldenerstellung</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {fertig ? "So siehst du aus" : schritt < 0 ? "Aufbruch" : frage?.titel ?? "Wer geht da"}
          </h1>

          {schritt < 0 ? (
            <>
              <p className="mt-3 text-sm text-fg/90">
                Zehn kurze Geschichten, jede für sich. Was du tust, setzt Gunst oder Last auf die
                Proben: Motiviert hebt Stärke, Furcht drückt Charisma. Der Grundwert bleibt. Die Probe nicht.
              </p>
              <label className="mt-5 block text-sm text-muted-fg" htmlFor="hero-name">
                Name
              </label>
              <Input
                id="hero-name"
                className="mt-1.5"
                placeholder="Namenlos"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={24}
                autoComplete="off"
              />
              {vorhandenerStand ? (
                <div className="mt-3 rounded-md border border-ok/30 bg-ok/10 px-3 py-2 text-sm">
                  <p className="text-ok">
                    Stand für {vorhandenerStand.name} gefunden
                    {vorhandenerStand.savedAt
                      ? ` · ${new Date(vorhandenerStand.savedAt).toLocaleString("de-DE")}`
                      : ""}
                    {` · LP ${vorhandenerStand.lp}`}
                  </p>
                  <Button
                    className="mt-2 w-full"
                    size="lg"
                    onClick={() => {
                      if (!onLoadName?.(vorhandenerStand.name)) return;
                    }}
                  >
                    Mit diesem Namen weiterspielen
                  </Button>
                </div>
              ) : null}
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <Button size="lg" onClick={() => setSchritt(0)}>
                  {vorhandenerStand ? "Neues Abenteuer" : "Die Geschichten"}
                </Button>
                <Button variant="secondary" size="lg" onClick={onBack}>
                  Zurück
                </Button>
              </div>
            </>
          ) : null}

          {frage ? (
            <>
              <p className="mt-1 text-xs text-muted-fg">
                Geschichte {schritt + 1} von {fragen.length}
              </p>
              {lageBild(frage.id) ? (
                <figure className="mt-3 overflow-hidden rounded-md border border-border">
                  <img src={lageBild(frage.id)} alt="" className="h-44 w-full object-cover grayscale sm:h-56" />
                </figure>
              ) : null}
              <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-fg sm:text-base">
                {frage.geschichte.map((absatz) => (
                  <p key={absatz.slice(0, 28)}>{absatz}</p>
                ))}
              </div>
              <div className="mt-5 grid gap-2">
                {frage.antworten.map((antwort, index) => (
                  <Button
                    key={antwort.label}
                    type="button"
                    variant="choice"
                    size="choice"
                    onClick={() => waehle(index)}
                  >
                    {antwort.label}
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                className="mt-3 h-9 px-2 text-xs"
                onClick={() => setSchritt(schritt <= 0 ? -1 : schritt - 1)}
              >
                Eine Geschichte zurück
              </Button>
            </>
          ) : null}

          {held ? (
            <>
              <p className="mt-3 text-sm leading-relaxed text-fg/90">{held.mal}</p>
              {(() => {
                const lesung = fasseEthik(fragen, antworten);
                return (
                  <div className="mt-3 rounded-md border border-border bg-surface/70 px-3 py-2">
                    <p className="text-xs uppercase tracking-wide text-muted-fg">Ethik · {SCHULE_NAME[lesung.haupt]}</p>
                    <p className="mt-1 text-sm leading-relaxed">{lesung.satz}</p>
                    {lesung.stand ? <p className="mt-1 text-xs text-muted-fg">{lesung.stand}</p> : null}
                  </div>
                );
              })()}
              {(() => {
                const werte = werteMitEffekt(held);
                return (
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <Stat label="Stärke" value={werte.staerke} basis={held.staerke} />
                    <Stat label="Geschick" value={werte.geschick} basis={held.geschick} />
                    <Stat label="Charisma" value={werte.charisma} basis={held.charisma} />
                  </div>
                );
              })()}
              <p className="mt-3 text-xs text-muted-fg">
                LP {held.lp} · Gold {held.gold}
                {held.inventar.length ? ` · ${held.inventar.join(", ")}` : ""}
              </p>
              {held.effekte.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {held.effekte.map((id) => {
                    const item = EFFEKTE[id];
                    const gunst = item.gruppe === "gunst";
                    return (
                      <span
                        key={id}
                        className={`rounded-xs border px-1.5 py-0.5 text-xs ${
                          gunst ? "border-ok/40 text-ok" : "border-hp/40 text-hp"
                        }`}
                      >
                        {item.name} {item.hint}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-fg">Keine Zustände. Das Tal wird welche finden.</p>
              )}
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <Button size="lg" onClick={() => onReady(held)}>
                  Nach Lindendorf
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setSchritt(-1);
                    setAntworten([]);
                  }}
                >
                  Noch einmal
                </Button>
              </div>
            </>
          ) : null}
        </div>
        {onSystem ? (
          <Button variant="secondary" className="mt-3 w-full" onClick={onSystem}>
            <Settings2 className="size-4" aria-hidden />
            Einstellungen
          </Button>
        ) : null}
        <Button variant="secondary" className="mt-3 w-full" onClick={onWelt}>
          Weltwerkzeug
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value, basis }: { label: string; value: number; basis: number }) {
  const delta = value - basis;
  return (
    <div className="rounded-md border border-border bg-surface/70 px-2 py-2">
      <p className="text-xs text-muted-fg">{label}</p>
      <p className={`font-display text-2xl tabular-nums ${delta > 0 ? "text-ok" : delta < 0 ? "text-hp" : ""}`}>
        {value}
      </p>
      {delta !== 0 ? (
        <p className={`text-xs ${delta > 0 ? "text-ok" : "text-hp"}`}>
          {delta > 0 ? `+${delta}` : delta} vom Grund {basis}
        </p>
      ) : null}
    </div>
  );
}
