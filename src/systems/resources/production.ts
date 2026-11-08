
import type {
  GameState,
  ResourceType,
} from "../../engine/types";

export interface ProductionResult {
  playerId: string;
  regionId: string;
  resource: ResourceType;
  amount: number;
  source: "primary" | "secondary" | "port";
}

/**
 * Calculates automatic primary resource production.
 *
 * Each territory produces one unit of its primary resource.
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
 *
 * Each eligible territory produces one unit of its
 * secondary resource when its owner gathers there.
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
return state.ports.map((port) => ({
  playerId: port.ownerId,
  regionId: state.territories.find(
    (territory) => territory.id === port.territoryId
  )?.regionId ?? "",
  resource: "fish" as const,
  amount: 1,
  source: "port" as const,
}));
}
