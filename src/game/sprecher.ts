import type { PortraitKey } from "./types";

const NAMEN: [PortraitKey, RegExp][] = [
  ["kern", /\bKern\b/],
  ["dennek", /\bDennek\b/],
  ["holm", /\bHolm\b/],
  ["mara", /\bMara\b/],
  ["kess", /\bKess\b/],
  ["miller", /\bBertok\b/],
  ["lene", /\bLene\b/],
  ["sanna", /\bSanna\b/],
  ["smith", /\bSchmied\b/],
  ["beggar", /\bFenn\b/],
  ["grovin", /\bGrovin\b/],
  ["vahl", /\bVahl\b/],
  ["grete", /\bGrete\b/],
  ["rennik", /\bRennik\b/],
  ["jorren", /\bJorren\b/],
];

export function hatRede(text: string) {
  return /[„“«»"]/.test(text) || /\b(sagt|fragt|ruft|flüstert|erwidert|antwortet)\b/.test(text);
}

export function namenInText(text: string): PortraitKey[] {
  return NAMEN.filter(([, re]) => re.test(text)).map(([key]) => key);
}

/** Eine sprechende Figur, wenn der Text sie eindeutig trägt. Mehrere Namen: keine Vermutung. */
export function sprecherAusZeilen(lines: string[]): PortraitKey | undefined {
  const text = lines.join("\n");
  const namen = namenInText(text);
  if (namen.length === 1) return namen[0];
  if (namen.length < 2 || !hatRede(text)) return undefined;
  const vorRede = text.split(/[„"]/)[0] ?? "";
  const davor = namenInText(vorRede);
  if (davor.length === 1) return davor[0];
  return undefined;
}
