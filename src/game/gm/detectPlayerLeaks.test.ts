import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHeld } from "../types.ts";
import { detectPlayerLeaks } from "./detectPlayerLeaks.ts";
import { mapHeldToPlayerHud } from "./mapHeldToPlayerHud.ts";

describe("detectPlayerLeaks", () => {
  it("findet loesungswegBrunnen am Held, nicht am Hud", () => {
    const held = createHeld("Test", 10, 10, 10);
    held.loesungswegBrunnen = "bestochen";
    assert.equal(
      detectPlayerLeaks(held).some((f) => f.schluessel === "loesungswegBrunnen"),
      true,
    );
    assert.deepEqual(detectPlayerLeaks(mapHeldToPlayerHud(held)), []);
  });
});
