
import { describe, expect, it } from "vitest";

import {
  SETTLEMENT_LEVELS,
  getNextSettlementLevel,
  canUpgradeSettlement,
  calculateTotalSettlementDevelopment,
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
});
