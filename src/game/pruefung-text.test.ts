import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { istStichpunkt, pruefeSzeneBild, pruefeSzeneText, zeilenMass } from "./pruefung-text.ts";

describe("zeilenMass", () => {
  it("erkennt leere Szenen", () => {
    const mass = zeilenMass(["", "  "]);
    assert.equal(mass.leer, true);
    assert.equal(mass.chars, 0);
  });
  it("erkennt kurze Szenen", () => {
    const mass = zeilenMass(["Das Rad mahlt nichts."]);
    assert.equal(mass.kurz, true);
    assert.equal(mass.leer, false);
  });
  it("lässt volle Absätze durch", () => {
    const mass = zeilenMass([
      "Der Wassereimer am Dorfbrunnen steht noch halb voll von der Nacht. Niemand hat ihn geleert, nicht vor dem Brot, nicht vor dem Vieh.",
      "Das Wasser hat die Farbe von aufgewühltem Teichgrund, und das Kind vor der Apotheke hustet trocken.",
    ]);
    assert.equal(mass.leer, false);
    assert.equal(mass.kurz, false);
    assert.equal(mass.stichpunkt, false);
  });
});

describe("istStichpunkt", () => {
  it("fängt Listen ab", () => {
    assert.equal(istStichpunkt("- trübes Wasser"), true);
    assert.equal(istStichpunkt("1. Dennek rührt"), true);
    assert.equal(istStichpunkt("Der Wassereimer steht halb voll von der Nacht."), false);
  });
});

describe("pruefeSzeneText", () => {
  it("meldet leer", () => {
    const mangel = pruefeSzeneText({ id: "x", title: "X", lines: [] }, "test");
    assert.equal(mangel[0]?.grund, "leer");
  });
});

describe("pruefeSzeneBild", () => {
  const art = new Set(["well", "mill"]);
  const portraits = new Set(["kern", "holm"]);
  it("meldet unbekanntes Bild", () => {
    const mangel = pruefeSzeneBild({ id: "x", title: "X", art: "dungeon" }, art, portraits);
    assert.equal(mangel[0]?.grund, "bild");
  });
  it("meldet unbekanntes Porträt", () => {
    const mangel = pruefeSzeneBild({ id: "x", title: "X", art: "well", portrait: "ghost" }, art, portraits);
    assert.equal(mangel[0]?.grund, "portrait");
  });
  it("lässt gültige Schlüssel durch", () => {
    const mangel = pruefeSzeneBild({ id: "x", title: "X", art: "well", portrait: "kern" }, art, portraits);
    assert.equal(mangel.length, 0);
  });
  it("erlaubt fehlendes Porträt", () => {
    const mangel = pruefeSzeneBild({ id: "x", title: "X", art: "mill", portrait: null }, art, portraits);
    assert.equal(mangel.length, 0);
  });
});
