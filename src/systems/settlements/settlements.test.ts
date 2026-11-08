
import { describe, expect, it } from "vitest";

import {
  SETTLEMENT_LEVELS,
  getNextSettlementLevel,
  canUpgradeSettlement,
  calculateTotalSettlementDevelopment,
  calculateSettlementUpgradeCost,
} from "./settlements";

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
  });
