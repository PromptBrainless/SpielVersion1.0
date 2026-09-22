import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { KNOWLEDGE_META } from "../src/game/knowledge.ts";
import { INNERES, WISSEN_BILD } from "../src/game/wissen-inneres.ts";
import { szeneWissenPfad } from "../src/game/szene-bilder.ts";

const wurzel = join(process.cwd(), "src/game/json/wissen");
const quests = join(process.cwd(), "src/game/json/quests");
mkdirSync(wurzel, { recursive: true });

function legeAb(id, tafel) {
  writeFileSync(
    join(wurzel, `${id}.json`),
    `${JSON.stringify(
      {
        id: tafel.id,
        title: tafel.title,
        bild: tafel.bild,
        offen: Boolean(tafel.offen),
        lines: tafel.lines,
      },
      null,
      2,
    )}\n`,
  );
}

function sammeln(ordner, dateien = []) {
  for (const eintrag of readdirSync(ordner, { withFileTypes: true })) {
    const pfad = join(ordner, eintrag.name);
    if (eintrag.isDirectory()) sammeln(pfad, dateien);
    else if (eintrag.name.endsWith(".json")) dateien.push(pfad);
  }
  return dateien;
}

let anzahl = 0;

for (const key of Object.keys(KNOWLEDGE_META)) {
  const lines = INNERES[key];
  if (!lines?.length) continue;
  legeAb(key, {
    id: key,
    title: KNOWLEDGE_META[key].label,
    bild: WISSEN_BILD[key],
    offen: false,
    lines,
  });
  anzahl += 1;
}

const gesehen = new Set();
for (const pfad of sammeln(quests)) {
  let roh;
  try {
    roh = JSON.parse(readFileSync(pfad, "utf8"));
  } catch {
    continue;
  }
  const szenen = [];
  if (Array.isArray(roh.szenen)) szenen.push(...roh.szenen);
  if (Array.isArray(roh.teile)) {
    for (const teil of roh.teile) {
      if (Array.isArray(teil.szenen)) szenen.push(...teil.szenen);
    }
  }
  for (const szene of szenen) {
    if (!szene?.id || gesehen.has(szene.id)) continue;
    gesehen.add(szene.id);
    const lines = Array.isArray(szene.lines) && szene.lines.length ? szene.lines : ["Du warst hier. Der Ort hat sich noch nicht in Sätzen abgelegt."];
    legeAb(szene.id, {
      id: szene.id,
      title: szene.title || szene.id,
      bild: szeneWissenPfad(szene.id) ?? `/art/wissen/${szene.id}.jpg`,
      offen: false,
      lines,
    });
    anzahl += 1;
  }
}

legeAb("offen", {
  id: "offen",
  title: "Offene Frage",
  bild: "/art/wissen/offen.jpg",
  offen: true,
  lines: [
    "Du hast darauf noch keine Antwort, die vor einem Zeugen bestehen würde.",
    "Die Frage selbst bleibt. Sie legt sich an den Rand des nächsten Gesprächs und wartet, bis jemand den Satz zu Ende spricht.",
  ],
});
anzahl += 1;

console.log(JSON.stringify({ ok: true, anzahl, ordner: "src/game/json/wissen" }));
