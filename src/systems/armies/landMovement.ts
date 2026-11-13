import type { ArmyId, GameState, PlayerId, TerritoryId } from "../../engine/types";

export const PROVISIONS_PER_WARRIOR_PER_EXPEDITION = 1;

export interface LandExpedition {
  id: string;
  playerId: PlayerId;
  paidWarriors: number;
  provisionsPaid: number;
  groups: Array<{ armyId: ArmyId; territoryId: TerritoryId; active: boolean }>;
}

export interface ExpeditionStartResult { state: GameState; expedition: LandExpedition }
export interface MovementResult { state: GameState; expedition: LandExpedition; encounter?: { territoryId: TerritoryId; enemyArmyIds: ArmyId[] } }

function getRegionalPool(state: GameState, playerId: PlayerId, territoryId: TerritoryId) {
  const territory = state.territories.find(t => t.id === territoryId);
  if (!territory) throw new Error("Territory does not exist.");
  const region = state.regions.find(r => r.id === territory.regionId);
  if (!region) throw new Error("Territory region does not exist.");
  const pool = region.storage[playerId];
  if (!pool) throw new Error("Player has no resource pool in this region.");
  return { region, pool };
}

export function startLandExpedition(state: GameState, playerId: PlayerId, armyIds: ArmyId[], expeditionId: string): ExpeditionStartResult {
  if (!armyIds.length || new Set(armyIds).size !== armyIds.length) throw new Error("Select one or more distinct armies.");
  const armies = armyIds.map(id => state.armies.find(a => a.id === id));
  if (armies.some(a => !a)) throw new Error("Every selected army must exist.");
  const selected = armies as NonNullable<(typeof armies)[number]>[];
  if (selected.some(a => a.ownerId !== playerId || a.longboatId)) throw new Error("Only your land armies can join a land expedition.");
  if (selected.some(a => a.territoryId !== selected[0].territoryId)) throw new Error("Armies must meet in the same territory before combining for an expedition.");
  const warriors = selected.reduce((n, a) => n + a.warriorCount, 0);
  const cost = warriors * PROVISIONS_PER_WARRIOR_PER_EXPEDITION;
  const { region, pool } = getRegionalPool(state, playerId, selected[0].territoryId);
  if (pool.provisions < cost) throw new Error("Not enough Provisions to begin this expedition.");
  const nextPool = { ...pool, provisions: pool.provisions - cost };
  const nextRegion = { ...region, storage: { ...region.storage, [playerId]: nextPool } };
  const nextState = { ...state, regions: state.regions.map(r => r.id === region.id ? nextRegion : r) };
  return { state: nextState, expedition: { id: expeditionId, playerId, paidWarriors: warriors, provisionsPaid: cost, groups: selected.map(a => ({ armyId: a.id, territoryId: a.territoryId, active: true })) } };
}

export function moveExpeditionGroup(state: GameState, expedition: LandExpedition, armyId: ArmyId, route: TerritoryId[]): MovementResult {
  const group = expedition.groups.find(g => g.armyId === armyId);
  const army = state.armies.find(a => a.id === armyId);
  if (!group || !group.active || !army || army.ownerId !== expedition.playerId || army.longboatId) throw new Error("This army is not an active group in the expedition.");
  if (!route.length || route[0] !== group.territoryId) throw new Error("Route must begin in the army's current territory.");
  let current = group.territoryId;
  let encounter: MovementResult["encounter"];
  for (const nextId of route.slice(1)) {
    const from = state.territories.find(t => t.id === current);
    const edge = from?.connections.find(c => c.territoryId === nextId && c.type === "land");
    if (!edge) throw new Error(`No land connection exists from ${current} to ${nextId}.`);
    const enemyArmies = state.armies.filter(a => !a.longboatId && a.territoryId === nextId && a.ownerId !== expedition.playerId);
    const enemySettlement = state.settlements.some(s => s.territoryId === nextId && s.ownerId !== expedition.playerId);
    current = nextId;
    if (enemyArmies.length || enemySettlement) {
      encounter = { territoryId: nextId, enemyArmyIds: enemyArmies.map(a => a.id) };
      break;
    }
  }
  const nextState = { ...state, armies: state.armies.map(a => a.id === armyId ? { ...a, territoryId: current } : a) };
  const nextExpedition = { ...expedition, groups: expedition.groups.map(g => g.armyId === armyId ? { ...g, territoryId: current, active: !encounter } : g) };
  return { state: nextState, expedition: nextExpedition, encounter };
}

export function stopExpeditionGroup(expedition: LandExpedition, armyId: ArmyId): LandExpedition {
  if (!expedition.groups.some(g => g.armyId === armyId && g.active)) throw new Error("Army is not an active expedition group.");
  return { ...expedition, groups: expedition.groups.map(g => g.armyId === armyId ? { ...g, active: false } : g) };
}
