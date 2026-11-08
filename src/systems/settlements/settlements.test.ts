
import { describe, expect, it } from "vitest";

import {
  SETTLEMENT_LEVELS,
  getNextSettlementLevel,
  canUpgradeSettlement,
  calculateTotalSettlementDevelopment,
  calculateSettlementUpgradeCost,
  canConstructOutpost,
  constructOutpost,
} from "./settlements";

import { createEmptyGameState } from "../../engine/initialState";
function createConstructionTestState() {
  const state = createEmptyGameState([
    "Ragnar",
    "Player 2",
    "Player 3",
  ]);

  const inventory = {
    timber: 5,
    iron: 2,
    provisions: 5,
    fish: 0,
    silver: 2,
  };

  state.regions = [
    {
      id: "region-1",
      name: "Test Region",
      territoryIds: ["territory-1"],
      storage: {
        "player-1": { ...inventory },
        "player-2": { ...inventory },
        "player-3": { ...inventory },
      },
    },
  ];

  state.territories = [
    {
      id: "territory-1",
      name: "Test Territory",
      regionId: "region-1",
      terrain: "forest",
      primaryResource: "timber",
      secondaryResource: "iron",
      connections: [],
      ownerId: "player-1",
    },
  ];

  state.armies = [
    {
      id: "army-1",
      ownerId: "player-1",
      territoryId: "territory-1",
      warriorCount: 2,
    },
  ];

  return state;
}

describe("settlement development", () => {
  it("defines the four settlement levels in the correct order", () => {
    expect(SETTLEMENT_LEVELS).toEqual([
      "outpost",
      "village",
      "trading-post",
      "town",
    ]);
  });

  it("upgrades an Outpost to a Village", () => {
    expect(getNextSettlementLevel("outpost")).toBe("village");
  });

  it("upgrades a Village to a Trading Post", () => {
    expect(getNextSettlementLevel("village")).toBe("trading-post");
  });

  it("upgrades a Trading Post to a Town", () => {
    expect(getNextSettlementLevel("trading-post")).toBe("town");
  });

  it("does not allow upgrading a Town further", () => {
    expect(getNextSettlementLevel("town")).toBeNull();
  });

  it("allows upgrades below Town level", () => {
    expect(canUpgradeSettlement("outpost")).toBe(true);
    expect(canUpgradeSettlement("village")).toBe(true);
    expect(canUpgradeSettlement("trading-post")).toBe(true);
  });

  it("does not allow upgrading a Town", () => {
    expect(canUpgradeSettlement("town")).toBe(false);
  });
it("calculates total settlement development", () => {
  expect(
    calculateTotalSettlementDevelopment(["outpost"])
  ).toBe(1);

  expect(
    calculateTotalSettlementDevelopment(["village", "town"])
  ).toBe(6);

  expect(
    calculateTotalSettlementDevelopment([
      "outpost",
      "village",
      "trading-post",
      "town",
    ])
  ).toBe(10);
});

describe("settlement upgrade costs", () => {
  it("calculates the cost of upgrading an Outpost", () => {
    expect(calculateSettlementUpgradeCost("outpost", 1)).toEqual({
      timber: 3,
      iron: 1,
      provisions: 2,
      silver: 0,
    });
  });

  it("requires Silver when upgrading to a Trading Post", () => {
    expect(calculateSettlementUpgradeCost("village", 2)).toEqual({
      timber: 8,
      iron: 4,
      provisions: 4,
      silver: 4,
    });
  });

  it("increases costs with total settlement development", () => {
    expect(calculateSettlementUpgradeCost("outpost", 4)).toEqual({
      timber: 12,
      iron: 4,
      provisions: 8,
      silver: 0,
    });
  });

  it("does not allow upgrading a Town", () => {
    expect(calculateSettlementUpgradeCost("town", 4)).toBeNull();
  });
});

  });describe("Outpost construction", () => {
  it("allows construction when all requirements are met", () => {
    const state = createConstructionTestState();

    expect(
      canConstructOutpost(state, "player-1", "territory-1")
    ).toBe(true);
  });

  it("constructs an Outpost and deducts resources", () => {
    const state = createConstructionTestState();

    const updatedState = constructOutpost(
      state,
      "player-1",
      "territory-1",
      "settlement-1"
    );

    expect(updatedState.settlements).toHaveLength(1);
    expect(updatedState.settlements[0]).toEqual({
      id: "settlement-1",
      ownerId: "player-1",
      territoryId: "territory-1",
      level: "outpost",
      isMainSettlement: false,
    });

    const inventory =
      updatedState.regions[0].storage["player-1"];

    expect(inventory.timber).toBe(2);
    expect(inventory.provisions).toBe(3);
  });

  it("does not allow construction without a stationed warrior", () => {
    const state = createConstructionTestState();
    state.armies = [];

    expect(
      canConstructOutpost(state, "player-1", "territory-1")
    ).toBe(false);
  });

  it("does not construct an Outpost when resources are insufficient", () => {
    const state = createConstructionTestState();
    state.regions[0].storage["player-1"].timber = 0;

    const updatedState = constructOutpost(
      state,
      "player-1",
      "territory-1",
      "settlement-1"
    );

    expect(updatedState.settlements).toHaveLength(0);
  });

  it("does not allow two settlements in the same territory", () => {
    const state = createConstructionTestState();

    state.settlements = [
      {
        id: "existing-settlement",
        ownerId: "player-1",
        territoryId: "territory-1",
        level: "outpost",
        isMainSettlement: false,
      },
    ];

    expect(
      canConstructOutpost(state, "player-1", "territory-1")
    ).toBe(false);
  });
});
