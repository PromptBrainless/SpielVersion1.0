import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const jsonRoot = resolve(root, "src/game/json/quests");
const artRoot = resolve(root, "public/art");
const KURZ = 160;

function istStichpunkt(zeile) {
  const text = String(zeile).trim();
  if (!text) return false;
  return /^\s*[-*•–]\s/.test(zeile) || /^\s*\d+[.)]\s/.test(zeile);
}

async function dateien(dir) {
  const liste = [];
  for (const eintrag of await readdir(dir, { withFileTypes: true })) {
    const pfad = join(dir, eintrag.name);
    if (eintrag.isDirectory()) liste.push(...(await dateien(pfad)));
    else if (eintrag.name.endsWith(".json")) liste.push(pfad);
  }
  return liste;
}

const mangel = [];
for (const pfad of await dateien(jsonRoot)) {
  const roh = JSON.parse(await readFile(pfad, "utf8"));
  const szenen = Array.isArray(roh.szenen) ? roh.szenen : roh.teile?.flatMap((teil) => teil.szenen) ?? (roh.lines ? [roh] : []);
  for (const szene of szenen) {
    if (!szene || !szene.id) continue;
    const sauber = (szene.lines ?? []).map((zeile) => String(zeile).trim()).filter(Boolean);
    const chars = sauber.join(" ").length;
    if (!sauber.length) mangel.push(`${szene.id}: leer (${pfad.slice(root.length + 1)})`);
    else if (chars < KURZ) mangel.push(`${szene.id}: kurz ${chars} Zeichen`);
    if (sauber.some(istStichpunkt)) mangel.push(`${szene.id}: Stichpunkt`);
  }
}

const bilder = [
  "title","road","stranger","village","townhall","tavern","well","mill","apothecary","smithy",
  "forest","ditch","chapel","camp","evidence","sneak","combat","gate","death","return",
  "holm","mara","kess","miller","kern","sanna","smith","beggar","grovin",
];
for (const name of bilder) {
  const jpg = join(artRoot, `${name}.jpg`);
  if (!existsSync(jpg)) mangel.push(`Bild fehlt: public/art/${name}.jpg`);
}

if (mangel.length) {
  console.error(mangel.join("\n"));
  process.exit(1);
}
console.log("Szenen, Bilder, Porträts: in Ordnung.");
