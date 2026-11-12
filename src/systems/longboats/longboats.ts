import type {
  Army,
  GameState,
  LongboatId,
  PlayerId,
} from "../../engine/types";

export const LONGBOAT_CONSTRUCTION_COST = {
  timber: 3,
  iron: 1,
  provisions: 2,
  fish: 0,
  silver: 2,
} as const;

export const LONGBOAT_WARRIOR_CAPACITY = 5;

function getArmyAboard(state: GameState, longboatId: LongboatId): Army | undefined {
  return state.armies.find((army) => army.longboatId === longboatId);
}

function hasConstructionResources(
  state: GameState,
  playerId: PlayerId,
  territoryId: string,
): boolean {
  const territory = state.territories.find((item) => item.id === territoryId);
  if (!territory) return false;
  const region = state.regions.find((item) => item.id === territory.regionId);
  const inventory = region?.storage[playerId];
  return Boolean(
    inventory &&
    inventory.timber >= LONGBOAT_CONSTRUCTION_COST.timber &&
    inventory.iron >= LONGBOAT_CONSTRUCTION_COST.iron &&
    inventory.provisions >= LONGBOAT_CONSTRUCTION_COST.provisions &&
    inventory.silver >= LONGBOAT_CONSTRUCTION_COST.silver,
  );
}

export function canConstructLongboat(
  state: GameState,
  playerId: PlayerId,
  portId: string,
): boolean {
  const port = state.ports.find((item) => item.id === portId);
  if (!port || port.ownerId !== playerId) return false;
  if (state.longboats.some((boat) => boat.homePortId === portId || boat.portId === portId)) return false;
  return hasConstructionResources(state, playerId, port.territoryId);
}

export function constructLongboat(
  state: GameState,
  playerId: PlayerId,
  portId: string,
  longboatId: LongboatId,
): GameState {
  if (!canConstructLongboat(state, playerId, portId)) return state;
  if (state.longboats.some((boat) => boat.id === longboatId)) return state;

  const port = state.ports.find((item) => item.id === portId);
  if (!port) return state;
  const territory = state.territories.find((item) => item.id === port.territoryId);
  const region = territory && state.regions.find((item) => item.id === territory.regionId);
  const inventory = region?.storage[playerId];
  if (!region || !inventory) return state;

  return {
    ...state,
    regions: state.regions.map((item) => item.id !== region.id ? item : {
      ...item,
      storage: {
        ...item.storage,
        [playerId]: {
          ...inventory,
          timber: inventory.timber - LONGBOAT_CONSTRUCTION_COST.timber,
          iron: inventory.iron - LONGBOAT_CONSTRUCTION_COST.iron,
          provisions: inventory.provisions - LONGBOAT_CONSTRUCTION_COST.provisions,
          silver: inventory.silver - LONGBOAT_CONSTRUCTION_COST.silver,
        },
      },
    }),
    longboats: [...state.longboats, {
      id: longboatId,
      ownerId: playerId,
      territoryId: port.territoryId,
      location: "at-port",
      homePortId: port.id,
      portId: port.id,
    }],
  };
}

export function canLoadArmy(
  state: GameState,
  playerId: PlayerId,
  longboatId: LongboatId,
  armyId: string,
): boolean {
  const boat = state.longboats.find((item) => item.id === longboatId);
  const army = state.armies.find((item) => item.id === armyId);
  if (!boat || !army || boat.ownerId !== playerId || army.ownerId !== playerId) return false;
  if (boat.location === "at-sea" || boat.territoryId !== army.territoryId) return false;
  if (army.longboatId || getArmyAboard(state, longboatId)) return false;
  return army.warriorCount > 0 && army.warriorCount <= LONGBOAT_WARRIOR_CAPACITY;
}

export function loadArmyOntoLongboat(
  state: GameState,
  playerId: PlayerId,
  longboatId: LongboatId,
  armyId: string,
): GameState {
  if (!canLoadArmy(state, playerId, longboatId, armyId)) return state;
  return {
    ...state,
    armies: state.armies.map((army) => army.id === armyId ? { ...army, longboatId } : army),
  };
}

