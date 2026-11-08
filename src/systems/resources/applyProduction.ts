
import type { GameState } from "../../engine/types";
import {
  addResource,
  createEmptyResourceInventory,
} from "./resourceInventory";
import type { ProductionResult } from "./production";

/**
 * Applies production results to the relevant regional storage pools.
 *
 * Resources are stored separately for each player in each region.
 * The original game state is never modified.
 */
export function applyProduction(
  state: GameState,
  productionResults: ProductionResult[]
): GameState {
  const updatedRegions = state.regions.map((region) => ({
    ...region,
    storage: { ...region.storage },
  }));

  for (const result of productionResults) {
    const region = updatedRegions.find(
      (item) => item.id === result.regionId
    );

    if (!region) {
      throw new Error(
        `Region ${result.regionId} does not exist.`
      );
    }

    const currentInventory =
      region.storage[result.playerId] ??
      createEmptyResourceInventory();

    region.storage[result.playerId] = addResource(
      currentInventory,
      result.resource,
      result.amount
    );
  }

  return {
    ...state,
    regions: updatedRegions,
  };
}
