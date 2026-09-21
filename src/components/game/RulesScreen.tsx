import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ART } from "@/game/art";

const ABSATZ = "mt-3 text-sm leading-relaxed text-fg sm:text-base";
const LISTE = "mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-fg sm:text-base";
const KOPF = "mt-5 font-display text-lg font-semibold tracking-tight";

export function RulesScreen({
  onBack,
  onWelt,
  onSystem,
}: {
  onBack: () => void;
  onWelt: () => void;
  onSystem?: () => void;
}) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden overflow-y-auto bg-bg text-fg">
      <img src={ART.title} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-bg/78" />
      <div className="safe-top safe-bottom relative z-10 mx-auto flex min-h-dvh max-w-xl flex-col px-5 py-10">
        <div className="rounded-xl border border-border bg-ink/80 p-5 shadow-sm backdrop-blur-md sm:p-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight">So wird gespielt</h1>

          <h2 className={`${KOPF} mt-4`}>Willkommen in Lindendorf</h2>
          <p className={ABSATZ}>
            Du reist durch ein abgelegenes Dorf, dessen Bewohner von seltsamen Ereignissen verunsichert
            sind. Sprich mit den Menschen, untersuche Orte und sammle Hinweise, um herauszufinden, was
            wirklich geschehen ist. Deine Entscheidungen bestimmen, welche Informationen du erhältst,
            welche Wege offenstehen und wie andere auf dich reagieren.
          </p>

          <h2 className={KOPF}>Spielsteuerung</h2>
          <p className={ABSATZ}>
            Das Spiel besteht aus Szenen. Lies den Text und wähle anschließend eine der angebotenen
            Entscheidungen aus. Klicke auf die gewünschte Option oder die entsprechende Zahl, um
            fortzufahren.
          </p>
          <p className={ABSATZ}>
            Jede Entscheidung kann Folgen haben. Manche eröffnen neue Wege, andere verändern die
            Reaktionen von Figuren, gewähren Gegenstände oder führen zu Risiken.
          </p>

          <h2 className={KOPF}>HUD</h2>
          <p className={ABSATZ}>
            Im oberen Bereich des Bildschirms befindet sich das HUD. Dort findest du jederzeit die
            wichtigsten Informationen über deinen aktuellen Spielstand.
          </p>

          <h2 className={KOPF}>Lebenspunkte (LP)</h2>
          <p className={ABSATZ}>Lebenspunkte zeigen, wie viel Schaden oder Belastung du noch aushalten kannst.</p>
          <ul className={LISTE}>
            <li>Startwert: 10 LP</li>
            <li>Bei 0 LP endet das Abenteuer</li>
          </ul>

          <h2 className={KOPF}>Attribute</h2>
          <p className={ABSATZ}>Deine Erfolgschancen bei Proben hängen von drei Attributen ab:</p>
          <ul className={LISTE}>
            <li>Stärke – körperliche Kraft, Durchsetzung und Kampf</li>
            <li>Geschicklichkeit – Schleichen, Suchen, Ausweichen und Präzision</li>
            <li>Charisma – Überzeugen, Verhandeln und Menschenkenntnis</li>
          </ul>
          <p className={ABSATZ}>Der angezeigte Wert enthält bereits alle aktiven Boni und Mali.</p>

          <h2 className={KOPF}>Gunst und Last</h2>
          <p className={ABSATZ}>Im Verlauf der Geschichte kannst du Gunst oder Last erhalten.</p>
          <ul className={LISTE}>
            <li>Gunst verbessert ein Attribut.</li>
            <li>Last verschlechtert ein Attribut.</li>
          </ul>
          <p className={ABSATZ}>
            Diese Zustände entstehen durch Ereignisse und Entscheidungen. Ihre Auswirkungen werden
            automatisch bei allen zukünftigen Proben berücksichtigt.
          </p>

          <h2 className={KOPF}>Inventar</h2>
          <p className={ABSATZ}>Hier werden wichtige Gegenstände angezeigt, die du gefunden hast.</p>
          <p className={ABSATZ}>Dazu gehören unter anderem:</p>
          <ul className={LISTE}>
            <li>Heiltränke</li>
            <li>Schlüssel</li>
            <li>Gold</li>
            <li>besondere Hinweise</li>
          </ul>
          <p className={ABSATZ}>
            Manche Entscheidungen oder Orte werden erst verfügbar, wenn du den passenden Gegenstand
            besitzt.
          </p>

          <h2 className={KOPF}>Speichern und Laden</h2>
          <p className={ABSATZ}>
            Über die Schaltflächen Speichern und Laden kannst du deinen Fortschritt jederzeit sichern
            oder fortsetzen.
          </p>
          <p className={ABSATZ}>
            Beim Laden bleiben alle bisherigen Entscheidungen, Gegenstände und Zustände erhalten.
          </p>

          <h2 className={KOPF}>Proben</h2>
          <p className={ABSATZ}>Einige Entscheidungen erfordern eine Probe.</p>
          <p className={ABSATZ}>Dabei gilt:</p>
          <p className={`${ABSATZ} tabular-nums`}>W10 + passendes Attribut ≥ Schwierigkeit</p>
          <p className={ABSATZ}>Schwierigkeitsstufen:</p>
          <ul className={LISTE}>
            <li>Leicht: 8</li>
            <li>Mittel: 12</li>
            <li>Schwer: 15</li>
          </ul>
          <p className={ABSATZ}>
            Ein Erfolg kann neue Informationen, Belohnungen oder Wege eröffnen. Ein Misserfolg kann
            Nachteile verursachen, alternative Ergebnisse auslösen oder Lebenspunkte kosten.
          </p>

          <h2 className={KOPF}>Hinweise zum Spielen</h2>
          <ul className={LISTE}>
            <li>Sprich mit verschiedenen Bewohnern.</li>
            <li>Untersuche auffällige Orte.</li>
            <li>Lies Texte aufmerksam.</li>
            <li>Merke dir wichtige Informationen.</li>
            <li>Nicht jede Figur kennt die Wahrheit.</li>
            <li>Nicht jede Figur sagt die Wahrheit.</li>
          </ul>
          <p className={ABSATZ}>
            Oft gibt es mehrere Wege zum Ziel. Manche Probleme lassen sich durch Stärke lösen, andere
            durch Geschicklichkeit, Charisma oder aufmerksames Beobachten.
          </p>
          <p className={ABSATZ}>
            Wer Hinweise miteinander verbindet und seine Entscheidungen sorgfältig abwägt, wird mehr
            entdecken als jemand, der nur den direkten Weg sucht.
          </p>

          <Button className="mt-6 w-full" onClick={onBack}>
            Zurück
          </Button>
          {onSystem ? (
            <Button variant="secondary" className="mt-2 w-full" onClick={onSystem}>
              <Settings2 className="size-4" aria-hidden />
              Einstellungen
            </Button>
          ) : null}
          <Button variant="secondary" className="mt-2 w-full" onClick={onWelt}>
            Weltwerkzeug
          </Button>
        </div>
      </div>
    </div>
  );
}
