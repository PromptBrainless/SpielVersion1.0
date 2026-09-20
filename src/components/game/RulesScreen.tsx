import { Button } from "@/components/ui/button";
import { ART } from "@/game/art";

export function RulesScreen({ onBack, onWelt }: { onBack: () => void; onWelt: () => void }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden overflow-y-auto bg-bg text-fg">
      <img src={ART.title} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-bg/78" />
      <div className="safe-top safe-bottom relative z-10 mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5 py-10">
        <div className="rounded-xl border border-border bg-ink/80 p-5 shadow-sm backdrop-blur-md sm:p-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight">So spielt man</h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-fg sm:text-base">
            <p>Du liest eine Szene und wählst eine Zahl — oder tippst die Karte.</p>
            <p>
              Proben: <span className="tabular-nums">W10 + Attribut ≥ Schwierigkeit</span>
              <br />
              leicht 8 · mittel 12 · schwer 15
            </p>
            <p>Erfolg und Misserfolg ändern Text, Gegenstände, Lebenspunkte und den weiteren Weg.</p>
            <p>
              Attribute (1–10): Stärke, Geschicklichkeit, Charisma. Lebenspunkte: 10. Bei 0 ist es vorbei.
              Neun Gunst, neun Last. Gunst hebt ein Attribut, Last drückt eines. Die Moralgeschichten
              setzen diese Zustände — die Probe rechnet mit dem geänderten Wert, nicht mit dem Grundwert.
            </p>
            <p>Inventar: Heiltrank, Schlüssel, Gold — keine Ausrüstungsslots.</p>
            <p>Speichern: Im HUD speichern. Laden setzt dich am Dorfplatz mit deinen Entscheidungen fort.</p>
            <p>Orte: Dorf → Wald → Banditenlager → Ende. Im Lager gehen Schleichen, Reden und Kampf alle durch.</p>
          </div>
          <Button className="mt-6 w-full" onClick={onBack}>
            Zurück
          </Button>
          <Button variant="secondary" className="mt-2 w-full" onClick={onWelt}>
            Weltwerkzeug
          </Button>
        </div>
      </div>
    </div>
  );
}
