import { describe, expect, it } from "vitest";
import { createEmptyGameState } from "../../engine/initialState";
import type { GameState } from "../../engine/types";
import {
  LONGBOAT_CONSTRUCTION_COST,
  LONGBOAT_WARRIOR_CAPACITY,
  canConstructLongboat,
  constructLongboat,
  loadArmyOntoLongboat,
  unloadArmyFromLongboat,
  captureEmptyLongboatByBoarding,
  captureLongboatAfterVictory,
  captureDockedLongboatByPortOccupation,
  destroyLongboat,
  neutralizePlayerLongboats,
  validateLongboatsAtTurnEnd,
} from "./longboats";

function fixture(): GameState {
  const base = createEmptyGameState(["A", "B", "C"]);
  return {
    ...base,
    regions: [{
      id: "r1", name: "Region", territoryIds: ["t1", "t2"],
      storage: {
        "player-1": { timber: 10, iron: 10, provisions: 10, fish: 0, silver: 10 },
        "player-2": { timber: 10, iron: 10, provisions: 10, fish: 0, silver: 10 },
      },
    }],
    territories: [
      { id: "t1", name: "Coast 1", regionId: "r1", terrain: "coastal", primaryResource: "timber", secondaryResource: "iron", connections: [] },
      { id: "t2", name: "Coast 2", regionId: "r1", terrain: "coastal", primaryResource: "timber", secondaryResource: "iron", connections: [] },
    ],
    ports: [{ id: "p1", ownerId: "player-1", territoryId: "t1" }],
    armies: [
      { id: "a1", ownerId: "player-1", territoryId: "t1", warriorCount: 3 },
      { id: "a2", ownerId: "player-2", territoryId: "t1", warriorCount: 2 },
    ],
    longboats: [],
  };
}

describe("Longboat construction and crew management", () => {
  it("uses the approved construction cost and five-warrior capacity", () => {
    expect(LONGBOAT_CONSTRUCTION_COST).toEqual({ timber: 3, iron: 1, provisions: 2, fish: 0, silver: 2 });
    expect(LONGBOAT_WARRIOR_CAPACITY).toBe(5);
  });

  it("constructs at an owned port, deducts resources and records its home port", () => {
    const state = fixture();
    expect(canConstructLongboat(state, "player-1", "p1")).toBe(true);
    const next = constructLongboat(state, "player-1", "p1", "boat-1");
    expect(next.longboats[0]).toMatchObject({ id: "boat-1", ownerId: "player-1", homePortId: "p1", portId: "p1", location: "at-port" });
    expect(next.regions[0].storage["player-1"]).toMatchObject({ timber: 7, iron: 9, provisions: 8, silver: 8 });
  });

  it("allows only one longboat per home port", () => {
    const state = constructLongboat(fixture(), "player-1", "p1", "boat-1");
    expect(canConstructLongboat(state, "player-1", "p1")).toBe(false);
  });

  it("loads only the owner's army, with no more than five warriors", () => {
    const state = { ...fixture(), longboats: [{ id: "boat-1", ownerId: "player-1", territoryId: "t1", location: "at-port" as const, homePortId: "p1", portId: "p1" }] };
    expect(loadArmyOntoLongboat(state, "player-1", "boat-1", "a1").armies[0].longboatId).toBe("boat-1");
    expect(loadArmyOntoLongboat(state, "player-1", "boat-1", "a2")).toBe(state);
    const oversized = { ...state, armies: [{ ...state.armies[0], warriorCount: 6 }] };
    expect(loadArmyOntoLongboat(oversized, "player-1", "boat-1", "a1")).toBe(oversized);
  });

  it("unloads its army only when the boat is at a coast or port", () => {
    const state = {
      ...fixture(),
      longboats: [{ id: "boat-1", ownerId: "player-1", territoryId: "t1", location: "anchored" as const }],
      armies: [{ id: "a1", ownerId: "player-1", territoryId: "t1", warriorCount: 3, longboatId: "boat-1" }],
    };
    expect(unloadArmyFromLongboat(state, "player-1", "boat-1").armies[0].longboatId).toBeUndefined();
  });
});

describe("Longboat capture and loss", () => {
  it("captures an empty boat only by physically boarding it", () => {
    const state = {
      ...fixture(),
      longboats: [{ id: "boat-1", ownerId: undefined, territoryId: "t1", location: "anchored" as const }],
    };
    const next = captureEmptyLongboatByBoarding(state, "player-2", "boat-1", "a2");
    expect(next.longboats[0].ownerId).toBe("player-2");
    expect(next.armies.find((army) => army.id === "a2")?.longboatId).toBe("boat-1");
  });

  it("transfers a crewed boat after victory and eliminates its crew", () => {
    const state = {
      ...fixture(),
      longboats: [{ id: "boat-1", ownerId: "player-1", territoryId: "t1", location: "anchored" as const }],
      armies: [{ id: "a1", ownerId: "player-1", territoryId: "t1", warriorCount: 3, longboatId: "boat-1" }, stateArmy("a2", "player-2")],
    };
    const next = captureLongboatAfterVictory(state, "player-2", "boat-1", true);
    expect(next.longboats[0].ownerId).toBe("player-2");
    expect(next.armies.some((army) => army.id === "a1")).toBe(false);
  });

  it("captures a docked boat when an enemy warrior occupies the port", () => {
    const state = {
      ...fixture(),
      longboats: [{ id: "boat-1", ownerId: "player-1", territoryId: "t1", location: "at-port" as const, portId: "p1" }],
    };
    expect(captureDockedLongboatByPortOccupation(state, "player-2", "p1").longboats[0].ownerId).toBe("player-2");
  });

  it("destroys the vessel and its crew in a shipwreck", () => {
    const state = {
      ...fixture(),
      longboats: [{ id: "boat-1", ownerId: "player-1", territoryId: "t1", location: "anchored" as const }],
      armies: [{ id: "a1", ownerId: "player-1", territoryId: "t1", warriorCount: 3, longboatId: "boat-1" }],
    };
    const next = destroyLongboat(state, "boat-1");
    expect(next.longboats).toHaveLength(0);
    expect(next.armies).toHaveLength(0);
  });

  it("neutralizes vessels on player elimination and rejects open-ocean turn endings", () => {
    const state = { ...fixture(), longboats: [
      { id: "boat-1", ownerId: "player-1", territoryId: "t1", location: "anchored" as const },
      { id: "boat-2", ownerId: "player-1", territoryId: "t1", location: "at-sea" as const },
    ] };
    expect(neutralizePlayerLongboats(state, "player-1").longboats[0].ownerId).toBeUndefined();
    expect(validateLongboatsAtTurnEnd(state)).toBe(false);
    const inland = {
      ...fixture(),
      territories: [{ id: "inland", name: "Inland", regionId: "r1", terrain: "forest" as const, primaryResource: "timber" as const, secondaryResource: "iron" as const, connections: [] }],
      longboats: [{ id: "boat-3", ownerId: "player-1", territoryId: "inland", location: "anchored" as const }],
    };
    expect(validateLongboatsAtTurnEnd(inland)).toBe(false);
  });
});

function stateArmy(id: string, ownerId: string) {
  return { id, ownerId, territoryId: "t1", warriorCount: 2 };
}
