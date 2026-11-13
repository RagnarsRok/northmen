import type { Army, ArmyId, GameState, PlayerId, TerritoryId } from "../../engine/types";
import { resolveCombatRound } from "../combat/combat";
import { captureSettlement } from "../settlements/settlements";
import { drawSettlementEventCard, resolveSettlementEventCard } from "../settlements/settlementEvents";
import { mergeArmies, splitArmy } from "./armyOperations";
import { unloadArmyFromLongboat } from "../longboats/longboats";
import { beginOceanVoyage, moveLongboatAlongCoast } from "../maritime/maritimeMovement";
import { PROVISIONS_PER_WARRIOR_PER_EXPEDITION, type LandExpedition } from "./landMovement";

export interface MilitaryGroup {
  armyId: ArmyId;
  /** Territory from which this group entered its current territory. */
  entryTerritoryId: TerritoryId;
  active: boolean;
  /** Set when this force disembarked for the expedition; withdrawal returns it to this vessel. */
  seaEntryLongboatId?: string;
}

export interface MilitaryExpedition {
  id: string;
  playerId: PlayerId;
  provisionsPaid: number;
  groups: MilitaryGroup[];
}

export interface MilitaryExpeditionStart { state: GameState; expedition: MilitaryExpedition }
export interface MilitaryMovementResult { state: GameState; expedition: MilitaryExpedition; encounterTerritoryId?: TerritoryId }

function regionForTerritory(state: GameState, territoryId: TerritoryId) {
  const territory = state.territories.find((item) => item.id === territoryId);
  const region = territory && state.regions.find((item) => item.id === territory.regionId);
  if (!territory || !region) throw new Error("Army territory or its region does not exist.");
  return region;
}

/** Starts one Military Expedition. Armies may originate in different territories; each origin-region pool pays for its own warriors. */
export function startMilitaryExpedition(state: GameState, playerId: PlayerId, armyIds: ArmyId[], expeditionId: string): MilitaryExpeditionStart {
  if (!armyIds.length || new Set(armyIds).size !== armyIds.length) throw new Error("Select one or more distinct armies.");
  const armies = armyIds.map((id) => state.armies.find((army) => army.id === id));
  if (armies.some((army) => !army || army.ownerId !== playerId || army.longboatId)) throw new Error("Only your land armies can begin a land Military Expedition.");
  const selected = armies as Army[];
  const costs = new Map<string, number>();
  for (const army of selected) {
    const region = regionForTerritory(state, army.territoryId);
    costs.set(region.id, (costs.get(region.id) ?? 0) + army.warriorCount * PROVISIONS_PER_WARRIOR_PER_EXPEDITION);
  }
  for (const [regionId, cost] of costs) {
    const region = state.regions.find((item) => item.id === regionId)!;
    if (!region.storage[playerId] || region.storage[playerId].provisions < cost) throw new Error(`Not enough Provisions in region ${region.name} to begin this expedition.`);
  }
  const nextRegions = state.regions.map((region) => {
    const cost = costs.get(region.id) ?? 0;
    if (!cost) return region;
    return { ...region, storage: { ...region.storage, [playerId]: { ...region.storage[playerId], provisions: region.storage[playerId].provisions - cost } } };
  });
  const provisionsPaid = [...costs.values()].reduce((sum, cost) => sum + cost, 0);
  return { state: { ...state, regions: nextRegions }, expedition: { id: expeditionId, playerId, provisionsPaid, groups: selected.map((army) => ({ armyId: army.id, entryTerritoryId: army.territoryId, active: true })) } };
}

