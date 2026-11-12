import { describe, expect, it } from "vitest";
import { createEmptyGameState } from "../../engine/initialState";
import type { GameState, VoyageEventCard } from "../../engine/types";
import {
  calculateActualOceanSurcharge,
  calculateMaximumOceanSurcharge,
  calculateMaximumVoyageProvisions,
} from "./voyageCosts";
import {
  drawVoyageEventCards,
  resolveVoyageEventChoice,
} from "./voyageEvents";
import {
  canCommitOceanVoyage,
  findMaritimePath,
  moveLongboatAlongCoast,
  beginOceanVoyage,
  resolvePendingOceanVoyage,
} from "./maritimeMovement";

function fixture(): GameState {
  const base = createEmptyGameState(["A", "B", "C"]);
  return {
    ...base,
    regions: [{ id: "r1", name: "Region", territoryIds: ["coast-1", "coast-2", "ocean-1"], storage: {
      "player-1": { timber: 0, iron: 0, provisions: 30, fish: 0, silver: 0 },
    } }],
    territories: [
      { id: "coast-1", name: "Coast 1", regionId: "r1", terrain: "coastal", primaryResource: "timber", secondaryResource: "iron", connections: [{ territoryId: "coast-2", type: "coastal" }, { territoryId: "ocean-1", type: "open-ocean" }] },
      { id: "coast-2", name: "Coast 2", regionId: "r1", terrain: "coastal", primaryResource: "timber", secondaryResource: "iron", connections: [{ territoryId: "coast-1", type: "coastal" }] },
      { id: "ocean-1", name: "Ocean destination", regionId: "r1", terrain: "coastal", primaryResource: "timber", secondaryResource: "iron", connections: [{ territoryId: "coast-1", type: "open-ocean" }] },
    ],
    longboats: [{ id: "boat-1", ownerId: "player-1", territoryId: "coast-1", location: "anchored" }],
    armies: [{ id: "army-1", ownerId: "player-1", territoryId: "coast-1", warriorCount: 3, longboatId: "boat-1" }],
  };
}

const event = (id: string, adjustment: number): VoyageEventCard => ({
  id, name: id, description: "Test event", category: "favorable-conditions", surchargeAdjustment: adjustment,
});

describe("Voyage Provisions", () => {
  it("limits event adjustments to -5 through +5 and never creates a negative surcharge", () => {
    expect(calculateActualOceanSurcharge([3], [event("favorable", -5)])).toBe(0);
    expect(calculateActualOceanSurcharge([3], [event("rough", 5)])).toBe(8);
  });

  it("requires enough Provisions for the maximum possible surcharge before departure", () => {
    expect(calculateMaximumOceanSurcharge([2, 4])).toBe(16);
    expect(calculateMaximumVoyageProvisions(5, [2, 4])).toBe(21);
  });
});

describe("Voyage Event deck and choices", () => {
  it("draws cards and reshuffles the discard pile when needed", () => {
    const state = { ...fixture(), voyageEventDeck: [event("one", 0)], voyageEventDiscard: [event("two", 0)] };
    const result = drawVoyageEventCards(state, 2, () => 0);
    expect(result.drawnCards).toHaveLength(2);
    expect(result.state.voyageEventDeck).toHaveLength(0);
  });

  it("requires a valid player choice when an event offers choices", () => {
    const card: VoyageEventCard = {
      id: "fog", name: "Dense Fog", description: "Fog", category: "dangerous-weather",
      choices: [
        { id: "pay", label: "Pay extra", effect: { type: "surcharge-adjustment", amount: 2 } },
        { id: "divert", label: "Divert", effect: { type: "divert", destinationTerritoryId: "coast-2" } },
      ],
    };
    expect(() => resolveVoyageEventChoice(card)).toThrow();
    expect(resolveVoyageEventChoice(card, "pay")).toEqual({ type: "surcharge-adjustment", amount: 2 });
  });
});

