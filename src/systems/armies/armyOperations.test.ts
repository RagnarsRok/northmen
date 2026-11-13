import { describe, expect, it } from "vitest";
import { createEmptyGameState } from "../../engine/initialState";
import type { GameState } from "../../engine/types";
import { createArmy, mergeArmies, splitArmy } from "./armyOperations";

function stateWithTerritory() {
  const state = createEmptyGameState(["A", "B", "C"]);
  return { ...state, territories: [{ id: "t1", name: "One", regionId: "r1", terrain: "forest" as const, primaryResource: "timber" as const, secondaryResource: "iron" as const, connections: [] }] };
}

describe("army operations", () => {
  it("creates armies with valid owners and locations", () => {
    const result = createArmy(stateWithTerritory(), "player-1", "t1", 4, "a1");
    expect(result.army.warriorCount).toBe(4);
    expect(result.state.armies).toHaveLength(1);
  });
  it("splits an army while preserving the total warriors", () => {
    const initial = createArmy(stateWithTerritory(), "player-1", "t1", 7, "a1").state;
    const result = splitArmy(initial, "a1", 3, "a2");
    expect(result.state.armies.reduce((n, a) => n + a.warriorCount, 0)).toBe(7);
    expect(result.state.armies.map(a => a.warriorCount).sort()).toEqual([3, 4]);
  });
  it("merges friendly armies sharing a location", () => {
    let state = createArmy(stateWithTerritory(), "player-1", "t1", 2, "a1").state;
    state = createArmy(state, "player-1", "t1", 5, "a2").state;
    const result = mergeArmies(state, ["a1", "a2"], "a3");
    expect(result.army.warriorCount).toBe(7);
    expect(result.state.armies).toHaveLength(1);
  });
  it("rejects merging armies from different territories", () => {
    let state: GameState = stateWithTerritory();
    state = { ...state, territories: [...state.territories, { ...state.territories[0], id: "t2", name: "Two" }] };
    state = createArmy(state, "player-1", "t1", 2, "a1").state;
    state = createArmy(state, "player-1", "t2", 2, "a2").state;
    expect(() => mergeArmies(state, ["a1", "a2"], "a3")).toThrow("Armies must share an owner and location to merge.");
  });
});
