import type { GameState, SettlementEventCard } from "../../engine/types";
import { captureSettlement } from "./settlements";

/**
 * Creates the 30 Settlement Event Cards.
 *
 * These are placeholders for now. Actual card names,
 * descriptions and effects will be designed later.
 */
export function createSettlementEventCards(): SettlementEventCard[] {
  return Array.from({ length: 30 }, (_, index) => {
    const cardNumber = index + 1;

    return {
      id: `settlement-event-${cardNumber}`,
      name: `Settlement Event ${cardNumber}`,
      description: "Effect to be designed.",
    };
  });
}

/**
 * Returns a shuffled copy of a Settlement Event Card deck.
 * The original deck remains unchanged.
 */
export function shuffleSettlementEventCards(
  cards: SettlementEventCard[]
): SettlementEventCard[] {
  const shuffled = [...cards];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Draws the next Settlement Event Card.
 *
 * If the draw deck is empty, the discard pile is shuffled
 * and reused as the new draw deck.
 */
export function drawSettlementEventCard(
  state: GameState
): GameState {
  // Do not draw another card while an event is active.
  if (state.activeSettlementEvent !== null) {
    return state;
  }

  let deck = [...state.settlementEventDeck];
  let discard = [...state.settlementEventDiscard];

  // Reshuffle the discard pile if the draw deck is empty.
  if (deck.length === 0) {
    if (discard.length === 0) {
      return state;
    }

    deck = shuffleSettlementEventCards(discard);
    discard = [];
  }

  const [drawnCard, ...remainingDeck] = deck;

  return {
    ...state,
    settlementEventDeck: remainingDeck,
    settlementEventDiscard: discard,
    activeSettlementEvent: drawnCard,
  };
}

/**
 * Moves the active Settlement Event Card to the discard pile.
 */
export function resolveSettlementEventCard(
  state: GameState
): GameState {
  if (state.activeSettlementEvent === null) {
    return state;
  }

  return {
    ...state,
    settlementEventDeck: [...state.settlementEventDeck],
    settlementEventDiscard: [
      ...state.settlementEventDiscard,
      state.activeSettlementEvent,
    ],
    activeSettlementEvent: null,
  };
}

/**
 * Captures a settlement and draws a Settlement Event Card
 * if the captured settlement is a Village, Trading Post or Town.
 */
export function captureSettlementWithEvent(
  state: GameState,
  newOwnerId: string,
  settlementId: string,
  replacementMainSettlementId?: string
): GameState {
  const settlement = state.settlements.find(
    (item) => item.id === settlementId
  );

  // No event if the settlement does not exist.
  if (!settlement) {
    return state;
  }

  const qualifiesForEvent = settlement.level !== "outpost";

  // Perform the actual capture.
  const capturedState = captureSettlement(
    state,
    newOwnerId,
    settlementId,
    replacementMainSettlementId
  );

  // Check that ownership actually changed.
  const capturedSettlement = capturedState.settlements.find(
    (item) => item.id === settlementId
  );

  if (
    !capturedSettlement ||
    capturedSettlement.ownerId !== newOwnerId ||
    capturedState === state
  ) {
    return state;
  }

  // Outpost captures do not trigger Settlement Event Cards.
  if (!qualifiesForEvent) {
    return capturedState;
  }

  // Draw one card for qualifying settlement captures.
  return drawSettlementEventCard(capturedState);
}
