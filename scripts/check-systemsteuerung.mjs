/**
 * Prüft die Systemsteuerung und das klebende HUD im laufenden Dev-Server.
 *
 *   npm run dev
 *   npm run check:system
 *
 * Geprüft wird, was beim Ansehen leicht durchrutscht: ob die Einstellungen
 * von jedem Bildschirm erreichbar sind, ob eine geänderte Textgröße wirklich
 * im Dokument ankommt, ob das HUD beim Scrollen oben bleibt und ob auf
 * 390 Pixeln nichts seitwärts schiebt.
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const ZIEL = process.env.CHECK_URL || "http://127.0.0.1:8080/";
const BILDER = "qa-screenshots";
const BROWSER =
  process.env.PLAYWRIGHT_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

await mkdir(BILDER, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: BROWSER,
  args: ["--no-sandbox"],
});

const fehler = [];
function pruefe(bedingung, satz) {
  if (!bedingung) fehler.push(satz);
}

async function frischeSeite(viewport, marke) {
  const page = await browser.newPage({ viewport });
  page.on("pageerror", (e) => fehler.push(`${marke}: ${e}`));
  await page.goto(ZIEL, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  return page;
}

/** Vom Titel bis zur ersten echten Szene. */
async function bisZurSzene(page) {
  await page.getByRole("button", { name: "Abenteuer starten" }).click();
  await page.waitForTimeout(400);
  await page
    .getByRole("button", { name: "Die Geschichten" })
    .click()
    .catch(() => {});
  for (let i = 0; i < 14; i += 1) {
    const weiter = page.getByRole("button", { name: "Nach Lindendorf" });
    if (await weiter.isVisible().catch(() => false)) {
      await weiter.click();
      break;
    }
    await page
      .locator(".mt-5.grid.gap-2 button, .mt-3.grid.gap-2 button")
      .first()
      .click()
      .catch(() => {});
    await page.waitForTimeout(120);
  }
  await page.getByRole("heading", { name: "Der Weg nach Lindendorf" }).waitFor({ timeout: 20000 });
}

// ------------------------------------------------------------------ Desktop

const desktop = await frischeSeite({ width: 1280, height: 860 }, "desktop");

const knopfTitel = desktop.getByRole("button", { name: "Einstellungen", exact: true }).first();
pruefe(await knopfTitel.isVisible(), "Titelbild: Einstellungen fehlen");
await knopfTitel.click();
await desktop.waitForTimeout(300);

for (const fach of ["Ton", "Bild", "Text", "Spiel", "Stände"]) {
  const reiter = desktop.getByRole("button", { name: fach, exact: true });
  pruefe(await reiter.isVisible(), `Systemsteuerung: Fach ${fach} fehlt`);
}

// Eine Änderung muss im Dokument ankommen, nicht nur im Zustand.
await desktop.getByRole("button", { name: "Text", exact: true }).click();
await desktop.getByRole("radio", { name: "Sehr groß" }).click();
await desktop.getByRole("radio", { name: "Hoch", exact: true }).click();
await desktop.waitForTimeout(300);
const gestellt = await desktop.evaluate(() => ({
  groesse: document.documentElement.dataset.textgroesse,
  kontrast: document.documentElement.dataset.kontrast,
  px: parseFloat(getComputedStyle(document.documentElement).fontSize),
}));
pruefe(gestellt.groesse === "riesig", "Textgröße kommt nicht im Dokument an");
pruefe(gestellt.kontrast === "hoch", "Kontrast kommt nicht im Dokument an");
pruefe(gestellt.px > 16, `Große Schrift skaliert nicht (${gestellt.px}px)`);
await desktop.screenshot({ path: `${BILDER}/system-text-gross.png` });

// Überlebt die Einstellung ein Neuladen?
await desktop.reload({ waitUntil: "networkidle" });
await desktop.waitForTimeout(400);
const nachLaden = await desktop.evaluate(() => document.documentElement.dataset.textgroesse);
pruefe(nachLaden === "riesig", "Einstellung überlebt das Neuladen nicht");

await desktop.evaluate(() => localStorage.clear());
await desktop.reload({ waitUntil: "networkidle" });
await bisZurSzene(desktop);

for (const [name, muster] of [
  ["Speichern", "Speichern"],
  ["Wissen", /Wissen/],
  ["Welt", /^Welt/],
  ["Einstellungen", "Einstellungen"],
]) {
  const knopf =
    typeof muster === "string"
      ? desktop.getByRole("button", { name: muster, exact: true })
      : desktop.getByRole("button", { name: muster });
  pruefe(await knopf.first().isVisible(), `HUD: ${name} fehlt`);
}

// Taste E öffnet die Systemsteuerung mitten im Spiel.
await desktop.keyboard.press("e");
await desktop.waitForTimeout(350);
pruefe(
  await desktop.getByRole("dialog", { name: /Einstellungen/ }).isVisible(),
  "Taste E öffnet die Systemsteuerung nicht",
);
await desktop.keyboard.press("Escape");
await desktop.waitForTimeout(250);
await desktop.screenshot({ path: `${BILDER}/system-szene.png` });

// -------------------------------------------------------------------- Mobil

const mobil = await frischeSeite(
  { width: 390, height: 844, isMobile: true, hasTouch: true },
  "mobil",
);
pruefe(
  await mobil.getByRole("button", { name: "Einstellungen", exact: true }).first().isVisible(),
  "Mobil: Einstellungen am Titel fehlen",
);
await bisZurSzene(mobil);

// Das HUD muss beim Lesen oben bleiben, sonst ist es beim Scrollen weg.
await mobil.evaluate(() => window.scrollTo(0, 600));
await mobil.waitForTimeout(400);
const haftung = await mobil.evaluate(() => {
  const kopf = document.querySelector(".sticky");
  return kopf ? kopf.getBoundingClientRect().top : null;
});
pruefe(haftung !== null && Math.abs(haftung) < 2, `HUD klebt nicht oben (top=${haftung})`);

const quer = await mobil.evaluate(() => ({
  scroll: document.documentElement.scrollWidth,
  sicht: document.documentElement.clientWidth,
}));
pruefe(quer.scroll <= quer.sicht + 1, `Mobil schiebt seitwärts (${quer.scroll} > ${quer.sicht})`);
await mobil.screenshot({ path: `${BILDER}/system-mobil.png` });

await browser.close();

if (fehler.length) {
  console.error("systemsteuerung=fehler");
  for (const satz of fehler) console.error(` - ${satz}`);
  process.exit(1);
}
console.log("systemsteuerung=ok");
console.log("hud-haftung=ok");
console.log(`bilder=${BILDER}`);
