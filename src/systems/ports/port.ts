
import type {
  GameState,
  PlayerId,
  PortId,
} from "../../engine/types";

/**
 * Approved construction cost for a port.
 * 2 Timber, 1 Iron, 1 Provision.
 */
export const PORT_CONSTRUCTION_COST = {
  timber: 2,
  iron: 1,
  provisions: 1,
  fish: 0,
  silver: 0,
} as const;

/**
 * Checks whether a player can construct a port
 * in the specified territory.
 *
 * Requirements:
 * - Territory exists.
 * - Territory is coastal.
 * - Player controls the territory.
 * - No port already exists there.
 * - Player has at least one stationed warrior.
 * - The region and required resources exist.
 */
export function canConstructPort(
  state: GameState,
  playerId: PlayerId,
  territoryId: string
): boolean {
  const territory = state.territories.find(
    (item) => item.id === territoryId
  );

  if (
    !territory ||
    territory.terrain !== "coastal" ||
    territory.ownerId !== playerId
  ) {
    return false;
  }

  if (
    state.ports.some(
      (port) => port.territoryId === territoryId
    )
  ) {
    return false;
  }

  const hasWarrior = state.armies.some(
    (army) =>
      army.ownerId === playerId &&
      army.territoryId === territoryId &&
      army.warriorCount >= 1
  );

  if (!hasWarrior) {
    return false;
  }

  const region = state.regions.find(
    (item) => item.id === territory.regionId
  );

  if (!region) {
    return false;
  }

  const inventory = region.storage[playerId];

  if (
    !inventory ||
    inventory.timber < PORT_CONSTRUCTION_COST.timber ||
    inventory.iron < PORT_CONSTRUCTION_COST.iron ||
    inventory.provisions < PORT_CONSTRUCTION_COST.provisions
  ) {
    return false;
  }

  return true;
}

/**
 * Constructs a port in a valid coastal territory.
 *
 * Returns the original state if construction is invalid.
 * Otherwise, deducts resources and adds the new port.
 */
export function constructPort(
  state: GameState,
  playerId: PlayerId,
  territoryId: string,
  portId: PortId
): GameState {
  if (!canConstructPort(state, playerId, territoryId)) {
    return state;
  }

  if (state.ports.some((port) => port.id === portId)) {
    return state;
  }

  const territory = state.territories.find(
    (item) => item.id === territoryId
  );

  if (!territory) {
    return state;
  }

  const region = state.regions.find(
    (item) => item.id === territory.regionId
  );

  if (!region) {
    return state;
  }

  const inventory = region.storage[playerId];

  if (!inventory) {
    return state;
  }

  return {
    ...state,
    regions: state.regions.map((item) =>
      item.id === region.id
        ? {
            ...item,
            storage: {
              ...item.storage,
              [playerId]: {
                ...inventory,
                timber:
                  inventory.timber -
                  PORT_CONSTRUCTION_COST.timber,
                iron:
                  inventory.iron -
                  PORT_CONSTRUCTION_COST.iron,
                provisions:
                  inventory.provisions -
                  PORT_CONSTRUCTION_COST.provisions,
              },
            },
          }
        : item
    ),
    ports: [
      ...state.ports,
      {
        id: portId,
        ownerId: playerId,
        territoryId,
      },
    ],
  };
}

/**
 * Transfers ownership of a port after successful combat.
 *
 * This function does not resolve combat.
 * It only changes port ownership.
 * Territory and settlement ownership remain unchanged.
 */
export function capturePort(
  state: GameState,
  newOwnerId: PlayerId,
  portId: PortId
): GameState {
  const port = state.ports.find(
    (item) => item.id === portId
  );

  if (!port || port.ownerId === newOwnerId) {
    return state;
  }

  return {
    ...state,
    ports: state.ports.map((item) =>
      item.id === portId
        ? { ...item, ownerId: newOwnerId }
        : item
    ),
  };
}
