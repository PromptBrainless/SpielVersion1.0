import { fundFuerSzene, QUESTS } from "./json/baum";
import type { SzeneJson } from "./json/schema";

export const KANON_NAMEN = [
  "Holm",
  "Mara",
  "Kess",
  "Lene",
  "Bertok",
  "Yorwin",
  "Rennik",
  "Witwe Kern",
  "Dennek",
  "Grovin",
  "Sanna",
  "Jorren",
  "Köhler",
  "der Schmied",
  "der Bettler",
  "Fenn",
  "Vahl",
  "Grete",
  "Ilse Brandtner",
  "der Junge mit der roten Schnur",
] as const;

const STOPP = new Set(
  "aber als auf aus das dem den der des die dies diese dieser ein eine einem einen einer eines es hat im in ist mit nach nicht noch nur oder sein seine sich sie und vom von vor wie wir zu zum zur".split(
    " ",
  ),
);

export type RagEingabe = {
  id: string;
  title: string;
  art: string;
  portrait: string;
  lines: string[];
  choices: string[];
  wissen: string[];
};

function woerter(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/ß/g, "ss")
      .split(/[^a-zäöü]+/)
      .filter((wort) => wort.length > 3 && !STOPP.has(wort)),
  );
}

function treffer(a: Set<string>, b: Set<string>) {
  let n = 0;
  for (const wort of a) if (b.has(wort)) n += 1;
  return n;
}

function block(szene: Pick<SzeneJson, "id" | "title" | "lines" | "choices">, zeilen = 8) {
  const roh = szene.lines.filter((zeile) => zeile.trim().length > 0).slice(0, zeilen).join("\n\n");
  const text = roh.length > 1800 ? `${roh.slice(0, 1800)}…` : roh;
  const wahlen = szene.choices.length ? `Wahlen: ${szene.choices.join(" · ")}` : "";
  return [`### ${szene.title} (${szene.id})`, text || "(leer)", wahlen].filter(Boolean).join("\n");
}

export function lexikalischAehnlich(data: RagEingabe, eigeneId: string | undefined, anzahl = 2) {
  const frage = woerter([data.title, ...data.lines, ...data.choices].join(" "));
  if (frage.size === 0) return [] as SzeneJson[];
  const rang: { szene: SzeneJson; wert: number }[] = [];
  for (const quest of QUESTS) {
    for (const teil of quest.teile) {
      for (const szene of teil.szenen) {
        if (szene.id === eigeneId || szene.id === data.id) continue;
        if (!szene.lines.length) continue;
        const wert = treffer(frage, woerter([szene.title, ...szene.lines].join(" ")));
        if (wert >= 2) rang.push({ szene, wert });
      }
    }
  }
  rang.sort((a, b) => b.wert - a.wert);
  return rang.slice(0, anzahl).map((item) => item.szene);
}

export function holeKontext(data: RagEingabe) {
  const fund = fundFuerSzene(data.id, data.title);
  const nachbarn = fund ? fund.teil.szenen.filter((szene) => szene.id !== fund.szene.id).slice(0, 6) : [];
  const aehnlich = lexikalischAehnlich(data, fund?.szene.id);
  return { fund, nachbarn, aehnlich };
}

export function grokFassung(data: RagEingabe) {
  const { fund } = holeKontext(data);
  const text = data.lines.filter((zeile) => zeile.trim().length > 0).join("\n\n");
  const wahlen = data.choices.length ? data.choices.map((wahl) => `„${wahl}“`).join("\n") : "„Weiter“";
  const teile: string[] = [
    "Nur diese eine Seite. Keine Nachbarn, keine anderen Orte.",
    `Id: ${data.id || fund?.szene.id || "—"} · Titel: ${data.title}`,
    `art: ${data.art || fund?.szene.art || "—"} · portrait: ${data.portrait || fund?.szene.portrait || "null"}`,
    "",
    "Text auf der Tafel jetzt:",
    text || "(leer — füllen und erweitern, aber nur dieser Ort)",
    "",
    "Wahlen jetzt:",
    wahlen,
  ];
  if (fund) {
    const pflicht = ["id", "title", "art", "portrait", "lines", "choices"];
    if (fund.szene.successLines) pflicht.push("successLines");
    if (fund.szene.failureLines) pflicht.push("failureLines");
    if (fund.szene.passLines) pflicht.push("passLines");
    teile.push(
      "",
      `Pflichtfelder (keine streichen, keine hinzufügen): ${pflicht.join(", ")}`,
      "JSON dieser Seite:",
      JSON.stringify(fund.szene, null, 2),
    );
  }
  teile.push("", "Schreibe nur diese Szene-JSON. Denselben Ort genauer. Keine anderen Karten.");
  return teile.join("\n");
}
