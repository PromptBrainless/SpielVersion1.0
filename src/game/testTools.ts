import { LAGER_CONTENT, LAGER_WEGE } from "./lager-content";

export function findDeadNodes(alleSzenenIds: Set<string>, referenzierteIds: Set<string>): string[] {
  return [...alleSzenenIds].filter((id) => !referenzierteIds.has(id));
}

function lagerWegId(weg: string): string {
  return `lager-${weg}`;
}

export function lagerAlleIds(): Set<string> {
  const ids = new Set<string>([LAGER_CONTENT.id, "lager-nachspiel"]);
  for (const weg of Object.keys(LAGER_WEGE)) ids.add(lagerWegId(weg));
  return ids;
}

export function lagerReferenzierteIds(): Set<string> {
  const ref = new Set<string>([LAGER_CONTENT.id, "lager-nachspiel"]);
  const wege = Object.keys(LAGER_WEGE);
  for (const weg of wege.slice(0, LAGER_CONTENT.choices.length)) ref.add(lagerWegId(weg));
  if (LAGER_CONTENT.choiceTor) ref.add("lager-tor");
  if ("schleich" in LAGER_WEGE) {
    ref.add("lager-reden");
    ref.add("lager-kampf");
  }
  return ref;
}

export function lagerToteKnoten(): string[] {
  return findDeadNodes(lagerAlleIds(), lagerReferenzierteIds());
}
