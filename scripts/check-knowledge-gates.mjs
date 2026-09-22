import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const gameDir = resolve(root, "src/game");
const script = await readFile(resolve(gameDir, "script.ts"), "utf8");
const knowledge = await readFile(resolve(gameDir, "knowledge.ts"), "utf8");
const content = await readFile(resolve(root, "src/game/content.ts"), "utf8");
const questFiles = (await readdir(gameDir)).filter((name) => name.startsWith("quest-") && name.endsWith(".ts"));
const questSources = await Promise.all(questFiles.map((name) => readFile(resolve(gameDir, name), "utf8")));
const spiel = [script, ...questSources].join("\n");

const requiredKnowledge = [
  "artefakt_gesehen",
  "artefakt_erhalten",
  "holm_besucht",
  "auftrag_erhalten",
  "banditen_bekannt",
  "rotes_siegel_gesehen",
  "glockenweg_bekannt",
  "glocke_vorteil",
  "muehle_stillstand",
  "renniks_druck",
  "fluechtlinge_muehle",
  "wasser_truebung",
  "grovin_zisterne",
  "versorgung_muster",
  "gasse_leer",
  "kesseljahr",
  "ilses_liste",
  "ungerufener_name",
];
for (const key of requiredKnowledge) {
  if (!knowledge.includes(`"${key}"`)) throw new Error(`Wissenspunkt fehlt: ${key}`);
}

const requiredHooks = [
  "holmBesucht",
  "artefaktErhalten",
  "glockenwegLabel",
  "Was du weißt",
  "Nach dem roten Wachs fragen",
  "Zur Mühle gehen",
  "Den trüben Eimer prüfen",
  "spurenGefunden",
  "truebungBestaetigt",
  "loesungswegMuehle",
  "loesungswegBrunnen",
  "Zur Gerbereigasse gehen",
  "loesungswegGasse",
  "gasseGeschichteGehoert",
  "fadenGeschlossen",
];
for (const hook of requiredHooks) {
  if (!spiel.includes(hook)) throw new Error(`Freischalthaken fehlt: ${hook}`);
}

if (!content.includes("IntroArtifactContentSchema.parse")) {
  throw new Error("Die Intro-Contentdaten werden nicht gegen das Schema validiert.");
}

console.log("knowledge-keys=ok");
console.log("gate-hooks=ok");
console.log("content-schema=ok");
console.log(`quest-files=${questFiles.length}`);
