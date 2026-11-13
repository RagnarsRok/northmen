import { describe, expect, it } from "vitest";
import { createEmptyGameState } from "../../engine/initialState";
import { createArmy } from "./armyOperations";
import { moveMilitaryGroup, resolveMilitaryCombat, splitMilitaryGroup, startMilitaryExpedition } from "./militaryExpeditions";

function fixture() {
  let state = createEmptyGameState(["A", "B", "C"]);
  const territories = [
    { id: "t1", name: "One", regionId: "r1", terrain: "forest" as const, primaryResource: "timber" as const, secondaryResource: "iron" as const, connections: [{ territoryId: "t2", type: "land" as const }] },
    { id: "t2", name: "Two", regionId: "r1", terrain: "forest" as const, primaryResource: "timber" as const, secondaryResource: "iron" as const, connections: [{ territoryId: "t1", type: "land" as const }, { territoryId: "t3", type: "land" as const }] },
    { id: "t3", name: "Three", regionId: "r1", terrain: "forest" as const, primaryResource: "timber" as const, secondaryResource: "iron" as const, connections: [{ territoryId: "t2", type: "land" as const }] },
  ];
  state = { ...state, territories, regions: [{ id: "r1", name: "Region", territoryIds: ["t1", "t2", "t3"], storage: { "player-1": { timber: 0, iron: 0, provisions: 20, fish: 0, silver: 0 } } }] };
  state = createArmy(state, "player-1", "t1", 4, "a1").state;
  state = createArmy(state, "player-1", "t3", 4, "a2").state;
  return state;
}

describe("integrated military expeditions", () => {
  it("charges separate origin-region pools for a coordinated expedition", () => {
    const state = fixture();
    const started = startMilitaryExpedition(state, "player-1", ["a1", "a2"], "mx1");
    expect(started.expedition.provisionsPaid).toBe(8);
    expect(started.state.regions[0].storage["player-1"].provisions).toBe(12);
  });

  it("splits a group during an expedition without charging more Provisions", () => {
    const started = startMilitaryExpedition(fixture(), "player-1", ["a1"], "mx1");
    const split = splitMilitaryGroup(started.state, started.expedition, "a1", 2, "a3");
    expect(split.expedition.groups.map((group) => group.armyId)).toEqual(["a1", "a3"]);
    expect(split.state.armies.find((army) => army.id === "a1")?.warriorCount).toBe(2);
    expect(split.state.armies.find((army) => army.id === "a3")?.warriorCount).toBe(2);
    expect(split.expedition.provisionsPaid).toBe(4);
  });

  it("supports coordinated attacks and attacker-chosen casualty allocation", () => {
    let state = fixture();
    state = createArmy(state, "player-2", "t2", 2, "def").state;
    const started = startMilitaryExpedition(state, "player-1", ["a1", "a2"], "mx1");
    const first = moveMilitaryGroup(started.state, started.expedition, "a1", ["t1", "t2"]);
    const second = moveMilitaryGroup(first.state, first.expedition, "a2", ["t3", "t2"]);
    const result = resolveMilitaryCombat(second.state, second.expedition, "t2", ["a1", "a2"], "def", [{ attackerRolls: [1, 1, 1], defenderRolls: [6, 5], attackerCasualtyArmyIds: ["a1", "a1"], continueAttack: false, coordinatedWithdrawalTerritoryId: "t1" }]);
    expect(result.outcome).toBe("attacker-withdraws");
    expect(result.state.armies.filter((army) => army.ownerId === "player-1").every((army) => army.territoryId === "t1")).toBe(true);
    expect(result.state.armies.find((army) => army.id === "a1")?.warriorCount).toBe(2);
    expect(result.state.armies.find((army) => army.id === "a2")?.warriorCount).toBe(4);
  });

  it("leaves an engagement incomplete when more combat rounds are needed", () => {
    let state = fixture();
    state = createArmy(state, "player-2", "t2", 5, "def").state;
    const started = startMilitaryExpedition(state, "player-1", ["a1"], "mx1");
    const moved = moveMilitaryGroup(started.state, started.expedition, "a1", ["t1", "t2"]);
    const result = resolveMilitaryCombat(moved.state, moved.expedition, "t2", ["a1"], "def", [{ attackerRolls: [3, 2, 1], defenderRolls: [6, 5], attackerCasualtyArmyIds: ["a1", "a1"], continueAttack: true }]);
    expect(result.outcome).toBe("combat-incomplete");
    expect(result.roundsResolved).toBe(1);
  });
});
