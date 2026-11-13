import type { Army, ArmyId, GameState, PlayerId, TerritoryId } from "../../engine/types";

export interface ArmyOperationResult { state: GameState; army: Army }

function assertPositiveWarriors(count: number): void {
  if (!Number.isInteger(count) || count < 1) throw new Error("An army must contain at least one warrior.");
}

export function createArmy(state: GameState, ownerId: PlayerId, territoryId: TerritoryId, warriorCount: number, id: ArmyId): ArmyOperationResult {
  assertPositiveWarriors(warriorCount);
  if (!state.players.some(p => p.id === ownerId)) throw new Error("Army owner does not exist.");
  if (!state.territories.some(t => t.id === territoryId)) throw new Error("Army territory does not exist.");
  if (state.armies.some(a => a.id === id)) throw new Error("Army ID already exists.");
  const army: Army = { id, ownerId, territoryId, warriorCount };
  return { state: { ...state, armies: [...state.armies, army] }, army };
}

export function splitArmy(state: GameState, armyId: ArmyId, warriorsToSplit: number, newArmyId: ArmyId): ArmyOperationResult {
  const source = state.armies.find(a => a.id === armyId);
  if (!source || source.longboatId) throw new Error("A land army must be selected to split.");
  if (!Number.isInteger(warriorsToSplit) || warriorsToSplit < 1 || warriorsToSplit >= source.warriorCount) throw new Error("Split must leave at least one warrior in each army.");
  if (state.armies.some(a => a.id === newArmyId)) throw new Error("Army ID already exists.");
  const split: Army = { ...source, id: newArmyId, warriorCount: warriorsToSplit };
  const updated = state.armies.map(a => a.id === armyId ? { ...a, warriorCount: a.warriorCount - warriorsToSplit } : a);
  return { state: { ...state, armies: [...updated, split] }, army: split };
}

export function mergeArmies(state: GameState, armyIds: ArmyId[], mergedArmyId: ArmyId): ArmyOperationResult {
  if (armyIds.length < 2 || new Set(armyIds).size !== armyIds.length) throw new Error("At least two distinct armies are required.");
  const selected = armyIds.map(id => state.armies.find(a => a.id === id));
  if (selected.some((a): a is undefined => !a)) throw new Error("Every selected army must exist.");
  const armies = selected as Army[];
  const first = armies[0];
  if (armies.some(a => a.ownerId !== first.ownerId || a.territoryId !== first.territoryId || a.longboatId !== first.longboatId)) throw new Error("Armies must share an owner and location to merge.");
  if (state.armies.some(a => a.id === mergedArmyId && !armyIds.includes(a.id))) throw new Error("Merged army ID already exists.");
  const merged: Army = { ...first, id: mergedArmyId, warriorCount: armies.reduce((n, a) => n + a.warriorCount, 0) };
  return { state: { ...state, armies: [...state.armies.filter(a => !armyIds.includes(a.id)), merged] }, army: merged };
}

export function getArmiesAt(state: GameState, territoryId: TerritoryId, ownerId?: PlayerId): Army[] {
  return state.armies.filter(a => !a.longboatId && a.territoryId === territoryId && (ownerId === undefined || a.ownerId === ownerId));
}
