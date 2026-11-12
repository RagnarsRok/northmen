
import { describe, expect, it } from "vitest";
import {
  ACTIONS_PER_TURN,
  MAX_ACTION_CARDS,
  startPlayerTurn,
  completeAction,
  discardPlayerActionCards,
  endPlayerTurn,
} from "./turns";
import type { GameState, ActionCard } from "../../engine/types";

const testCards: ActionCard[] = [
  { id: "card-1", name: "Card 1", description: "Test card 1" },
  { id: "card-2", name: "Card 2", description: "Test card 2" },
  { id: "card-3", name: "Card 3", description: "Test card 3" },
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
        actionCardIds: [],
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

describe("Turn Management", () => {
  it("defines four actions per turn", () => {
    expect(ACTIONS_PER_TURN).toBe(4);
  });

  it("starts a player's turn with four actions", () => {
    const state = createTestState();
    state.remainingActions = 0;

    const result = startPlayerTurn(state);

    expect(result.remainingActions).toBe(4);
  });

  it("completes an action and draws one Action Card", () => {
    const state = createTestState();

    const result = completeAction(state);

    expect(result.remainingActions).toBe(3);
    expect(result.players[0].actionCardIds).toEqual(["card-1"]);
    expect(result.actionDeck).toHaveLength(2);
  });

  it("does not modify the original state when completing an action", () => {
    const state = createTestState();

    const result = completeAction(state);

    expect(state.remainingActions).toBe(4);
    expect(state.players[0].actionCardIds).toEqual([]);
    expect(result).not.toBe(state);
  });

  it("does not allow actions when none remain", () => {
    const state = createTestState();
    state.remainingActions = 0;

    expect(() => completeAction(state)).toThrow();
  });

  it("discards selected cards from the active player's hand", () => {
    const state = createTestState();
    state.players[0].actionCardIds = ["card-1", "card-2"];

    const result = discardPlayerActionCards(state, [testCards[0]]);

    expect(result.players[0].actionCardIds).toEqual(["card-2"]);
    expect(result.actionDiscard.map((card) => card.id)).toContain("card-1");
  });

  it("does not allow discarding a card the player does not own", () => {
    const state = createTestState();

    expect(() =>
      discardPlayerActionCards(state, [testCards[0]])
    ).toThrow();
  });

  it("advances to the next player", () => {
    const state = createTestState();
    state.remainingActions = 0;

    const result = endPlayerTurn(state);

    expect(result.activePlayerIndex).toBe(1);
    expect(result.round).toBe(1);
    expect(result.remainingActions).toBe(4);
  });

  it("rotates the starting player when a new round begins", () => {
    const state = createTestState();
    state.activePlayerIndex = 2;
    state.remainingActions = 0;

    const result = endPlayerTurn(state);

    expect(result.round).toBe(2);
    expect(result.activePlayerIndex).toBe(1);
    expect(result.remainingActions).toBe(4);
  });

  it("resets recruitment capacity for the player whose turn ended", () => {
    const state = createTestState();
    state.remainingActions = 0;
    state.settlements = [
      {
        id: "settlement-1",
        ownerId: "player-1",
        territoryId: "territory-1",
        level: "outpost",
        isMainSettlement: false,
      },
      {
        id: "settlement-2",
        ownerId: "player-2",
        territoryId: "territory-2",
        level: "village",
        isMainSettlement: false,
      },
    ];
    state.recruitmentUsed = {
      "settlement-1": 1,
      "settlement-2": 1,
    };

    const result = endPlayerTurn(state);

    expect(result.recruitmentUsed["settlement-1"]).toBe(0);
    expect(result.recruitmentUsed["settlement-2"]).toBe(1);
  });


it("prevents ending a turn while any longboat remains in open ocean", () => {
  const state = createTestState();
  state.remainingActions = 0;
  state.longboats = [{
    id: "boat-1",
    ownerId: "player-1",
    territoryId: "territory-1",
    location: "at-sea",
  }];

  expect(() => endPlayerTurn(state)).toThrow(/open ocean/);
});

it("defines the seven-card hand limit", () => {
  expect(MAX_ACTION_CARDS).toBe(7);
});

it("ends the turn normally when the player has seven or fewer cards", () => {
  const state = createTestState();
  state.remainingActions = 0;
  state.players[0].actionCardIds = [
    "card-1",
    "card-2",
    "card-3",
  ];

  const result = endPlayerTurn(state);

  expect(result.activePlayerIndex).toBe(1);
  expect(result.pendingActionCardSelection).toBeNull();
});

it("requires a player to discard excess Action Cards", () => {
  const state = createTestState();
  state.remainingActions = 0;
  state.players[0].actionCardIds = [
    "card-1",
    "card-2",
    "card-3",
    "card-4",
    "card-5",
    "card-6",
    "card-7",
    "card-8",
  ];

  const result = endPlayerTurn(state);

  expect(result.activePlayerIndex).toBe(0);
  expect(result.pendingActionCardSelection).toEqual({
    playerId: "player-1",
    discardCount: 1,
  });
});

it("clears the pending selection after the required cards are discarded", () => {
  const state = createTestState();

  state.players[0].actionCardIds = [
    "card-1",
    "card-2",
    "card-3",
    "card-4",
    "card-5",
    "card-6",
    "card-7",
    "card-8",
  ];

  state.pendingActionCardSelection = {
    playerId: "player-1",
    discardCount: 1,
  };

  const result = discardPlayerActionCards(state, [
    { id: "card-8", name: "Card 8", description: "Test card 8" },
  ]);

  expect(result.players[0].actionCardIds).toHaveLength(7);
  expect(result.pendingActionCardSelection).toBeNull();
  });
});