export function unloadArmyFromLongboat(
  state: GameState,
  playerId: PlayerId,
  longboatId: LongboatId,
): GameState {
  const boat = state.longboats.find((item) => item.id === longboatId);
  const army = getArmyAboard(state, longboatId);
  if (!boat || boat.ownerId !== playerId || !army || boat.location === "at-sea") return state;
  return {
    ...state,
    armies: state.armies.map((item) => item.id === army.id ? { ...item, longboatId: undefined, territoryId: boat.territoryId } : item),
  };
}

/** Captures a defenseless vessel by physically boarding it with an army. */
export function captureEmptyLongboatByBoarding(
  state: GameState,
  playerId: PlayerId,
  longboatId: LongboatId,
  armyId: string,
): GameState {
  const boat = state.longboats.find((item) => item.id === longboatId);
  const army = state.armies.find((item) => item.id === armyId);
  if (!boat || !army || boat.ownerId === playerId || army.ownerId !== playerId) return state;
  if (boat.location === "at-sea" || boat.territoryId !== army.territoryId) return state;
  if (getArmyAboard(state, longboatId) || army.longboatId) return state;
  if (army.warriorCount < 1 || army.warriorCount > LONGBOAT_WARRIOR_CAPACITY) return state;
  return {
    ...state,
    longboats: state.longboats.map((item) => item.id === longboatId ? { ...item, ownerId: playerId } : item),
    armies: state.armies.map((item) => item.id === armyId ? { ...item, longboatId } : item),
  };
}

/** Applies the result of a successful attack on an anchored crewed longboat. */
export function captureLongboatAfterVictory(
  state: GameState,
  newOwnerId: PlayerId,
  longboatId: LongboatId,
  attackerWon: boolean,
): GameState {
  const boat = state.longboats.find((item) => item.id === longboatId);
  if (!boat || !attackerWon || boat.ownerId === newOwnerId || boat.location === "at-sea") return state;
  return {
    ...state,
    longboats: state.longboats.map((item) => item.id === longboatId ? { ...item, ownerId: newOwnerId } : item),
    // A defeated crew cannot retreat into open ocean and is eliminated.
    armies: state.armies.filter((army) => army.longboatId !== longboatId),
  };
}

/** A successful hostile occupation of a port captures a boat docked there. */
export function captureDockedLongboatByPortOccupation(
  state: GameState,
  occupyingPlayerId: PlayerId,
  portId: string,
): GameState {
  const port = state.ports.find((item) => item.id === portId);
  if (!port) return state;
  const hasOccupyingWarrior = state.armies.some((army) =>
    army.ownerId === occupyingPlayerId && army.territoryId === port.territoryId && army.warriorCount > 0,
  );
  if (!hasOccupyingWarrior) return state;
  return {
    ...state,
    longboats: state.longboats.map((boat) =>
      boat.portId === portId && boat.location === "at-port" && boat.ownerId !== occupyingPlayerId
        ? { ...boat, ownerId: occupyingPlayerId }
        : boat,
    ),
  };
}

export function destroyLongboat(state: GameState, longboatId: LongboatId): GameState {
  if (!state.longboats.some((boat) => boat.id === longboatId)) return state;
  return {
    ...state,
    longboats: state.longboats.filter((boat) => boat.id !== longboatId),
    // Shipwreck event: all warriors aboard are lost with the vessel.
    armies: state.armies.filter((army) => army.longboatId !== longboatId),
  };
}

/** Eliminated clans' vessels become neutral assets rather than disappearing. */
export function neutralizePlayerLongboats(state: GameState, eliminatedPlayerId: PlayerId): GameState {
  return {
    ...state,
    longboats: state.longboats.map((boat) => boat.ownerId === eliminatedPlayerId ? { ...boat, ownerId: undefined } : boat),
  };
}

export function validateLongboatsAtTurnEnd(state: GameState): boolean {
  return state.longboats.every((boat) => {
    if (boat.location === "at-sea") return false;
    if (boat.location === "anchored") {
      return state.territories.some((territory) =>
        territory.id === boat.territoryId && territory.terrain === "coastal",
      );
    }
    if (boat.location === "at-port") {
      return Boolean(state.ports.some((port) =>
        port.id === boat.portId && port.territoryId === boat.territoryId,
      ));
    }
    return false;
  });
}
