import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loesePortrait } from "./portrait.ts";

describe("loesePortrait", () => {
  it("nimmt das gesetzte Gesicht", () => {
    assert.equal(loesePortrait({ gesetzt: "kern", zuletzt: "holm", artWechsel: true, seitenWechsel: true }), "kern");
  });
  it("nimmt keins, wenn null gesetzt ist und der Kanon keins hat", () => {
    assert.equal(loesePortrait({ gesetzt: null, zuletzt: "holm", artWechsel: false, seitenWechsel: false }), undefined);
  });
  it("nimmt den Kanon, wenn das Spiel null setzt", () => {
    assert.equal(
      loesePortrait({ gesetzt: null, kanon: "dennek", zuletzt: "holm", artWechsel: false, seitenWechsel: true }),
      "dennek",
    );
  });
  it("nimmt den Kanon, auch wenn zuletzt ein anderes Gesicht hängt", () => {
    assert.equal(loesePortrait({ kanon: "dennek", zuletzt: "kern", artWechsel: false, seitenWechsel: true }), "dennek");
  });
  it("wirft das Gesicht weg, wenn der Kanon keins hat", () => {
    assert.equal(loesePortrait({ kanon: null, zuletzt: "kern", artWechsel: false, seitenWechsel: true }), undefined);
  });
  it("wirft das Gesicht weg beim Ortswechsel", () => {
    assert.equal(loesePortrait({ zuletzt: "holm", artWechsel: true, seitenWechsel: false }), undefined);
  });
  it("wirft das Gesicht weg beim Seitenwechsel", () => {
    assert.equal(loesePortrait({ zuletzt: "mara", artWechsel: false, seitenWechsel: true }), undefined);
  });
  it("hält das Gesicht in derselben Unterhaltung", () => {
    assert.equal(loesePortrait({ zuletzt: "dennek", artWechsel: false, seitenWechsel: false }), "dennek");
  });
});
