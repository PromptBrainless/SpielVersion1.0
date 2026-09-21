import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import kiAuflagen from "../src/game/json/ki-auflagen.json" with { type: "json" };

const root = resolve(process.cwd());
const KURZ = 160;
const ALIAS = {
  "dorf-hub": "lindendorf",
  "sanna-botin": "sanna-die-botin",
  "bei-witwe-kern-dorf": "bei-witwe-kern",
  "am-brunnen": "brunnen-hub",
};
const AUSNAHME = new Set(["wissen-abreise"]);
const mangel = [];

function mass(lines) {
  return (lines ?? []).map((z) => String(z).trim()).filter(Boolean).join(" ").length;
}

function kanon(id) {
  if (!id) return 0;
  const roh = kiAuflagen[id] ?? kiAuflagen[ALIAS[id]];
  return mass(roh?.lines);
}

const runtime = await readFile(join(root, "src/game/runtime.ts"), "utf8");
if (!runtime.includes("zeilenAusKanon(")) {
  mangel.push("runtime.ts ruft zeilenAusKanon nicht auf — Spieler sehen present()-Kurztext.");
}

const jsonRoot = join(root, "src/game/json/quests");
async function dateien(dir) {
  const liste = [];
  for (const eintrag of await readdir(dir, { withFileTypes: true })) {
    const pfad = join(dir, eintrag.name);
    if (eintrag.isDirectory()) liste.push(...(await dateien(pfad)));
    else if (eintrag.name.endsWith(".json")) liste.push(pfad);
  }
  return liste;
}

let jsonKarten = 0;
for (const pfad of await dateien(jsonRoot)) {
  const roh = JSON.parse(await readFile(pfad, "utf8"));
  const szenen = [
    ...(roh.szenen ?? []),
    ...(roh.teile?.flatMap((teil) => teil.szenen ?? []) ?? []),
    ...(roh.lines && roh.id ? [roh] : []),
  ];
  for (const szene of szenen) {
    if (!szene?.id) continue;
    jsonKarten += 1;
    const jsonChars = mass(szene.lines);
    if (jsonChars < KURZ) {
      if (!AUSNAHME.has(szene.id)) mangel.push(`JSON kurz ${szene.id}: ${jsonChars} Zeichen (${pfad.slice(root.length + 1)})`);
      continue;
    }
    const gebunden = kanon(szene.id);
    if (gebunden + 40 < jsonChars) {
      mangel.push(`Verschoben ${szene.id}: JSON ${jsonChars} nicht im Spielkanon (${gebunden}) — ${pfad.slice(root.length + 1)}`);
    }
  }
}

const spielDateien = [
  "src/game/script.ts",
  "src/game/content.ts",
  "src/game/quest-brunnen.ts",
  "src/game/quest-muehle.ts",
  "src/game/quest-kesseljahr.ts",
  "src/game/kesseljahr-gewoelbe.ts",
  "src/game/kesseljahr-grete.ts",
  "src/game/kesseljahr-schluss.ts",
  "src/game/json/ankunft.ts",
];

function presents(text) {
  const out = [];
  let i = 0;
  while (true) {
    const j = text.indexOf("present({", i);
    if (j < 0) break;
    const start = text.indexOf("{", j);
    let depth = 0;
    let k = start;
    while (k < text.length) {
      if (text[k] === "{") depth += 1;
      else if (text[k] === "}") {
        depth -= 1;
        if (depth === 0) break;
      }
      k += 1;
    }
    const block = text.slice(start, k + 1);
    const id = block.match(/\bid:\s*"([^"]+)"/)?.[1];
    const title = block.match(/title:\s*"([^"]+)"/)?.[1];
    const lm = block.match(/lines:\s*\[([\s\S]*?)\]/);
    const lines = lm ? [...lm[1].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((m) => m[1]) : [];
    out.push({ id, title, lines, present: mass(lines) });
    i = j + 9;
  }
  return out;
}

let overlays = 0;
for (const rel of spielDateien) {
  const text = await readFile(join(root, rel), "utf8");
  for (const p of presents(text)) {
    const k = kanon(p.id);
    if (k >= KURZ && p.present + 40 < k) overlays += 1;
  }
}

if (mangel.length) {
  console.error(`Prosa: ${mangel.length} Fehler\n${mangel.join("\n")}`);
  process.exit(1);
}
console.log(`Prosa: ${jsonKarten} JSON-Karten gebunden, ${overlays} Kurz-present() hängen an der Vollform, Overlay in runtime.ts.`);