/** Moves one group over connected land links. Enemy control alone never blocks movement; a hostile army or settlement stops the group for combat. */
export function moveMilitaryGroup(state: GameState, expedition: MilitaryExpedition, armyId: ArmyId, route: TerritoryId[]): MilitaryMovementResult {
  const group = expedition.groups.find((item) => item.armyId === armyId && item.active);
  const army = state.armies.find((item) => item.id === armyId);
  if (!group || !army || army.ownerId !== expedition.playerId || army.longboatId) throw new Error("This army is not an active land group in the expedition.");
  if (route.length < 2 || route[0] !== army.territoryId) throw new Error("Route must start at the army's current territory and include at least one move.");
  let currentId = army.territoryId;
  let entryTerritoryId = group.entryTerritoryId;
  let encounterTerritoryId: TerritoryId | undefined;
  for (const nextId of route.slice(1)) {
    const current = state.territories.find((item) => item.id === currentId);
    if (!current?.connections.some((connection) => connection.territoryId === nextId && connection.type === "land")) throw new Error(`No land connection exists from ${currentId} to ${nextId}.`);
    const next = state.territories.find((item) => item.id === nextId);
    if (!next) throw new Error(`Territory ${nextId} does not exist.`);
    entryTerritoryId = currentId;
    currentId = nextId;
    const hostileArmy = state.armies.some((item) => !item.longboatId && item.territoryId === nextId && item.ownerId !== expedition.playerId);
    const hostileSettlement = state.settlements.some((item) => item.territoryId === nextId && item.ownerId !== expedition.playerId);
    if (hostileArmy || hostileSettlement) { encounterTerritoryId = nextId; break; }
  }
  const nextState = { ...state, armies: state.armies.map((item) => item.id === armyId ? { ...item, territoryId: currentId } : item) };
  const nextExpedition = { ...expedition, groups: expedition.groups.map((item) => item.armyId === armyId ? { ...item, entryTerritoryId, active: !encounterTerritoryId, seaEntryLongboatId: encounterTerritoryId ? item.seaEntryLongboatId : undefined } : item) };
  return { state: nextState, expedition: nextExpedition, encounterTerritoryId };
}

/** Splits a moving group without charging additional Provisions; both resulting groups retain the same entry route. */
export function splitMilitaryGroup(state: GameState, expedition: MilitaryExpedition, armyId: ArmyId, warriorsToSplit: number, newArmyId: ArmyId): { state: GameState; expedition: MilitaryExpedition } {
  const group = expedition.groups.find((item) => item.armyId === armyId);
  if (!group || !group.active) throw new Error("Only an active expedition group can be split.");
  const split = splitArmy(state, armyId, warriorsToSplit, newArmyId);
  return { state: split.state, expedition: { ...expedition, groups: [...expedition.groups, { ...group, armyId: newArmyId }] } };
}

/** Marks a group as finished for this action. It cannot move again without a new Military Expedition. */
export function stopMilitaryGroup(expedition: MilitaryExpedition, armyId: ArmyId): MilitaryExpedition {
  if (!expedition.groups.some((item) => item.armyId === armyId && item.active)) throw new Error("Army is not an active expedition group.");
  return { ...expedition, groups: expedition.groups.map((item) => item.armyId === armyId ? { ...item, active: false } : item) };
}

/** Merges active expedition groups only when their current and entry territories match, preserving a single valid withdrawal route. */
export function mergeMilitaryGroups(state: GameState, expedition: MilitaryExpedition, armyIds: ArmyId[], mergedArmyId: ArmyId): { state: GameState; expedition: MilitaryExpedition } {
  if (armyIds.length < 2) throw new Error("At least two expedition groups are required to merge.");
  const groups = armyIds.map((id) => expedition.groups.find((group) => group.armyId === id));
  if (groups.some((group) => !group || !group.active)) throw new Error("Only active expedition groups can merge.");
  const armies = armyIds.map((id) => state.armies.find((army) => army.id === id));
  if (armies.some((army) => !army || army.longboatId)) throw new Error("Only land armies can merge during a land expedition.");
  const firstGroup = groups[0]!;
  if (groups.some((group) => group!.entryTerritoryId !== firstGroup.entryTerritoryId) || armies.some((army) => army!.territoryId !== armies[0]!.territoryId)) throw new Error("Expedition groups must share a current territory and entry territory to merge.");
  const merged = mergeArmies(state, armyIds, mergedArmyId);
  return { state: merged.state, expedition: { ...expedition, groups: [...expedition.groups.filter((group) => !armyIds.includes(group.armyId)), { armyId: mergedArmyId, entryTerritoryId: firstGroup.entryTerritoryId, active: true }] } };
}

