
import { describe, expect, it } from "vitest";
import {
  createEmptyResourceInventory,
  copyResourceInventory,
  addResource,
  hasResource,
} from "./resourceInventory";

describe("resource inventory", () => {
  it("creates an empty inventory", () => {
    const inventory = createEmptyResourceInventory();

    expect(inventory.timber).toBe(0);
    expect(inventory.iron).toBe(0);
    expect(inventory.provisions).toBe(0);
    expect(inventory.fish).toBe(0);
    expect(inventory.silver).toBe(0);
  });

  it("creates an independent copy", () => {
    const original = createEmptyResourceInventory();
    const copy = copyResourceInventory(original);

    copy.timber = 5;

    expect(original.timber).toBe(0);
    expect(copy.timber).toBe(5);
  });

  it("adds resources without changing the original", () => {
    const original = createEmptyResourceInventory();
    const updated = addResource(original, "timber", 3);

    expect(updated.timber).toBe(3);
    expect(original.timber).toBe(0);
  });

  it("checks whether sufficient resources are available", () => {
    const inventory = {
      ...createEmptyResourceInventory(),
      silver: 5,
    };

    expect(hasResource(inventory, "silver", 5)).toBe(true);
    expect(hasResource(inventory, "silver", 6)).toBe(false);
  });

  it("rejects negative resource amounts", () => {
    const inventory = createEmptyResourceInventory();

    expect(() => addResource(inventory, "iron", -1)).toThrow();
    expect(() => hasResource(inventory, "iron", -1)).toThrow();
  });
});
