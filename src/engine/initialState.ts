
import type {
  GameState,
  ResourceInventory,
} from "./types";

import {
  createSettlementEventCards,
  shuffleSettlementEventCards,
} from "../systems/settlements/settlementEvents";

export const STARTING_RESOURCES: ResourceInventory = {
  timber: 2,
  iron: 1,
  provisions: 3,
  fish: 0,
  silver: 2,
};

/**
 * Creates an initial game state.
 * Map setup and starting positions will be implemented separately.
 */
export function createEmptyGameState(playerNames: string[]): GameState {
  if (playerNames.length < 3 || playerNames.length > 5) {
    throw new Error("NORTHMEN supports 3 to 5 players.");
  }

  const colors = [
    "#A34336",
    "#397FA3",
    "#C5A33B",
    "#79549A",
    "#4F8768",
  ];

const players = playerNames.map((name, i) => ({
  id: `player-${i + 1}`,
  name,
  clanName: `Clan ${i + 1}`,
  color: colors[i],
  religion: "pagan" as const,
  victoryPoints: 0,
  bonusCardIds: [],
  objectiveCardIds: [],
}));

return {
  version: 1,
  round: 1,
  activePlayerIndex: 0,
  players,
  regions: [],
  territories: [],
  armies: [],
  longboats: [],
  settlements: [],
  ports: [],
settlementEventDeck: shuffleSettlementEventCards(
  createSettlementEventCards()
),
settlementEventDiscard: [],
activeSettlementEvent: null,
};
}
