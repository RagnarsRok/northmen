import { describe, expect, it } from "vitest";
import { createEmptyGameState } from "../../engine/initialState";
import { createArmy } from "./armyOperations";
import { moveExpeditionGroup, startLandExpedition, stopExpeditionGroup } from "./landMovement";

function fixture() {
  let state = createEmptyGameState(["A", "B", "C"]);
  const territories = [
    { id: "t1", name: "One", regionId: "r1", terrain: "forest" as const, primaryResource: "timber" as const, secondaryResource: "iron" as const, connections: [{ territoryId: "t2", type: "land" as const }] },
    { id: "t2", name: "Two", regionId: "r1", terrain: "forest" as const, primaryResource: "timber" as const, secondaryResource: "iron" as const, connections: [{ territoryId: "t1", type: "land" as const }, { territoryId: "t3", type: "land" as const }] },
    { id: "t3", name: "Three", regionId: "r1", terrain: "forest" as const, primaryResource: "timber" as const, secondaryResource: "iron" as const, connections: [{ territoryId: "t2", type: "land" as const }] },
  ];
  state = { ...state, territories, regions: [{ id: "r1", name: "Region", territoryIds: ["t1", "t2", "t3"], storage: { "player-1": { timber: 0, iron: 0, provisions: 10, fish: 0, silver: 0 } } }] };
  state = createArmy(state, "player-1", "t1", 4, "a1").state;
  return state;
}

describe("land expeditions", () => {
  it("charges one Provision per warrior once at departure", () => {
    const result = startLandExpedition(fixture(), "player-1", ["a1"], "exp1");
    expect(result.expedition.provisionsPaid).toBe(4);
    expect(result.state.regions[0].storage["player-1"].provisions).toBe(6);
  });
  it("moves along connected land links and can travel multiple territories", () => {
    const started = startLandExpedition(fixture(), "player-1", ["a1"], "exp1");
    const moved = moveExpeditionGroup(started.state, started.expedition, "a1", ["t1", "t2", "t3"]);
    expect(moved.state.armies[0].territoryId).toBe("t3");
    expect(moved.encounter).toBeUndefined();
  });
  it("stops at a hostile army and reports an encounter", () => {
    let state = fixture();
    state = createArmy(state, "player-2", "t2", 2, "enemy").state;
    const started = startLandExpedition(state, "player-1", ["a1"], "exp1");
    const moved = moveExpeditionGroup(started.state, started.expedition, "a1", ["t1", "t2", "t3"]);
    expect(moved.state.armies.find(a => a.id === "a1")?.territoryId).toBe("t2");
    expect(moved.encounter?.enemyArmyIds).toEqual(["enemy"]);
  });
  it("does not allow disconnected or non-land routes", () => {
    const started = startLandExpedition(fixture(), "player-1", ["a1"], "exp1");
    expect(() => moveExpeditionGroup(started.state, started.expedition, "a1", ["t1", "t3"])).toThrow(/No land connection/);
  });
  it("allows a group to stop for the rest of the expedition", () => {
    const started = startLandExpedition(fixture(), "player-1", ["a1"], "exp1");
    const stopped = stopExpeditionGroup(started.expedition, "a1");
    expect(stopped.groups[0].active).toBe(false);
  });
});
