
import type {
  GameState,
  PlayerId,
  SettlementLevel,
} from "../../engine/types";

// Provisional recruitment capacities.
// These values can be adjusted during balancing.
export const RECRUITMENT_CAPACITY: Record<SettlementLevel, number> = {
  outpost: 1,
  village: 1,
  "trading-post": 2,
  town: 3,
};

// Provisional cost per recruited warrior.
export const RECRUITMENT_COST = {
  provisions: 1,
  silver: 1,
};

/**
 * Returns the recruitment capacity of a settlement.
 */
export function getRecruitmentCapacity(
  level: SettlementLevel
): number {
  return RECRUITMENT_CAPACITY[level];
}

/**
 * Returns how many recruitment spaces remain
 * at a settlement during the current turn.
 */
export function getRemainingRecruitmentCapacity(
  state: GameState,
  settlementId: string
): number {
  const settlement = state.settlements.find(
    (item) => item.id === settlementId
  );

  if (!settlement) {
    return 0;
  }

  const capacity = getRecruitmentCapacity(settlement.level);
  const used = state.recruitmentUsed[settlementId] ?? 0;

  return Math.max(0, capacity - used);
  
}

/**
 * Recruits warriors at an owned settlement.
 *
 * Warriors join an existing friendly army in the territory.
 * If no friendly army exists, a new army is created.
 *
 * The supplied newArmyId is used only when a new army
 * needs to be created.
 */
export function recruitWarriors(
  state: GameState,
  playerId: PlayerId,
  settlementId: string,
  warriorCount: number,
  newArmyId: string
): GameState {
  const settlement = state.settlements.find(
    (item) => item.id === settlementId
  );

  if (
    !settlement ||
    settlement.ownerId !== playerId ||
    !Number.isInteger(warriorCount) ||
    warriorCount <= 0
  ) {
    return state;
  }

  const remainingCapacity =
    getRemainingRecruitmentCapacity(state, settlementId);

  if (warriorCount > remainingCapacity) {
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

  const inventory = region.storage[playerId];

  if (!inventory) {
    return state;
  }

  const totalProvisions =
    RECRUITMENT_COST.provisions * warriorCount;
  const totalSilver =
    RECRUITMENT_COST.silver * warriorCount;

  if (
    inventory.provisions < totalProvisions ||
    inventory.silver < totalSilver
  ) {
    return state;
  }

  const existingArmy = state.armies.find(
    (army) =>
      army.ownerId === playerId &&
      army.territoryId === settlement.territoryId
  );

  const updatedArmies = existingArmy
    ? state.armies.map((army) =>
        army.id === existingArmy.id
          ? {
              ...army,
              warriorCount: army.warriorCount + warriorCount,
            }
          : army
      )
    : [
        ...state.armies,
        {
          id: newArmyId,
          ownerId: playerId,
          territoryId: settlement.territoryId,
          warriorCount,
        },
      ];

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
                provisions:
                  inventory.provisions - totalProvisions,
                silver: inventory.silver - totalSilver,
              },
            },
          }
        : item
    ),
    armies: updatedArmies,
    recruitmentUsed: {
      ...state.recruitmentUsed,
      [settlementId]:
        (state.recruitmentUsed[settlementId] ?? 0) +
        warriorCount,
    },
  };
}
