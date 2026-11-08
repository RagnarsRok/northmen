
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
  return state.armies.some(
    (army) =>
      army.ownerId === playerId &&
      army.territoryId === territoryId &&
      army.warriorCount >= 1
  );
}
