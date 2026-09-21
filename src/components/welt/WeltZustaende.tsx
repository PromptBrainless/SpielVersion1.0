import { EFFEKT_IDS, EFFEKTE } from "@/game/effekte";
import { HERKUNFT_FRAGEN } from "@/game/herkunft";
import { ORT_ZUSTAENDE } from "@/game/seiten-zustaende";

const PLAN: Record<string, string> = {
  ausgeschlafen: "Warten am Dorfplatz oder die Rückkehr — wer rastet, wacht ausgeschlafen auf.",
  fieber: "Der Brunnen gibt Fieber, die Apotheke nimmt es. Trübes Wasser, nicht die Luft.",
  verstossung: "Das Tor oder das Rathaus nach einem öffentlichen Verrat — nicht die nasse Straße.",
};

export function WeltZustaende() {
  const lagen = new Set<string>();
  for (const frage of HERKUNFT_FRAGEN) {
    for (const antwort of frage.antworten) {
      for (const id of antwort.effekte ?? []) lagen.add(id);
    }
  }

  return (
    <div className="mt-4">
      <p className="text-xs text-muted-fg">Zustände — welcher Ort gibt, nimmt, lässt fort.</p>
      <ul className="mt-2 text-sm">
        {EFFEKT_IDS.map((id) => {
          const gibt = Object.entries(ORT_ZUSTAENDE)
            .filter(([, o]) => o.hinzu.includes(id))
            .map(([k]) => k);
          const nimmt = Object.entries(ORT_ZUSTAENDE)
            .filter(([, o]) => o.nimmt.includes(id))
            .map(([k]) => k);
          const lage = lagen.has(id);
          return (
            <li key={id} className="mb-1">
              <span className="font-medium">{EFFEKTE[id].name}</span>
              <span className="ml-2 text-xs text-muted-fg">
                gibt {gibt.join(", ") || "—"} · nimmt {nimmt.join(", ") || "—"}
                {lage ? " · Lage" : ""}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs uppercase tracking-wide text-muted-fg">Plan — noch nicht verdrahtet</p>
      <ul className="mt-1 text-sm leading-relaxed">
        <li>
          <span className="font-medium">Zuversichtlich, Wunde</span>
          <span className="ml-2 text-xs text-muted-fg">Lage reicht. Kein Ort nötig.</span>
        </li>
        {Object.entries(PLAN).map(([id, satz]) => (
          <li key={id}>
            <span className="font-medium">{EFFEKTE[id as keyof typeof EFFEKTE]?.name ?? id}</span>
            <span className="ml-2 text-xs text-muted-fg">{satz}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