describe("Maritime movement", () => {
  it("finds connected coastal paths but does not use open-ocean links", () => {
    const state = fixture();
    expect(findMaritimePath(state, "coast-1", "coast-2", "coastal")).toEqual(["coast-1", "coast-2"]);
    expect(findMaritimePath(state, "coast-1", "ocean-1", "coastal")).toBeNull();
  });

  it("moves along coastal routes and pays normal army Provisions", () => {
    const state = fixture();
    const next = moveLongboatAlongCoast(state, "player-1", "boat-1", "coast-2", 4);
    expect(next.longboats[0].territoryId).toBe("coast-2");
    expect(next.longboats[0].location).toBe("anchored");
    expect(next.armies[0].territoryId).toBe("coast-2");
    expect(next.regions[0].storage["player-1"].provisions).toBe(26);
  });

  it("checks the maximum surcharge reserve before committing to an ocean voyage", () => {
    const state = fixture();
    expect(canCommitOceanVoyage(state, "player-1", "boat-1", "ocean-1", 3, [2])).toBe(true);
    const poor = { ...state, regions: [{ ...state.regions[0], storage: { "player-1": { ...state.regions[0].storage["player-1"], provisions: 9 } } }] };
    expect(canCommitOceanVoyage(poor, "player-1", "boat-1", "ocean-1", 3, [2])).toBe(false);
  });

  it("resolves a voyage, applies event surcharge and moves the army and boat", () => {
    const state = fixture();
    const committed = beginOceanVoyage(state, "player-1", "boat-1", "ocean-1", 3, [2]);
    expect(committed?.regions[0].storage["player-1"].provisions).toBe(27);
    const result = committed && resolvePendingOceanVoyage(committed, [event("wind", -1)]);
    expect(result?.surchargePaid).toBe(1);
    expect(result?.finalTerritoryId).toBe("ocean-1");
    expect(result?.state.longboats[0].location).toBe("anchored");
    expect(result?.state.regions[0].storage["player-1"].provisions).toBe(26);
  });

  it("resolves a choice-based diversion to another coastline", () => {
    const state = fixture();
    const card: VoyageEventCard = {
      id: "fog", name: "Dense Fog", description: "Fog", category: "dangerous-weather",
      choices: [{ id: "divert", label: "Accept diversion", effect: { type: "divert", destinationTerritoryId: "coast-2" } }],
    };
    const committed = beginOceanVoyage(state, "player-1", "boat-1", "ocean-1", 3, [2]);
    const result = committed && resolvePendingOceanVoyage(committed, [card], ["divert"]);
    expect(result?.finalTerritoryId).toBe("coast-2");
    expect(result?.state.longboats[0].location).toBe("anchored");
  });

  it("applies resource rewards from Voyage Events", () => {
    const state = fixture();
    const card: VoyageEventCard = {
      id: "driftwood", name: "Valuable Driftwood", description: "Supplies", category: "discovery",
      effect: { type: "resource-gain", resource: "timber", amount: 2 },
    };
    const committed = beginOceanVoyage(state, "player-1", "boat-1", "ocean-1", 3, [2]);
    const result = committed && resolvePendingOceanVoyage(committed, [card]);
    expect(result?.state.regions[0].storage["player-1"].timber).toBe(2);
  });

  it("shipwreck destroys the longboat and eliminates the embarked army", () => {
    const state = fixture();
    const card: VoyageEventCard = { id: "wreck", name: "Shipwreck", description: "Lost", category: "tragedy", effect: { type: "shipwreck" } };
    const committed = beginOceanVoyage(state, "player-1", "boat-1", "ocean-1", 3, [2]);
    const result = committed && resolvePendingOceanVoyage(committed, [card]);
    expect(result?.destroyed).toBe(true);
    expect(result?.state.longboats).toHaveLength(0);
    expect(result?.state.armies).toHaveLength(0);
  });
});
