import type { GameState, LongboatId, PlayerId, TerritoryId, VoyageEventCard, VoyageEventEffect } from "../../engine/types";
import { calculateActualVoyageProvisions, calculateMaximumVoyageProvisions } from "./voyageCosts";
import { discardVoyageEventCards, resolveVoyageEventChoice } from "./voyageEvents";
import { destroyLongboat } from "../longboats/longboats";

export function findMaritimePath(
  state: GameState,
  startTerritoryId: TerritoryId,
  destinationTerritoryId: TerritoryId,
  routeType: "coastal" | "open-ocean",
): TerritoryId[] | null {
  if (startTerritoryId === destinationTerritoryId) return [startTerritoryId];
  const queue: TerritoryId[] = [startTerritoryId];
  const previous = new Map<TerritoryId, TerritoryId | null>([[startTerritoryId, null]]);

  while (queue.length) {
    const currentId = queue.shift()!;
    const current = state.territories.find((territory) => territory.id === currentId);
    if (!current) continue;
    for (const connection of current.connections) {
      if (connection.type !== routeType || previous.has(connection.territoryId)) continue;
      const next = state.territories.find((territory) => territory.id === connection.territoryId);
      if (!next) continue;
      if (routeType === "coastal" && (current.terrain !== "coastal" || next.terrain !== "coastal")) continue;
      previous.set(next.id, currentId);
      if (next.id === destinationTerritoryId) {
        const path: TerritoryId[] = [destinationTerritoryId];
        let cursor: TerritoryId | null = currentId;
        while (cursor) {
          path.unshift(cursor);
          cursor = previous.get(cursor) ?? null;
        }
        return path;
      }
      queue.push(next.id);
    }
  }
  return null;
}

function getPlayerInventory(state: GameState, playerId: PlayerId, territoryId: TerritoryId) {
  const territory = state.territories.find((item) => item.id === territoryId);
  const region = territory && state.regions.find((item) => item.id === territory.regionId);
  const inventory = region?.storage[playerId];
  return { region, inventory };
}

export function moveLongboatAlongCoast(
  state: GameState,
  playerId: PlayerId,
  longboatId: LongboatId,
  destinationTerritoryId: TerritoryId,
  normalArmyProvisionsCost: number,
): GameState {
  const boat = state.longboats.find((item) => item.id === longboatId);
  if (!boat || boat.ownerId !== playerId || boat.location === "at-sea") return state;
  const path = findMaritimePath(state, boat.territoryId, destinationTerritoryId, "coastal");
  if (!path || path.length < 2) return state;
  if (!Number.isInteger(normalArmyProvisionsCost) || normalArmyProvisionsCost < 0) return state;
  const army = state.armies.find((item) => item.longboatId === longboatId);
  if (army && army.ownerId !== playerId) return state;
  if (!army && normalArmyProvisionsCost !== 0) return state;

  const { region, inventory } = getPlayerInventory(state, playerId, boat.territoryId);
  if (!region || !inventory || inventory.provisions < normalArmyProvisionsCost) return state;
  const destinationPort = state.ports.find((port) => port.territoryId === destinationTerritoryId && port.ownerId === playerId);

  return {
    ...state,
    regions: state.regions.map((item) => item.id === region.id ? {
      ...item,
      storage: { ...item.storage, [playerId]: { ...inventory, provisions: inventory.provisions - normalArmyProvisionsCost } },
    } : item),
    longboats: state.longboats.map((item) => item.id === longboatId ? {
      ...item,
      territoryId: destinationTerritoryId,
      location: destinationPort ? "at-port" : "anchored",
      portId: destinationPort?.id,
    } : item),
    armies: state.armies.map((item) => item.longboatId === longboatId ? { ...item, territoryId: destinationTerritoryId } : item),
  };
}

export function canCommitOceanVoyage(
  state: GameState,
  playerId: PlayerId,
  longboatId: LongboatId,
  destinationTerritoryId: TerritoryId,
  normalArmyProvisionsCost: number,
  baseSurcharges: number[],
): boolean {
  const boat = state.longboats.find((item) => item.id === longboatId);
  if (!boat || boat.ownerId !== playerId || boat.location === "at-sea") return false;
  const path = findMaritimePath(state, boat.territoryId, destinationTerritoryId, "open-ocean");
  if (!path || path.length !== baseSurcharges.length + 1) return false;
  const army = state.armies.find((item) => item.longboatId === longboatId);
  if (army && army.ownerId !== playerId) return false;
  if (!army && normalArmyProvisionsCost !== 0) return false;
  try {
    const maximumRequired = calculateMaximumVoyageProvisions(normalArmyProvisionsCost, baseSurcharges);
    const { inventory } = getPlayerInventory(state, playerId, boat.territoryId);
    return Boolean(inventory && inventory.provisions >= maximumRequired);
  } catch {
    return false;
  }
}

export interface OceanVoyageResolution {
  state: GameState;
  finalTerritoryId: TerritoryId;
  destroyed: boolean;
  surchargePaid: number;
}

/**
 * Commits an ocean voyage and pays the normal army Provisions cost before
 * Voyage Event cards are drawn. The maximum surcharge must be affordable too.
 */
