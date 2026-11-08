
import type {
  GameState,
  PlayerId,
  SettlementLevel,
} from "../../engine/types";

/**
 * The development order of settlements in NORTHMEN.
 */
export const SETTLEMENT_LEVELS: readonly SettlementLevel[] = [
  "outpost",
  "village",
  "trading-post",
  "town",
];

/**
 * Returns the next development level.
 *
 * Returns null if the settlement is already a Town.
 */
export function getNextSettlementLevel(
  currentLevel: SettlementLevel
): SettlementLevel | null {
  const currentIndex = SETTLEMENT_LEVELS.indexOf(currentLevel);

  if (currentIndex === -1 || currentIndex === SETTLEMENT_LEVELS.length - 1) {
    return null;
  }

  return SETTLEMENT_LEVELS[currentIndex + 1];
}

/**
 * Checks whether a settlement can be upgraded further.
 */
export function canUpgradeSettlement(
  currentLevel: SettlementLevel
): boolean {
  return getNextSettlementLevel(currentLevel) !== null;
}

/**
 * Resource costs for constructing or upgrading a settlement.
 */
export interface SettlementCost {
  timber: number;
  iron: number;
  provisions: number;
  silver: number;
}

/**
 * Calculates the total development level across all settlements.
 * This will be used to determine increasing construction costs.
 */
export function calculateTotalSettlementDevelopment(
  levels: SettlementLevel[]
): number {
  const developmentValues: Record<SettlementLevel, number> = {
    outpost: 1,
    village: 2,
    "trading-post": 3,
    town: 4,
  };

  return levels.reduce(
    (total, level) => total + developmentValues[level],
    0
  );
}

/**
 * Checks whether a player has at least one warrior
 * stationed in a territory, as required to construct an Outpost.
 */
export function canConstructOutpost(
  state: GameState,
  playerId: PlayerId,
  territoryId: string
): boolean {
  const territory = state.territories.find(
    (item) => item.id === territoryId
  );

  if (!territory || territory.ownerId !== playerId) {
    return false;
  }

  if (
    state.settlements.some(
      (settlement) => settlement.territoryId === territoryId
    )
  ) {
    return false;
  }

  return state.armies.some(
    (army) =>
      army.ownerId === playerId &&
      army.territoryId === territoryId &&
      army.warriorCount >= 1
  );
}

/**
 * Calculates the resource costs for upgrading a settlement.
 *
 * Costs are based on:
 * - The next settlement development level.
 * - The player's total settlement development.
 *
 * Silver is required from Trading Post upgrades onwards.
 */
export function calculateSettlementUpgradeCost(
  currentLevel: SettlementLevel,
  totalDevelopment: number
): SettlementCost | null {
  const nextLevel = getNextSettlementLevel(currentLevel);

  if (nextLevel === null) {
    return null;
  }

  const developmentMultiplier = Math.max(1, totalDevelopment);

  const baseCosts: Record<SettlementLevel, SettlementCost> = {
    outpost: {
      timber: 2,
      iron: 0,
      provisions: 1,
      silver: 0,
    },
    village: {
      timber: 3,
      iron: 1,
      provisions: 2,
      silver: 0,
    },
    "trading-post": {
      timber: 4,
      iron: 2,
      provisions: 2,
      silver: 2,
    },
    town: {
      timber: 5,
      iron: 3,
      provisions: 3,
      silver: 4,
    },
  };

  const baseCost = baseCosts[nextLevel];

  return {
    timber: baseCost.timber * developmentMultiplier,
    iron: baseCost.iron * developmentMultiplier,
    provisions: baseCost.provisions * developmentMultiplier,
    silver: baseCost.silver * developmentMultiplier,
  };
}

/**
 * Constructs a new Outpost.
 *
 * Requires:
 * - At least one stationed warrior.
 * - Sufficient regional resources.
 * - No existing settlement in the territory.
 *
 * Returns a new GameState without modifying the original.
 */
export function constructOutpost(
  state: GameState,
  playerId: PlayerId,
  territoryId: string,
  settlementId: string
): GameState {
  const territory = state.territories.find(
    (item) => item.id === territoryId
  );

  if (!territory || territory.ownerId !== playerId) {
    return state;
  }

  if (state.settlements.some(
    (settlement) => settlement.territoryId === territoryId
  )) {
    return state;
  }

  if (!canConstructOutpost(state, playerId, territoryId)) {
    return state;
  }

  const region = state.regions.find(
    (item) => item.id === territory.regionId
  );

  if (!region) {
    return state;
  }

  const cost = calculateSettlementUpgradeCost(
    "outpost",
    calculateTotalSettlementDevelopment(
      state.settlements
        .filter((settlement) => settlement.ownerId === playerId)
        .map((settlement) => settlement.level)
    )
  );

if (!cost) {
  return state;
}

  const inventory = region.storage[playerId];

  if (
    !inventory ||
    inventory.timber < cost.timber ||
    inventory.iron < cost.iron ||
    inventory.provisions < cost.provisions ||
    inventory.silver < cost.silver
  ) {
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
                timber: inventory.timber - cost.timber,
                iron: inventory.iron - cost.iron,
                provisions: inventory.provisions - cost.provisions,
                fish: inventory.fish,
                silver: inventory.silver - cost.silver,
              },
            },
          }
        : item
    ),
    settlements: [
      ...state.settlements,
      {
        id: settlementId,
        ownerId: playerId,
        territoryId,
        level: "outpost",
        isMainSettlement: false,
      },
    ],
  };
}


/**
 * Upgrades an existing settlement by one development level.
 *
 * Requires:
 * - The settlement belongs to the player.
 * - The settlement is below Town level.
 * - Sufficient regional resources.
 *
 * Returns a new GameState without modifying the original.
 */
export function upgradeSettlement(
  state: GameState,
  playerId: PlayerId,
  settlementId: string
): GameState {
  const settlement = state.settlements.find(
    (item) => item.id === settlementId
  );

  if (!settlement || settlement.ownerId !== playerId) {
    return state;
  }

  const nextLevel = getNextSettlementLevel(settlement.level);

  if (nextLevel === null) {
    return state;
  }

  const territory = state.territories.find(
    (item) => item.id === settlement.territoryId
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

  const totalDevelopment = calculateTotalSettlementDevelopment(
    state.settlements
      .filter((item) => item.ownerId === playerId)
      .map((item) => item.level)
  );

  const cost = calculateSettlementUpgradeCost(
    settlement.level,
    totalDevelopment
  );

  if (cost === null) {
    return state;
  }

  const inventory = region.storage[playerId];

  if (
    !inventory ||
    inventory.timber < cost.timber ||
    inventory.iron < cost.iron ||
    inventory.provisions < cost.provisions ||
    inventory.silver < cost.silver
  ) {
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
                timber: inventory.timber - cost.timber,
                iron: inventory.iron - cost.iron,
                provisions: inventory.provisions - cost.provisions,
                silver: inventory.silver - cost.silver,
              },
            },
          }
        : item
    ),
    settlements: state.settlements.map((item) =>
      item.id === settlementId
        ? {
            ...item,
            level: nextLevel,
          }
        : item
    ),
  };
}