/** Pays the normal army Provisions cost and disembarks an embarked force to begin a land expedition from its Longboat. */
export function disembarkIntoMilitaryExpedition(state: GameState, playerId: PlayerId, longboatId: string, expeditionId: string): MilitaryExpeditionStart {
  const boat = state.longboats.find((item) => item.id === longboatId);
  const army = state.armies.find((item) => item.longboatId === longboatId);
  if (!boat || boat.ownerId !== playerId || boat.location === "at-sea" || !army || army.ownerId !== playerId) throw new Error("An owned, docked or anchored Longboat carrying your army is required.");
  const region = regionForTerritory(state, boat.territoryId);
  const cost = army.warriorCount * PROVISIONS_PER_WARRIOR_PER_EXPEDITION;
  const inventory = region.storage[playerId];
  if (!inventory || inventory.provisions < cost) throw new Error("Not enough Provisions to disembark and begin this expedition.");
  const paidState = { ...state, regions: state.regions.map((item) => item.id === region.id ? { ...item, storage: { ...item.storage, [playerId]: { ...inventory, provisions: inventory.provisions - cost } } } : item) };
  const unloadedState = unloadArmyFromLongboat(paidState, playerId, longboatId);
  return { state: unloadedState, expedition: { id: expeditionId, playerId, provisionsPaid: cost, groups: [{ armyId: army.id, entryTerritoryId: boat.territoryId, active: true, seaEntryLongboatId: longboatId }] } };
}

/** Moves an embarked army along connected coastal links as part of a Military Expedition. */
export function moveEmbarkedArmyAlongCoast(state: GameState, playerId: PlayerId, longboatId: string, destinationTerritoryId: TerritoryId): GameState {
  const boat = state.longboats.find((item) => item.id === longboatId);
  const army = state.armies.find((item) => item.longboatId === longboatId);
  if (!boat || boat.ownerId !== playerId || !army || army.ownerId !== playerId) throw new Error("An owned longboat carrying your army is required for coastal military movement.");
  return moveLongboatAlongCoast(state, playerId, longboatId, destinationTerritoryId, army.warriorCount * PROVISIONS_PER_WARRIOR_PER_EXPEDITION);
}

/** Begins an open-ocean Military Expedition for an embarked army; existing maritime validation and Voyage Event handling remain authoritative. */
export function beginEmbarkedArmyOceanVoyage(state: GameState, playerId: PlayerId, longboatId: string, destinationTerritoryId: TerritoryId, baseSurcharges: number[]): GameState | null {
  const boat = state.longboats.find((item) => item.id === longboatId);
  const army = state.armies.find((item) => item.longboatId === longboatId);
  if (!boat || boat.ownerId !== playerId || !army || army.ownerId !== playerId) return null;
  return beginOceanVoyage(state, playerId, longboatId, destinationTerritoryId, army.warriorCount * PROVISIONS_PER_WARRIOR_PER_EXPEDITION, baseSurcharges);
}

export interface CombatRoundPlan {
  attackerRolls: number[];
  defenderRolls: number[];
  settlementRoll?: number;
  /** One army ID per attacker casualty, chosen by the attacker. */
  attackerCasualtyArmyIds: ArmyId[];
  /** The attacker's decision after this round. False means withdraw to a legal entry territory. */
  continueAttack: boolean;
  /** Required for coordinated attacks when withdrawing: one of the participating groups' entry territories. */
  coordinatedWithdrawalTerritoryId?: TerritoryId;
}

export interface MilitaryCombatResult {
  state: GameState;
  expedition: MilitaryExpedition;
  outcome: "attacker-wins" | "attacker-withdraws" | "attacker-eliminated" | "defender-holds" | "combat-incomplete";
  roundsResolved: number;
  settlementEventPending: boolean;
}