export function beginOceanVoyage(
  state: GameState,
  playerId: PlayerId,
  longboatId: LongboatId,
  destinationTerritoryId: TerritoryId,
  normalArmyProvisionsCost: number,
  baseSurcharges: number[],
): GameState | null {
  if (state.pendingOceanVoyage) return null;
  if (!canCommitOceanVoyage(state, playerId, longboatId, destinationTerritoryId, normalArmyProvisionsCost, baseSurcharges)) return null;
  const boat = state.longboats.find((item) => item.id === longboatId);
  if (!boat) return null;
  const { region, inventory } = getPlayerInventory(state, playerId, boat.territoryId);
  if (!region || !inventory) return null;

  return {
    ...state,
    regions: state.regions.map((item) => item.id === region.id ? {
      ...item,
      storage: { ...item.storage, [playerId]: { ...inventory, provisions: inventory.provisions - normalArmyProvisionsCost } },
    } : item),
    pendingOceanVoyage: {
      playerId,
      longboatId,
      originTerritoryId: boat.territoryId,
      destinationTerritoryId,
      normalArmyProvisionsCost,
      baseSurcharges: [...baseSurcharges],
    },
  };
}

/**
 * Resolves the event cards after the player has committed and paid the normal
 * army cost. Only the event-adjusted ocean surcharge is paid in this stage.
 */
export function resolvePendingOceanVoyage(
  state: GameState,
  eventCards: VoyageEventCard[],
  choices: (string | undefined)[] = [],
): OceanVoyageResolution | null {
  const pending = state.pendingOceanVoyage;
  if (!pending || eventCards.length !== pending.baseSurcharges.length || choices.length > eventCards.length) return null;
  const boat = state.longboats.find((item) => item.id === pending.longboatId);
  if (!boat || boat.ownerId !== pending.playerId || boat.territoryId !== pending.originTerritoryId) return null;

  let effects: VoyageEventEffect[];
  try {
    effects = eventCards.map((card, index) => resolveVoyageEventChoice(card, choices[index]));
  } catch {
    return null;
  }
  const surchargeCards = eventCards.map((card, index) => {
    const effect = effects[index];
    return effect.type === "surcharge-adjustment" ? { ...card, surchargeAdjustment: effect.amount } : card;
  });
  const surchargePaid = calculateActualVoyageProvisions(0, pending.baseSurcharges, surchargeCards);
  const { region, inventory } = getPlayerInventory(state, pending.playerId, pending.originTerritoryId);
  if (!region || !inventory || inventory.provisions < surchargePaid) return null;

  const cardsDiscardedState = discardVoyageEventCards(state, eventCards);
  const shipwreck = effects.some((effect) => effect.type === "shipwreck");
  const paidRegions = cardsDiscardedState.regions.map((item) => item.id === region.id ? {
    ...item,
    storage: { ...item.storage, [pending.playerId]: { ...inventory, provisions: inventory.provisions - surchargePaid } },
  } : item);
  if (shipwreck) {
    const wreckState: GameState = { ...cardsDiscardedState, regions: paidRegions, pendingOceanVoyage: null };
    return {
      state: destroyLongboat(wreckState, pending.longboatId),
      finalTerritoryId: pending.originTerritoryId,
      destroyed: true,
      surchargePaid,
    };
  }

  let finalTerritoryId = pending.destinationTerritoryId;
  for (const effect of effects) {
    if (effect.type === "divert" || effect.type === "strand") {
      const target = state.territories.find((territory) => territory.id === effect.destinationTerritoryId);
      if (!target || target.terrain !== "coastal") return null;
      finalTerritoryId = effect.destinationTerritoryId;
    }
  }
  const finalTerritory = state.territories.find((territory) => territory.id === finalTerritoryId);
  if (!finalTerritory || finalTerritory.terrain !== "coastal") return null;
  const destinationPort = state.ports.find((port) => port.territoryId === finalTerritoryId && port.ownerId === pending.playerId);
  let nextRegions = paidRegions;
  for (const effect of effects) {
    if (effect.type !== "resource-gain") continue;
    if (!Number.isInteger(effect.amount) || effect.amount < 0) return null;
    const targetTerritory = state.territories.find((territory) => territory.id === finalTerritoryId);
    const targetRegion = targetTerritory && nextRegions.find((item) => item.id === targetTerritory.regionId);
    if (!targetRegion) return null;
    const targetInventory = targetRegion.storage[pending.playerId] ?? { timber: 0, iron: 0, provisions: 0, fish: 0, silver: 0 };
    nextRegions = nextRegions.map((item) => item.id === targetRegion.id ? {
      ...item,
      storage: { ...item.storage, [pending.playerId]: { ...targetInventory, [effect.resource]: targetInventory[effect.resource] + effect.amount } },
    } : item);
  }

  const nextState: GameState = {
    ...cardsDiscardedState,
    regions: nextRegions,
    pendingOceanVoyage: null,
    longboats: state.longboats.map((item) => item.id === pending.longboatId ? {
      ...item,
      territoryId: finalTerritoryId,
      location: destinationPort ? "at-port" : "anchored",
      portId: destinationPort?.id,
    } : item),
    armies: state.armies.map((item) => item.longboatId === pending.longboatId ? { ...item, territoryId: finalTerritoryId } : item),
  };
  return { state: nextState, finalTerritoryId, destroyed: false, surchargePaid };
}
