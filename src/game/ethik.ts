import type { HerkunftFrage } from "./herkunft";

export type EthikSchule =
  | "gesinnung"
  | "verantwortung"
  | "pflicht"
  | "fuersorge"
  | "kalkuel"
  | "vertrag"
  | "macht"
  | "stoa"
  | "tugend";

export const SCHULE_NAME: Record<EthikSchule, string> = {
  gesinnung: "Gesinnung",
  verantwortung: "Verantwortung",
  pflicht: "Pflicht",
  fuersorge: "Fürsorge",
  kalkuel: "Kalkül",
  vertrag: "Vertrag",
  macht: "Macht",
  stoa: "Stoa",
  tugend: "Tugend",
};

export const SCHULE_SATZ: Record<EthikSchule, string> = {
  gesinnung: "Du wählst das Richtige, bevor du die Toten zählst.",
  verantwortung: "Du nimmst Schuld auf dich für eine bessere Summe.",
  pflicht: "Die Regel gilt, auch wenn ein Mund darunter um Wasser bittet.",
  fuersorge: "Das Gesicht vor dir schlägt die Rechnung.",
  kalkuel: "Du rechnest Leben gegeneinander. Manche gehen in der Summe auf.",
  vertrag: "Was versprochen war, wiegt mehr als was vor dir kniet.",
  macht: "Menschen sind Mittel. Gold, Arbeit, Feuer.",
  stoa: "Du trittst aus der Entscheidung. Das Los und die Zeit sollen richten.",
  tugend: "Du wirst jemand. Nicht eine Bilanz.",
};

const WEGE: Record<string, { schule: EthikSchule; satz: string }[]> = {
  soldateska: [
    { schule: "gesinnung", satz: "Ein Leben für viele. Das Richtige, ohne die Folge zu kennen." },
    { schule: "verantwortung", satz: "Eine Wette auf alle. Die Lüge trägt die Toten, wenn sie scheitert." },
    { schule: "stoa", satz: "Aufschub statt Urteil. Das Gold bleibt in der Hand, die nichts wählt." },
  ],
  feind: [
    { schule: "fuersorge", satz: "Wasser an den Feind. Das Gesicht zählt mehr als das Zeichen am Umhang." },
    { schule: "pflicht", satz: "Im Graben endet, was noch nach Wasser fragt. Krieg kennt keine Bitte." },
    { schule: "macht", satz: "Wer noch stehen kann, mahlt. Der Körper ist Werkzeug, solange er geht." },
  ],
  ernte: [
    { schule: "vertrag", satz: "Diebstahl hat einen Herrn. Die Peitsche hält das Mehl zusammen." },
    { schule: "fuersorge", satz: "Drei Säcke, die niemand gesehen hat. Hunger schlägt das Gesetz." },
    { schule: "macht", satz: "Hunger wird Arbeit. Das Leben hat einen Preis, und du kassierst ihn." },
  ],
  verraeter: [
    { schule: "pflicht", satz: "Der Name zuerst. Die Polis hängt, bevor das Gold kauft." },
    { schule: "fuersorge", satz: "Die Familie deckt den Verrat. Loyalität bleibt partikular." },
    { schule: "macht", satz: "Derselbe Verrat, zweite Rechnung. Er arbeitet fortan gegen dieselben Leute." },
  ],
  brot: [
    { schule: "fuersorge", satz: "Die Kinder vor dem Karren. Nähe schlägt den Auftrag." },
    { schule: "vertrag", satz: "Der Karren hat einen Herrn. Lindendorf wartet, der Dreck nicht." },
    { schule: "kalkuel", satz: "Wer geht, arbeitet. Wer bleibt, bleibt. Selektion im Schlamm." },
  ],
  seuche: [
    { schule: "fuersorge", satz: "Die Tür auf, weil drinnen noch Stimmen sind. Das Fieber darf mit." },
    { schule: "vertrag", satz: "Quarantäne. Die Kranken sterben hinter dem Riegel, die anderen nicht." },
    { schule: "kalkuel", satz: "Feuer statt Fieber. Weniger Tote, und du hast sie gemacht." },
  ],
  spion: [
    { schule: "macht", satz: "Die Wahrheit kommt teuer. Du auch. Der Mund gibt her, was er nicht will." },
    { schule: "fuersorge", satz: "Losbinden. Gnade ist eine Wette, die man selten gewinnt." },
    { schule: "pflicht", satz: "Kein Weg, kein Name, kein Risiko. Das Ende vor der Frage." },
  ],
  waffe: [
    { schule: "kalkuel", satz: "Die Klinge dem, der noch stehen kann. Effizienz im nassen Gras." },
    { schule: "fuersorge", satz: "Die letzte Chance dem, der schon liegt." },
    { schule: "tugend", satz: "Zerbrechen. Niemand wird Mittel. Auch du nicht." },
  ],
  burg: [
    { schule: "fuersorge", satz: "Das Tor auf. Barmherzigkeit, bis das Brot stirbt." },
    { schule: "pflicht", satz: "Das Tor zu. Die Wache hält, was vor dem Tor nicht mehr zählt." },
    { schule: "kalkuel", satz: "Frauen und Kinder. Ein Schnitt, der sich gerecht anhört und es nicht ist." },
  ],
  ausweg: [
    { schule: "gesinnung", satz: "Du bleibst. Die anderen gehen. Supererogation im nassen Wald." },
    { schule: "kalkuel", satz: "Triage. Der Langsamste bleibt, weil Tempo eine Waffe ist." },
    { schule: "stoa", satz: "Das Los hat keine Meinung. Deshalb hält es." },
  ],
};

export function ethikDerAntwort(frageId: string, index: number) {
  return WEGE[frageId]?.[index] ?? null;
}

export function fasseEthik(fragen: HerkunftFrage[], gewaehlt: number[]) {
  const stand: Partial<Record<EthikSchule, number>> = {};
  const wege: { titel: string; schule: EthikSchule; satz: string }[] = [];
  fragen.forEach((frage, i) => {
    const fund = ethikDerAntwort(frage.id, gewaehlt[i] ?? -1);
    if (!fund) return;
    stand[fund.schule] = (stand[fund.schule] ?? 0) + 1;
    wege.push({ titel: frage.titel, ...fund });
  });
  const sortiert = (Object.entries(stand) as [EthikSchule, number][]).sort((a, b) => b[1] - a[1]);
  const haupt = sortiert[0]?.[0] ?? "tugend";
  return {
    haupt,
    satz: SCHULE_SATZ[haupt],
    stand: sortiert.map(([schule, n]) => `${SCHULE_NAME[schule]} ${n}`).join(" · "),
    wege,
  };
}