/** Resolves a deterministic multi-round battle. Each round supplies dice and casualty allocation, keeping randomness outside the rules engine. */
export function resolveMilitaryCombat(
  initialState: GameState,
  expedition: MilitaryExpedition,
  targetTerritoryId: TerritoryId,
  attackingArmyIds: ArmyId[],
  defendingArmyId: ArmyId | undefined,
  roundPlans: CombatRoundPlan[],
): MilitaryCombatResult {
  if (!attackingArmyIds.length || new Set(attackingArmyIds).size !== attackingArmyIds.length) throw new Error("A battle needs distinct participating attacking armies.");
  const groups = attackingArmyIds.map((id) => expedition.groups.find((item) => item.armyId === id));
  const attackers = attackingArmyIds.map((id) => initialState.armies.find((item) => item.id === id));
  if (groups.some((group) => !group) || attackers.some((army) => !army || army.ownerId !== expedition.playerId || army.territoryId !== targetTerritoryId || army.longboatId)) throw new Error("All attacking armies must be expedition participants in the battle territory.");
  if (attackingArmyIds.some((id) => !groups.some((group) => group?.armyId === id && !group.active))) throw new Error("Attacking groups must have reached an encounter and stopped for combat.");
  const defender = defendingArmyId ? initialState.armies.find((item) => item.id === defendingArmyId) : undefined;
  if (defendingArmyId && (!defender || defender.ownerId === expedition.playerId || defender.territoryId !== targetTerritoryId || defender.longboatId)) throw new Error("The defending army is not a hostile land army in the battle territory.");
  const settlement = initialState.settlements.find((item) => item.territoryId === targetTerritoryId && item.ownerId !== expedition.playerId);
  const hostileArmiesAtTarget = initialState.armies.filter((army) => !army.longboatId && army.territoryId === targetTerritoryId && army.ownerId !== expedition.playerId);
  if (hostileArmiesAtTarget.length > 0 && !defendingArmyId) throw new Error("A hostile army in the territory must be resolved before settlement capture.");
  if (!defender && !settlement) throw new Error("There is no hostile army or settlement to fight.");
  if (!roundPlans.length) throw new Error("At least one combat round must be supplied.");

  let state = initialState;
  let roundsResolved = 0;
  let outcome: MilitaryCombatResult["outcome"] = "combat-incomplete";
  for (const plan of roundPlans) {
    const currentAttackers = attackingArmyIds.map((id) => state.armies.find((item) => item.id === id)).filter((item): item is Army => Boolean(item));
    const attackerCount = currentAttackers.reduce((sum, army) => sum + army.warriorCount, 0);
    const currentDefender = defendingArmyId ? state.armies.find((item) => item.id === defendingArmyId) : undefined;
    const defenderCount = currentDefender?.warriorCount ?? 0;
    if (attackerCount < 1) { outcome = "attacker-eliminated"; break; }
    const round = resolveCombatRound({
      attackerWarriors: attackerCount,
      defenderWarriors: defenderCount,
      attackerRolls: plan.attackerRolls,
      defenderRolls: plan.defenderRolls,
      settlementLevel: settlement?.level,
      settlementRoll: settlement ? plan.settlementRoll : undefined,
    });
    if (plan.attackerCasualtyArmyIds.length !== round.attackerCasualties) throw new Error("Attacker casualty allocation must name exactly one participating army per casualty.");
    const remainingByArmy = new Map(currentAttackers.map((army) => [army.id, army.warriorCount]));
    for (const casualtyArmyId of plan.attackerCasualtyArmyIds) {
      const remaining = remainingByArmy.get(casualtyArmyId);
      if (remaining === undefined || remaining < 1) throw new Error("Casualties can only be assigned to participating armies with surviving warriors.");
      remainingByArmy.set(casualtyArmyId, remaining - 1);
    }
    const updatedArmies = state.armies.map((army) => {
      const remaining = remainingByArmy.get(army.id);
      if (remaining !== undefined) return { ...army, warriorCount: remaining };
      if (defendingArmyId && army.id === defendingArmyId) return { ...army, warriorCount: Math.max(0, army.warriorCount - round.defenderCasualties) };
      return army;
    }).filter((army) => army.warriorCount > 0);
    state = { ...state, armies: updatedArmies };
    roundsResolved += 1;
    const survivors = attackingArmyIds.map((id) => state.armies.find((army) => army.id === id)).filter((army): army is Army => Boolean(army));
    const remainingAttackers = survivors.reduce((sum, army) => sum + army.warriorCount, 0);
    const remainingDefender = defendingArmyId ? state.armies.find((army) => army.id === defendingArmyId)?.warriorCount ?? 0 : 0;
    if (remainingAttackers === 0) { outcome = "attacker-eliminated"; break; }
    if (remainingDefender === 0 && (!settlement || round.settlementDefeated)) {
      outcome = "attacker-wins";
      break;
    }
    if (!plan.continueAttack) {
      const legalEntries = (groups as MilitaryGroup[]).map((group) => group.entryTerritoryId);
      const retreatTo = attackingArmyIds.length === 1 ? legalEntries[0] : plan.coordinatedWithdrawalTerritoryId;
      if (!retreatTo || !legalEntries.includes(retreatTo)) throw new Error("A coordinated withdrawal must select one participating army's entry territory.");
      state = { ...state, armies: state.armies.map((army) => {
        if (!attackingArmyIds.includes(army.id)) return army;
        const group = (groups as MilitaryGroup[]).find((item) => item.armyId === army.id);
        if (group?.seaEntryLongboatId) {
          const boat = state.longboats.find((item) => item.id === group.seaEntryLongboatId && item.ownerId === expedition.playerId && item.location !== "at-sea");
          if (boat) return { ...army, territoryId: boat.territoryId, longboatId: boat.id };
        }
        return { ...army, territoryId: retreatTo };
      }) };
      outcome = "attacker-withdraws";
      break;
    }
  }
  if (outcome === "combat-incomplete" && roundsResolved > 0) {
    const survivors = attackingArmyIds.some((id) => state.armies.some((army) => army.id === id));
    if (!survivors) outcome = "attacker-eliminated";
  }
  const survivingAttackers = attackingArmyIds.filter((id) => state.armies.some((army) => army.id === id));
  const nextExpedition = { ...expedition, groups: expedition.groups.filter((group) => !attackingArmyIds.includes(group.armyId) || survivingAttackers.includes(group.armyId)).map((group) => attackingArmyIds.includes(group.armyId) ? { ...group, entryTerritoryId: outcome === "attacker-wins" ? targetTerritoryId : group.entryTerritoryId, active: outcome === "attacker-wins", seaEntryLongboatId: outcome === "attacker-wins" ? undefined : group.seaEntryLongboatId } : group) };
  let settlementEventPending = false;
  if (outcome === "attacker-wins" && settlement) {
    if (settlement.level === "outpost") {
      state = captureSettlement(state, expedition.playerId, settlement.id);
    } else {
      state = drawSettlementEventCard(state);
      settlementEventPending = state.activeSettlementEvent !== null;
      if (!settlementEventPending) state = captureSettlement(state, expedition.playerId, settlement.id);
    }
  }
  return { state, expedition: nextExpedition, outcome, roundsResolved, settlementEventPending };
}

