import assert from "node:assert/strict";
import test from "node:test";
import { SAVE_VERSION, SavePayloadSchema } from "./heldSchema.ts";

test("Import weist veraltete und kaputte JSON ab", () => {
  assert.equal(SavePayloadSchema.safeParse({}).success, false);
  assert.equal(SavePayloadSchema.safeParse({ version: 9, held: { name: "X" } }).success, false);
});

test("Version 1 bleibt gültig und liegt unter der aktuellen Fassung", () => {
  const roh = {
    version: 1,
    savedAt: "2026-01-01T00:00:00.000Z",
    held: {
      name: "Ilse",
      staerke: 10,
      geschick: 10,
      charisma: 10,
      lp: 7,
      inventar: ["Schlüssel"],
      gold: 3,
      lebend: true,
    },
  };
  const stand = SavePayloadSchema.safeParse(roh);
  assert.equal(stand.success, true);
  if (stand.success) {
    assert.ok(stand.data.version <= SAVE_VERSION);
    assert.equal(stand.data.held.name, "Ilse");
    assert.equal(stand.data.held.lp, 7);
  }
});
