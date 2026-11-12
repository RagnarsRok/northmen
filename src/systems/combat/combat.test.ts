import { describe, expect, it } from "vitest";
import { resolveCombatRound } from "./combat";

describe("combat round resolution", () => {
  it("sorts dice and compares highest against highest", () => {
    const result = resolveCombatRound({
      attackerWarriors: 3,
      defenderWarriors: 2,
      attackerRolls: [2, 6, 4],
      defenderRolls: [3, 5],
    });
    expect(result.warriorComparisons.map((x) => [x.attackerRoll, x.defenderRoll])).toEqual([[6, 5], [4, 3]]);
    expect(result.defenderCasualties).toBe(2);
    expect(result.attackerCasualties).toBe(0);
  });

  it("awards ties to the defender", () => {
    const result = resolveCombatRound({
      attackerWarriors: 1,
      defenderWarriors: 1,
      attackerRolls: [4],
      defenderRolls: [4],
    });
    expect(result.attackerCasualties).toBe(1);
    expect(result.defenderCasualties).toBe(0);
  });

  it("applies settlement defence as a separate comparison and at most one casualty", () => {
    const result = resolveCombatRound({
      attackerWarriors: 3,
      defenderWarriors: 2,
      attackerRolls: [6, 5, 4],
      defenderRolls: [2, 1],
      settlementLevel: "town",
      settlementRoll: 4,
    });
    expect(result.defenderCasualties).toBe(2);
    expect(result.settlementComparison?.winner).toBe("defender");
    expect(result.attackerCasualties).toBe(1);
  });

  it("does not allow settlement capture until defending warriors are eliminated", () => {
    const result = resolveCombatRound({
      attackerWarriors: 2,
      defenderWarriors: 1,
      attackerRolls: [6, 5],
      defenderRolls: [1],
      settlementLevel: "outpost",
      settlementRoll: 1,
    });
    expect(result.defenderCasualties).toBe(1);
    expect(result.settlementDefeated).toBe(false);
    expect(result.attackerWins).toBe(false);
  });

  it("allows one surviving attacker to overcome a settlement after its army is gone", () => {
    const result = resolveCombatRound({
      attackerWarriors: 1,
      defenderWarriors: 0,
      attackerRolls: [6],
      defenderRolls: [],
      settlementLevel: "town",
      settlementRoll: 1,
    });
    expect(result.settlementDefeated).toBe(true);
    expect(result.attackerWins).toBe(true);
  });

  it("can eliminate the final attacker before settlement capture", () => {
    const result = resolveCombatRound({
      attackerWarriors: 1,
      defenderWarriors: 0,
      attackerRolls: [1],
      defenderRolls: [],
      settlementLevel: "town",
      settlementRoll: 6,
    });
    expect(result.attackerEliminated).toBe(true);
    expect(result.attackerWins).toBe(false);
  });

  it("preserves a no-settlement battle outcome when both forces are eliminated", () => {
    const result = resolveCombatRound({
      attackerWarriors: 1,
      defenderWarriors: 1,
      attackerRolls: [3],
      defenderRolls: [4],
    });
    expect(result.bothArmiesEliminated).toBe(false);
    expect(result.attackerEliminated).toBe(true);
  });
});
