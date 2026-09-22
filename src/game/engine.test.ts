import assert from "node:assert/strict";
import test from "node:test";
import { probeErfolg, probeSumme } from "./probe-rechnung.ts";

test("Probe: Summe = W10 + Attribut + Zeit + Nebel", () => {
  assert.equal(probeSumme(7, 10, 0, 0), 17);
  assert.equal(probeSumme(7, 10, -2, -2), 13);
  assert.equal(probeErfolg(8, 8), true);
  assert.equal(probeErfolg(11, 12), false);
  assert.equal(probeErfolg(15, 15), true);
});

test("Erschöpfung und Nebel werden addiert, nicht verdoppelt", () => {
  const attributNachLast = 10 - 1;
  const nebel = -2;
  const zeitNachtKampf = -2;
  const summe = probeSumme(8, attributNachLast, zeitNachtKampf, nebel);
  assert.equal(summe, 13);
  assert.equal(probeErfolg(summe, 12), true);
  assert.equal(probeErfolg(summe, 15), false);
});
