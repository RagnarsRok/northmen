
import { describe, expect, it } from "vitest";
import { createEmptyGameState } from "../../engine/initialState";
import {
  createSettlementEventCards,
  shuffleSettlementEventCards,
  drawSettlementEventCard,
  resolveSettlementEventCard,
  captureSettlementWithEvent,
} from "./settlementEvents";

function createCaptureTestState(
  level: "outpost" | "village" | "trading-post" | "town"
) {
  const state = createEmptyGameState(["A", "B", "C"]);

  state.regions = [
    {
      id: "region-1",
      name: "Test Region",
      territoryIds: ["territory-1"],
      storage: {
        "player-1": {
          timber: 0, iron: 0, provisions: 0, fish: 0, silver: 0,
        },
        "player-2": {
          timber: 0, iron: 0, provisions: 0, fish: 0, silver: 0,
        },
        "player-3": {
          timber: 0, iron: 0, provisions: 0, fish: 0, silver: 0,
        },
      },
    },
  ];

  state.territories = [
    {
      id: "territory-1",
      name: "Test Territory",
      regionId: "region-1",
      terrain: "forest",
      primaryResource: "timber",
      secondaryResource: "iron",
      connections: [],
      ownerId: "player-1",
    },
  ];

  state.settlements = [
    {
      id: "settlement-1",
      ownerId: "player-1",
      territoryId: "territory-1",
      level,
      isMainSettlement: false,
    },
  ];

  return state;
}

describe("Settlement Event Cards", () => {
  it("creates exactly 30 Settlement Event Cards", () => {
    const cards = createSettlementEventCards();
    expect(cards).toHaveLength(30);
  });

  it("creates a unique ID for every card", () => {
    const cards = createSettlementEventCards();
    const ids = cards.map((card) => card.id);
    expect(new Set(ids).size).toBe(30);
  });

    it("does not draw an event card when capturing an Outpost", () => {
    const state = createCaptureTestState("outpost");

    const updatedState = captureSettlementWithEvent(
      state,
      "player-2",
      "settlement-1"
    );

    expect(updatedState.settlements[0].ownerId).toBe("player-2");
    expect(updatedState.activeSettlementEvent).toBeNull();
    expect(updatedState.settlementEventDeck).toHaveLength(30);
  });

  it("draws an event card when capturing a Village", () => {
    const state = createCaptureTestState("village");

    const updatedState = captureSettlementWithEvent(
      state,
      "player-2",
      "settlement-1"
    );

    expect(updatedState.settlements[0].ownerId).toBe("player-2");
    expect(updatedState.activeSettlementEvent).not.toBeNull();
    expect(updatedState.settlementEventDeck).toHaveLength(29);
  });

  it("draws an event card when capturing a Trading Post", () => {
    const state = createCaptureTestState("trading-post");

    const updatedState = captureSettlementWithEvent(
      state,
      "player-2",
      "settlement-1"
    );

    expect(updatedState.activeSettlementEvent).not.toBeNull();
    expect(updatedState.settlementEventDeck).toHaveLength(29);
  });

  it("draws an event card when capturing a Town", () => {
    const state = createCaptureTestState("town");

    const updatedState = captureSettlementWithEvent(
      state,
      "player-2",
      "settlement-1"
    );

    expect(updatedState.activeSettlementEvent).not.toBeNull();
    expect(updatedState.settlementEventDeck).toHaveLength(29);
});

  it("creates placeholder cards with names and descriptions", () => {
    const cards = createSettlementEventCards();
    expect(cards[0].name).toBe("Settlement Event 1");
    expect(cards[0].description).toBe("Effect to be designed.");
  });

  it("shuffles the cards without losing any cards", () => {
    const cards = createSettlementEventCards();
    const shuffled = shuffleSettlementEventCards(cards);

    expect(shuffled).toHaveLength(30);
    expect(shuffled.map((card) => card.id).sort()).toEqual(
      cards.map((card) => card.id).sort()
    );
  });

  it("does not modify the original deck when shuffling", () => {
    const cards = createSettlementEventCards();
    const originalOrder = cards.map((card) => card.id);

    shuffleSettlementEventCards(cards);

    expect(cards.map((card) => card.id)).toEqual(originalOrder);
  });

  it("returns a separate array when shuffling", () => {
    const cards = createSettlementEventCards();
    const shuffled = shuffleSettlementEventCards(cards);

    expect(shuffled).not.toBe(cards);
  });

  it("draws the top card and makes it active", () => {
    const state = createEmptyGameState(["A", "B", "C"]);
    state.settlementEventDeck = createSettlementEventCards();

    const updatedState = drawSettlementEventCard(state);

    expect(updatedState.activeSettlementEvent?.id).toBe(
      "settlement-event-1"
    );
    expect(updatedState.settlementEventDeck).toHaveLength(29);
  });

  it("does not draw another card while an event is active", () => {
    const state = createEmptyGameState(["A", "B", "C"]);
    state.settlementEventDeck = createSettlementEventCards();

    const firstDraw = drawSettlementEventCard(state);
    const secondDraw = drawSettlementEventCard(firstDraw);

    expect(secondDraw.activeSettlementEvent?.id).toBe(
      "settlement-event-1"
    );
    expect(secondDraw.settlementEventDeck).toHaveLength(29);
  });

  it("returns unchanged state when both piles are empty", () => {
    const state = createEmptyGameState(["A", "B", "C"]);
    state.settlementEventDeck = [];
    const updatedState = drawSettlementEventCard(state);

    expect(updatedState).toBe(state);
  });

  it("moves the active card into the discard pile when resolved", () => {
    const state = createEmptyGameState(["A", "B", "C"]);
    state.settlementEventDeck = createSettlementEventCards();

    const drawnState = drawSettlementEventCard(state);
    const resolvedState = resolveSettlementEventCard(drawnState);

    expect(resolvedState.activeSettlementEvent).toBeNull();
    expect(resolvedState.settlementEventDiscard).toHaveLength(1);
    expect(resolvedState.settlementEventDiscard[0].id).toBe(
      "settlement-event-1"
    );
  });

  it("does not change state when there is no active event to resolve", () => {
    const state = createEmptyGameState(["A", "B", "C"]);
    const updatedState = resolveSettlementEventCard(state);

    expect(updatedState).toBe(state);
  });

  it("reshuffles the discard pile when the draw deck is empty", () => {
    const state = createEmptyGameState(["A", "B", "C"]);
    const cards = createSettlementEventCards();

    state.settlementEventDeck = [];
    state.settlementEventDiscard = cards;

    const updatedState = drawSettlementEventCard(state);

    expect(updatedState.activeSettlementEvent).not.toBeNull();
    expect(updatedState.settlementEventDeck).toHaveLength(29);
    expect(updatedState.settlementEventDiscard).toHaveLength(0);
  });
});
