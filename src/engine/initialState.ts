import type { GameState, ResourceInventory } from "./types";
export const STARTING_RESOURCES: ResourceInventory = { timber: 2, iron: 1, provisions: 3, fish: 0, silver: 2 };
/** Minimal deterministic shell state. Starting positions and balance are not implemented. */
export function createEmptyGameState(playerNames: string[]): GameState {
  if (playerNames.length < 3 || playerNames.length > 5) throw new Error("NORTHMEN supports 3 to 5 players.");
  const colors = ["#A34B36", "#397FA3", "#C5A33B", "#79549A", "#4F8768"];
  return { version: 1, round: 1, activePlayerIndex: 0, players: playerNames.map((name, i) => ({ id: `player-${i+1}`, name, clanName: `Clan ${i+1}`, color: colors[i], resources: { ...STARTING_RESOURCES } })), regions: [] };
}