/** Call after the drawn Settlement Event Card has been resolved/discarded. Capture only succeeds if an attacking warrior still occupies the territory. */
export function finalizePendingSettlementCapture(state: GameState, playerId: PlayerId, territoryId: TerritoryId, settlementId: string, replacementMainSettlementId?: string): GameState {
  if (state.activeSettlementEvent !== null) throw new Error("Resolve the active Settlement Event before transferring settlement ownership.");
  if (!state.armies.some((army) => army.ownerId === playerId && army.territoryId === territoryId && army.warriorCount > 0)) throw new Error("At least one attacking warrior must remain in the territory to capture the settlement.");
  const settlement = state.settlements.find((item) => item.id === settlementId && item.territoryId === territoryId);
  if (!settlement || settlement.ownerId === playerId) throw new Error("The hostile settlement is not available to capture.");
  return captureSettlement(state, playerId, settlementId, replacementMainSettlementId);
}

/** Completes the pending Settlement Event card step without inventing an event effect. */
export function discardResolvedSettlementEvent(state: GameState): GameState {
  return resolveSettlementEventCard(state);
}

/** Converts an existing land expedition to the richer military expedition shape without changing state. */
export function upgradeLandExpedition(expedition: LandExpedition): MilitaryExpedition {
  return { id: expedition.id, playerId: expedition.playerId, provisionsPaid: expedition.provisionsPaid, groups: expedition.groups.map((group) => ({ armyId: group.armyId, entryTerritoryId: group.territoryId, active: group.active })) };
}
