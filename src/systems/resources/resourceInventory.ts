
import type {
  ResourceInventory,
  ResourceType,
} from "../../engine/types";

// Creates a completely independent, empty resource inventory.
export function createEmptyResourceInventory(): ResourceInventory {
  return {
    timber: 0,
    iron: 0,
    provisions: 0,
    fish: 0,
    silver: 0,
  };
}

// Creates an independent copy of an existing inventory.
export function copyResourceInventory(
  inventory: ResourceInventory
): ResourceInventory {
  return { ...inventory };
}

// Adds a quantity of one resource to an inventory.
export function addResource(
  inventory: ResourceInventory,
  resource: ResourceType,
  amount: number
): ResourceInventory {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error("Resource amount must be a non-negative integer.");
  }

  return {
    ...inventory,
    [resource]: inventory[resource] + amount,
  };
}

// Checks whether an inventory contains enough of a resource.
export function hasResource(
  inventory: ResourceInventory,
  resource: ResourceType,
  amount: number
): boolean {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error("Resource amount must be a non-negative integer.");
  }

  return inventory[resource] >= amount;
}
