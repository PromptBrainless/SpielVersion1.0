import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sprecherAusZeilen } from "./sprecher.ts";

describe("sprecherAusZeilen", () => {
  it("nimmt die eine Figur im Text", () => {
    assert.equal(
      sprecherAusZeilen(["Kern hat die Ärmel hochgekrempelt.", "„Das Wasser nimmt sich, wen es kriegt“, sagt sie."]),
      "kern",
    );
  });
  it("rät nicht bei zwei Namen ohne klare Rede", () => {
    assert.equal(sprecherAusZeilen(["Fenn bleibt an der Mauer. Vahl sitzt im Rathaus."]), undefined);
  });
});
