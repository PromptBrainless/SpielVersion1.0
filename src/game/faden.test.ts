import assert from "node:assert/strict";
import test from "node:test";
import { fadenAnzahl, schliesseFaden } from "./faden.ts";
import { createHeld } from "./types.ts";

test("fadenAnzahl zählt nur gesetzte Fäden", () => {
  const held = createHeld("Test", 10, 10, 10);
  assert.equal(fadenAnzahl(held), 0);
  held.fadenRinne = true;
  held.fadenHolm = true;
  assert.equal(fadenAnzahl(held), 2);
  held.schnurLetzterKnoten = true;
  held.glockeNamenGelesen = true;
  held.koehlerBefragt = true;
  assert.equal(fadenAnzahl(held), 5);
});

test("schliesseFaden setzt Weg und Schloss", () => {
  const held = createHeld("Test", 10, 10, 10);
  schliesseFaden(held, "anvertraut");
  assert.equal(held.ungerufenerNameGeloest, "anvertraut");
  assert.equal(held.fadenGeschlossen, true);
});
