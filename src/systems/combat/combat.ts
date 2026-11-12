import type { SettlementLevel } from "../../engine/types";

export const MAX_ATTACKER_WARRIOR_DICE = 3;
export const MAX_DEFENDER_WARRIOR_DICE = 2;

export type CombatSide = "attacker" | "defender";

export interface CombatRoundInput {
  attackerWarriors: number;
  defenderWarriors: number;
  attackerRolls: number[];
  defenderRolls: number[];
  /** Settlement die is rolled separately from defending warrior dice. */
  settlementLevel?: SettlementLevel;
  settlementRoll?: number;
}

export interface DiceComparison {
  attackerRoll: number;
  defenderRoll: number;
  winner: CombatSide;
}

export interface CombatRoundResult {
  attackerCasualties: number;
  defenderCasualties: number;
  warriorComparisons: DiceComparison[];
  settlementComparison?: DiceComparison;
  /** True only when no defending warriors remain and the attacker beats the settlement. */
  settlementDefeated: boolean;
  /** True when the attacker has warriors remaining and all defenders, including settlement, are defeated. */
  attackerWins: boolean;
  /** True when all attacking warriors are eliminated. */
  attackerEliminated: boolean;
  /** True when both warrior forces are eliminated. */
  bothArmiesEliminated: boolean;
}

const SETTLEMENT_DEFENCE: Record<SettlementLevel, number> = {
  outpost: 1,
  village: 1,
  "trading-post": 2,
  town: 3,
};

function validateRolls(rolls: number[], expected: number, label: string): void {
  if (rolls.length !== expected) {
    throw new Error(`${label} must contain exactly ${expected} dice results.`);
  }
  if (rolls.some((roll) => !Number.isInteger(roll) || roll < 1 || roll > 6)) {
    throw new Error(`${label} must contain D6 results from 1 to 6.`);
  }
}

function compare(attackerRoll: number, defenderRoll: number): DiceComparison {
  return {
    attackerRoll,
    defenderRoll,
    // Defender wins ties.
    winner: attackerRoll > defenderRoll ? "attacker" : "defender",
  };
}

/**
 * Resolves one simultaneous combat round from supplied D6 results.
 * Randomness is deliberately injected by the caller so the engine remains
 * deterministic, replayable and straightforward to test.
 */
export function resolveCombatRound(input: CombatRoundInput): CombatRoundResult {
  if (!Number.isInteger(input.attackerWarriors) || input.attackerWarriors < 1) {
    throw new Error("An attacking force must have at least one warrior.");
  }
  if (!Number.isInteger(input.defenderWarriors) || input.defenderWarriors < 0) {
    throw new Error("Defending warrior count cannot be negative.");
  }

  const attackerDice = Math.min(input.attackerWarriors, MAX_ATTACKER_WARRIOR_DICE);
  const defenderDice = Math.min(input.defenderWarriors, MAX_DEFENDER_WARRIOR_DICE);
  validateRolls(input.attackerRolls, attackerDice, "Attacker rolls");
  validateRolls(input.defenderRolls, defenderDice, "Defender rolls");

  const attackers = [...input.attackerRolls].sort((a, b) => b - a);
  const defenders = [...input.defenderRolls].sort((a, b) => b - a);
  const warriorComparisons: DiceComparison[] = [];
  const pairedDice = Math.min(attackers.length, defenders.length);
  let attackerCasualties = 0;
  let defenderCasualties = 0;

  for (let i = 0; i < pairedDice; i += 1) {
    const result = compare(attackers[i], defenders[i]);
    warriorComparisons.push(result);
    if (result.winner === "attacker") defenderCasualties += 1;
    else attackerCasualties += 1;
  }

  let settlementComparison: DiceComparison | undefined;
  let settlementDefeated = false;
  if (input.settlementLevel) {
    if (input.settlementRoll === undefined) {
      throw new Error("A settlement defensive roll is required when a settlement is present.");
    }
    validateRolls([input.settlementRoll], 1, "Settlement roll");
    // The settlement is an additional defender. It compares against the
    // highest attacker die and can cause at most one extra casualty.
    const highestAttackerRoll = attackers[0];
    const modifiedSettlementRoll = input.settlementRoll + SETTLEMENT_DEFENCE[input.settlementLevel];
    settlementComparison = compare(highestAttackerRoll, modifiedSettlementRoll);

    // Settlement can inflict one casualty while its army is defending.
    if (settlementComparison.winner === "defender") {
      attackerCasualties += 1;
    } else if (input.defenderWarriors === 0) {
      // Once the defending warriors are gone, the settlement is the final
      // defensive element and falls when the attacker wins this comparison.
      settlementDefeated = true;
    }
  }

  attackerCasualties = Math.min(input.attackerWarriors, attackerCasualties);
  defenderCasualties = Math.min(input.defenderWarriors, defenderCasualties);
  const attackerRemaining = input.attackerWarriors - attackerCasualties;
  const defenderRemaining = input.defenderWarriors - defenderCasualties;
  const attackerEliminated = attackerRemaining === 0;
  const bothArmiesEliminated = attackerEliminated && defenderRemaining === 0;
  const hasSettlement = Boolean(input.settlementLevel);
  const attackerWins = !attackerEliminated && defenderRemaining === 0 && (!hasSettlement || settlementDefeated);

  return {
    attackerCasualties,
    defenderCasualties,
    warriorComparisons,
    settlementComparison,
    settlementDefeated,
    attackerWins,
    attackerEliminated,
    bothArmiesEliminated,
  };
}
