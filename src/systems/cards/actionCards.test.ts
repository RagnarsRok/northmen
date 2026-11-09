
import { describe, expect, it } from "vitest";

import {
  createActionCardDeck,
  discardActionCards,
  drawActionCards,
  shuffleActionCards,
} from "./actionCards";

import type { ActionCard, GameState } from "../../engine/types";

const testCards: ActionCard[] = [
  { id: "action-1", name: "Card 1", description: "Test card 1" },
  { id: "action-2", name: "Card 2", description: "Test card 2" },
  { id: "action-3", name: "Card 3", description: "Test card 3" },
];

function createTestState(): GameState {
  return {
    version: 1,
    round: 1,
    activePlayerIndex: 0,
    remainingActions: 4,
    players: [
      {
        id: "player-1",
        name: "Player 1",
        clanName: "Clan 1",
        color: "#000000",
        religion: "pagan",
        victoryPoints: 0,
        actionCardIds: ["action-1", "action-2"],
        objectiveCardIds: [],
      },
      {
        id: "player-2",
        name: "Player 2",
        clanName: "Clan 2",
        color: "#ffffff",
        religion: "pagan",
        victoryPoints: 0,
        actionCardIds: [],
        objectiveCardIds: [],
      },
      {
        id: "player-3",
        name: "Player 3",
        clanName: "Clan 3",
        color: "#ff0000",
        religion: "pagan",
        victoryPoints: 0,
        actionCardIds: [],
        objectiveCardIds: [],
      },
    ],
    regions: [],
    territories: [],
    armies: [],
    longboats: [],
    settlements: [],
    recruitmentUsed: {},
    ports: [],
    actionDeck: [...testCards],
    actionDiscard: [],
    pendingActionCardSelection: null,
    settlementEventDeck: [],
    settlementEventDiscard: [],
    activeSettlementEvent: null,
  };
}

describe("Action Card system", () => {
  it("creates a deck containing all supplied cards", () => {
    const deck = createActionCardDeck(testCards, () => 0);

    expect(deck).toHaveLength(3);
    expect(deck.map((card) => card.id).sort()).toEqual([
      "action-1",
      "action-2",
      "action-3",
    ]);
  });

  it("shuffles without modifying the original array", () => {
    const original = [...testCards];
    const shuffled = shuffleActionCards(testCards, () => 0);

    expect(testCards).toEqual(original);
    expect(shuffled).not.toBe(testCards);
  });

  it("draws the requested number of cards", () => {
    const state = createTestState();

    const result = drawActionCards(state, 2);

    expect(result.drawnCards).toHaveLength(2);
    expect(result.state.actionDeck).toHaveLength(1);
  });

  it("draws all available cards when the requested count is larger", () => {
    const state = createTestState();

    const result = drawActionCards(state, 5);

    expect(result.drawnCards).toHaveLength(3);
    expect(result.state.actionDeck).toHaveLength(0);
  });

  it("reshuffles the discard pile when the draw deck is empty", () => {
    const state = createTestState();

    state.actionDeck = [];
    state.actionDiscard = [...testCards];

    const result = drawActionCards(state, 2, () => 0);

    expect(result.drawnCards).toHaveLength(2);
    expect(result.state.actionDiscard).toHaveLength(0);
    expect(result.state.actionDeck).toHaveLength(1);
  });

  it("stops drawing when both piles are empty", () => {
    const state = createTestState();

    state.actionDeck = [];
    state.actionDiscard = [];

    const result = drawActionCards(state, 3);

    expect(result.drawnCards).toHaveLength(0);
  });

  it("rejects a negative or invalid draw count", () => {
    const state = createTestState();

    expect(() => drawActionCards(state, -1)).toThrow();
    expect(() => drawActionCards(state, 1.5)).toThrow();
  });

  it("discards selected cards from the player's hand", () => {
    const state = createTestState();

    const result = discardActionCards(state, [testCards[0]]);

    expect(result.players[0].actionCardIds).toEqual(["action-2"]);
    expect(result.actionDiscard).toHaveLength(1);
    expect(result.actionDiscard[0].id).toBe("action-1");
  });

  it("does not modify the original state when drawing", () => {
    const state = createTestState();
    const originalDeck = [...state.actionDeck];

    drawActionCards(state, 2);

    expect(state.actionDeck).toEqual(originalDeck);
  });

  it("does not modify the original state when discarding", () => {
    const state = createTestState();
    const originalHand = [...state.players[0].actionCardIds];

    discardActionCards(state, [testCards[0]]);

    expect(state.players[0].actionCardIds).toEqual(originalHand);
  });
});
