import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] ?? "http://127.0.0.1:8080/";
const outDir = "/workspace/screenshots";
await mkdir(outDir, { recursive: true });

const held = {
  name: "Teserin",
  staerke: 10,
  geschick: 10,
  charisma: 10,
  lp: 10,
  inventar: [],
  gold: 4,
  lebend: true,
  holmBesucht: true,
  auftragErhalten: true,
};

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_PATH || undefined,
});

const findings = [];

async function lauf(page, name) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate((payload) => {
    localStorage.setItem("lindendorf-save-v1", JSON.stringify(payload));
    localStorage.removeItem("lindendorf.welt.an");
    localStorage.removeItem("lindendorf.welt.v2");
  }, { version: 1, savedAt: "2026-09-20T00:00:00.000Z", held });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Spielstand laden" }).click();
  await page.getByRole("heading", { name: "Dorfplatz" }).waitFor();

  const wissen = page.getByRole("button", { name: /Wissen/ });
  const welt = page.getByRole("button", { name: /^Welt/ });
  const speichern = page.getByRole("button", { name: "Speichern" });
  if (!(await wissen.isVisible())) findings.push(`${name}: Wissen unsichtbar`);
  if (!(await welt.isVisible())) findings.push(`${name}: Welt unsichtbar`);
  if (!(await speichern.isVisible())) findings.push(`${name}: Speichern unsichtbar`);

  const wissenLabel = ((await wissen.getAttribute("aria-label")) ?? (await wissen.innerText())).replace(/\s+/g, " ").trim();
  if (!wissenLabel.includes("(7)")) findings.push(`${name}: Wissen zählt nicht 7, sondern „${wissenLabel}“`);
  const weltLabel = ((await welt.getAttribute("aria-label")) ?? (await welt.innerText())).replace(/\s+/g, " ").trim();
  if (weltLabel.includes("Auflage") || weltLabel.includes("●")) {
    findings.push(`${name}: Welt-Punkt ohne Auflage: „${weltLabel}“`);
  }

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  if (overflow) findings.push(`${name}: horizontaler Overflow`);

  await welt.click();
  await page.getByRole("button", { name: "Karte" }).waitFor();
  await page.getByRole("button", { name: "Held" }).waitFor();
  await page.getByRole("button", { name: "Prüfen" }).waitFor();
  if ((await welt.getAttribute("aria-pressed")) !== "true") {
    findings.push(`${name}: Welt ohne aria-pressed`);
  }

  const bild = page.locator("img, video").first();
  const aside = page.locator("aside").last();
  if (await bild.isVisible()) {
    const a = await bild.boundingBox();
    const b = await aside.boundingBox();
    if (a && b) {
      const overlapH = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      const overlapW = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      if (overlapH > 24 && overlapW > 24) findings.push(`${name}: Schublade liegt über dem Bild`);
    }
  }

  await page.getByRole("button", { name: "Held" }).click();
  const heldText = await page.locator("aside").innerText();
  if (!heldText.includes("Gunst") || !heldText.includes("Lage")) {
    findings.push(`${name}: Held-Fach unvollständig`);
  }

  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Karte" }).waitFor({ state: "hidden" });

  await page.keyboard.press("Alt+s");
  await page.getByRole("button", { name: "Karte" }).waitFor();

  await wissen.click();
  const journal = await page.locator("body").innerText();
  if (!journal.includes("Holm") && !journal.includes("Lindendorf")) {
    findings.push(`${name}: Wissenstagebuch leer`);
  }

  await page.screenshot({ path: `${outDir}/hud-${name}.png`, fullPage: false });
}

try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await lauf(desktop, "desktop");
  await desktop.close();

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await lauf(mobile, "mobile");
  await mobile.close();
} finally {
  await browser.close();
}

if (findings.length) {
  console.error(JSON.stringify({ ok: false, findings }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, wissen: 7, welt: "ohne Punkt ohne Auflage", viewports: ["desktop", "mobile"] }));
}
