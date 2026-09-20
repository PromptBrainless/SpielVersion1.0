import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const outDir = "/workspace/qa-screenshots";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM ||
    "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
});

async function bisZumWeg(page) {
  await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Abenteuer starten" }).click();
  await page.getByRole("button", { name: "Die Geschichten" }).click();
  for (let i = 0; i < 12; i += 1) {
    const weiter = page.getByRole("button", { name: "Nach Lindendorf" });
    if (await weiter.isVisible().catch(() => false)) {
      await weiter.click();
      break;
    }
    await page.locator(".mt-5.grid.gap-2 button").first().click();
  }
  await page.getByRole("heading", { name: "Der Weg nach Lindendorf" }).waitFor({ timeout: 20000 });
}

const fehler = [];

const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await bisZumWeg(desktop);

const wissen = desktop.getByRole("button", { name: /Wissen/ });
const welt = desktop.getByRole("button", { name: /^Welt/ });
const speichern = desktop.getByRole("button", { name: "Speichern" });

if (!(await wissen.isVisible())) fehler.push("desktop: Wissen fehlt");
if (!(await welt.isVisible())) fehler.push("desktop: Welt fehlt");
if (!(await speichern.isVisible())) fehler.push("desktop: Speichern fehlt");

const wissenName = await wissen.getAttribute("aria-label");
if (!wissenName || !/\(\d+\)/.test(wissenName)) fehler.push(`desktop: Wissen ohne Zahl (${wissenName})`);

await welt.click();
await desktop.getByRole("button", { name: "Karte" }).waitFor();
if (!(await desktop.getByText("Kanon").first().isVisible().catch(() => false))) {
  fehler.push("desktop: Schublade ohne Kanon-Hinweis");
}
await desktop.getByRole("button", { name: "Held" }).click();
if (!(await desktop.getByText("Gunst").first().isVisible().catch(() => false))) {
  fehler.push("desktop: Fach Held ohne Gunst");
}
await desktop.getByRole("button", { name: "Prüfen" }).click();
if (!(await desktop.getByRole("button", { name: "Netz" }).isVisible())) {
  fehler.push("desktop: Fach Prüfen ohne Netz");
}
await desktop.getByRole("button", { name: "Karte" }).click();
await desktop.locator('label:has-text("Titel") input').fill("HUD-Testbrunnen");
await desktop.waitForTimeout(200);
const weltNachEdit = await welt.getAttribute("aria-label");
if (!weltNachEdit?.includes("weicht ab")) fehler.push(`desktop: Welt-Punkt nach Edit fehlt (${weltNachEdit})`);

await desktop.getByRole("heading", { name: "Welt" }).click().catch(() => undefined);
await desktop.getByRole("button", { name: "Schließen" }).click();
await desktop.waitForTimeout(200);
if (await desktop.locator("aside").filter({ hasText: "Karte" }).isVisible().catch(() => false)) {
  fehler.push("desktop: Schließen lässt die Schublade offen");
}

await desktop.keyboard.press("Alt+s");
await desktop.waitForTimeout(300);
if (!(await desktop.locator("aside").filter({ hasText: "Karte" }).isVisible().catch(() => false))) {
  fehler.push("desktop: Alt+S öffnet nicht");
} else {
  await desktop.keyboard.press("Escape");
  await desktop.waitForTimeout(300);
  if (await desktop.locator("aside").filter({ hasText: "Karte" }).isVisible().catch(() => false)) {
    fehler.push("desktop: Esc schließt die Schublade nicht");
  }
}

await desktop.screenshot({ path: `${outDir}/hud-desktop-welt.png`, fullPage: false });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await bisZumWeg(mobile);
const overflow = await mobile.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth + 1,
);
if (overflow) fehler.push("mobile: HUD läuft seitlich über");
const weltMobil = mobile.getByRole("button", { name: /^Welt/ });
if (!(await weltMobil.isVisible())) fehler.push("mobile: Welt-Knopf ohne Namen");
await weltMobil.click();
const drawer = mobile.locator("aside").filter({ hasText: "Welt" }).first();
if (!(await drawer.isVisible())) fehler.push("mobile: Schublade öffnet nicht");
await mobile.screenshot({ path: `${outDir}/hud-mobile-welt.png`, fullPage: false });

await browser.close();

const report = { ok: fehler.length === 0, fehler };
console.log(JSON.stringify(report, null, 2));
if (fehler.length) process.exit(1);
