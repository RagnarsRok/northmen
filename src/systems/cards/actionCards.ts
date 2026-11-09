
import type { ActionCard, GameState } from "../../engine/types";

/**
 * Shuffles Action Cards using the Fisher-Yates algorithm.
 * Returns a new array without modifying the original.
 */
export function shuffleActionCards(
  cards: ActionCard[],
  random: () => number = Math.random
): ActionCard[] {
  const shuffled = [...cards];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Creates a shuffled Action Card deck.
 */
export function createActionCardDeck(
  cards: ActionCard[],
  random: () => number = Math.random
): ActionCard[] {
  return shuffleActionCards(cards, random);
}

/**
 * Draws a specified number of Action Cards.
 *
 * If the draw deck becomes empty, the discard pile is shuffled
 * and reused automatically.
 *
 * Returns the updated game state and the cards drawn.
 */
export function drawActionCards(
  state: GameState,
  count: number,
  random: () => number = Math.random
): {
  state: GameState;
  drawnCards: ActionCard[];
} {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("Card draw count must be a non-negative integer.");
  }

  let deck = [...state.actionDeck];
  let discard = [...state.actionDiscard];
  const drawnCards: ActionCard[] = [];

  for (let i = 0; i < count; i++) {
    if (deck.length === 0) {
      if (discard.length === 0) {
        break;
      }

      deck = shuffleActionCards(discard, random);
      discard = [];
    }

    const card = deck.shift();

    if (card) {
      drawnCards.push(card);
    }
  }

  return {
    state: {
      ...state,
      actionDeck: deck,
      actionDiscard: discard,
    },
    drawnCards,
  };
}

/**
 * Moves specified Action Cards into the public discard pile.
 */
export function discardActionCards(
  state: GameState,
  cards: ActionCard[]
): GameState {
  if (cards.length === 0) {
    return state;
  }

  const cardIds = new Set(cards.map((card) => card.id));

  return {
    ...state,
    actionDiscard: [
      ...state.actionDiscard,
      ...cards,
    ],
    players: state.players.map((player) => ({
      ...player,
      actionCardIds: player.actionCardIds.filter(
        (id) => !cardIds.has(id)
      ),
    })),
  };
}
