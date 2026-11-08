
import type { GameState, ResourceType } from "../../engine/types";

export interface ProductionResult {
  playerId: string;
  regionId: string;
  resource: ResourceType;
  amount: number;
  source: "primary" | "secondary" | "port";
}

/**
 * Calculates automatic primary production.
 * Each owned territory produces one unit of its primary resource.
 * Silver is excluded from territorial production.
 */
export function calculatePrimaryProduction(
  state: GameState
): ProductionResult[] {
  const results: ProductionResult[] = [];

  for (const territory of state.territories) {
    if (!territory.ownerId) continue;
    if (territory.primaryResource === "silver") continue;

    results.push({
      playerId: territory.ownerId,
      regionId: territory.regionId,
      resource: territory.primaryResource,
      amount: 1,
      source: "primary",
    });
  }

  return results;
}

/**
 * Calculates secondary production for a gathering action.
 * Each eligible owned territory produces one unit.
 */
export function calculateSecondaryProduction(
  state: GameState,
  playerId: string,
  territoryIds: string[]
): ProductionResult[] {
  const results: ProductionResult[] = [];

  for (const territoryId of territoryIds) {
    const territory = state.territories.find(
      (item) => item.id === territoryId
    );

    if (!territory || territory.ownerId !== playerId) continue;
    if (territory.secondaryResource === "silver") continue;

    results.push({
      playerId,
      regionId: territory.regionId,
      resource: territory.secondaryResource,
      amount: 1,
      source: "secondary",
    });
  }

  return results;
}

/**
 * Calculates automatic Fish production from owned ports.
 * Each owned port produces one Fish per round.
 */
export function calculatePortProduction(
  state: GameState
): ProductionResult[] {
  return state.ports
    .map((port): ProductionResult => {
      const territory = state.territories.find(
        (item) => item.id === port.territoryId
      );

      return {
        playerId: port.ownerId,
        regionId: territory?.regionId ?? "",
        resource: "fish",
        amount: 1,
        source: "port",
      };
    })
    .filter((result) => result.regionId !== "");
}

/**
 * Applies production results to regional storage.
 *
 * Returns a new GameState without modifying the original.
 */
export function applyProductionResults(
  state: GameState,
  results: ProductionResult[]
): GameState {
  return {
    ...state,
    regions: state.regions.map((region) => {
      const regionResults = results.filter(
        (result) => result.regionId === region.id
      );

      if (regionResults.length === 0) {
        return region;
      }

      const updatedStorage = { ...region.storage };

      for (const result of regionResults) {
        const playerInventory = {
          ...updatedStorage[result.playerId],
        };

        playerInventory[result.resource] =
          (playerInventory[result.resource] ?? 0) + result.amount;

        updatedStorage[result.playerId] = playerInventory;
      }

      return {
        ...region,
        storage: updatedStorage,
      };
    }),
  };
}
