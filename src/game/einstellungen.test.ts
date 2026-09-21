import { deepStrictEqual, strictEqual } from "node:assert/strict";
import test from "node:test";
import {
  EINSTELLUNGEN_STANDARD,
  abonniere,
  bewegungErlaubt,
  leseEinstellungen,
  normalisiere,
  setzeEinstellung,
  setzeZurueck,
} from "./einstellungen.ts";

test("normalisiere: leere Eingabe ergibt die Standardwerte", () => {
  deepStrictEqual(normalisiere(undefined), EINSTELLUNGEN_STANDARD);
  deepStrictEqual(normalisiere({}), EINSTELLUNGEN_STANDARD);
  deepStrictEqual(normalisiere(null), EINSTELLUNGEN_STANDARD);
});

test("normalisiere: Lautstärken bleiben zwischen 0 und 1", () => {
  const e = normalisiere({ ton: { gesamt: 7, ambiente: -3, effekte: 0.4 } });
  strictEqual(e.ton.gesamt, 1);
  strictEqual(e.ton.ambiente, 0);
  strictEqual(e.ton.effekte, 0.4);
});

test("normalisiere: unbekannte Auswahl fällt auf den Standard zurück", () => {
  const e = normalisiere({ optik: { textgroesse: "riesengross", bewegung: "voll", kontrast: 7 } });
  strictEqual(e.optik.textgroesse, EINSTELLUNGEN_STANDARD.optik.textgroesse);
  strictEqual(e.optik.bewegung, "voll");
  strictEqual(e.optik.kontrast, "normal");
});

test("normalisiere: Zeilenabstand und Bildhöhe bleiben im lesbaren Bereich", () => {
  strictEqual(normalisiere({ optik: { zeilenabstand: 9 } }).optik.zeilenabstand, 2.1);
  strictEqual(normalisiere({ optik: { zeilenabstand: 0.2 } }).optik.zeilenabstand, 1.3);
  strictEqual(normalisiere({ optik: { bildhoehe: 5 } }).optik.bildhoehe, 1.3);
  strictEqual(normalisiere({ optik: { bildhoehe: "Unsinn" } }).optik.bildhoehe, 1);
});

test("normalisiere: Schalter nehmen nur echte Wahrheitswerte", () => {
  const e = normalisiere({ spiel: { autospeichern: "ja", ziffernwahl: false } });
  strictEqual(e.spiel.autospeichern, true, "„ja“ ist kein Wahrheitswert, also gilt der Standard");
  strictEqual(e.spiel.ziffernwahl, false);
});

test("setzeEinstellung ändert nur den genannten Teil und meldet es", () => {
  setzeZurueck();
  let gemeldet = 0;
  const loesen = abonniere(() => {
    gemeldet += 1;
  });

  setzeEinstellung("ton", { an: true, gesamt: 0.3 });
  strictEqual(leseEinstellungen().ton.an, true);
  strictEqual(leseEinstellungen().ton.gesamt, 0.3);
  strictEqual(
    leseEinstellungen().ton.effekte,
    EINSTELLUNGEN_STANDARD.ton.effekte,
    "Unberührtes bleibt stehen",
  );
  strictEqual(leseEinstellungen().optik.textgroesse, EINSTELLUNGEN_STANDARD.optik.textgroesse);
  strictEqual(gemeldet, 1);

  loesen();
  setzeEinstellung("ton", { an: false });
  strictEqual(gemeldet, 1, "Nach dem Abmelden kommt nichts mehr an");
  setzeZurueck();
});

test("bewegungErlaubt: „ruhig“ lässt kleine Regungen zu, große nicht", () => {
  setzeEinstellung("optik", { bewegung: "voll" });
  strictEqual(bewegungErlaubt("klein"), true);
  strictEqual(bewegungErlaubt("gross"), true);

  setzeEinstellung("optik", { bewegung: "wenig" });
  strictEqual(bewegungErlaubt("klein"), true);
  strictEqual(bewegungErlaubt("gross"), false);

  setzeEinstellung("optik", { bewegung: "aus" });
  strictEqual(bewegungErlaubt("klein"), false);
  strictEqual(bewegungErlaubt("gross"), false);
  setzeZurueck();
});
