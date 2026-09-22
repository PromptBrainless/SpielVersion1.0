import assert from "node:assert/strict";
import test from "node:test";
import { goldNieNegativ, klemme, zustandFifo } from "./herkunft-fifo.ts";
import { urteilAusrichtung } from "./herkunft-urteil.ts";

test("FIFO: der vierte Zustand nimmt den ältesten", () => {
  assert.deepEqual(zustandFifo(["a", "b", "c"], ["d"]), ["b", "c", "d"]);
});

test("FIFO: derselbe Zustand rutscht ans Ende", () => {
  assert.deepEqual(zustandFifo(["a", "b", "c"], ["a"]), ["b", "c", "a"]);
});

test("LP bleibt im Korridor 4–10, Zurückbleiben setzt 4", () => {
  assert.equal(klemme(8 - 2), 6);
  assert.equal(klemme(8 - 6), 4);
  assert.equal(klemme(8 + 4), 10);
  assert.equal(4, 4);
});

test("Gold fällt nicht unter 0", () => {
  assert.equal(goldNieNegativ(0, -1), 0);
  assert.equal(goldNieNegativ(2, -1), 1);
});

test("Gleichstand bricht Lage 10", () => {
  const lesung = urteilAusrichtung([
    "gnade",
    "ordnung",
    "gnade",
    "ordnung",
    "gnade",
    "ordnung",
    "gnade",
    "nutzen",
    "nutzen",
    "ordnung",
  ]);
  assert.equal(lesung.art, "ordnung");
  assert.equal(lesung.zwiespalt, false);
});
