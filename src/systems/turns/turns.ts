
import type { GameState, ActionCard } from "../../engine/types";
import {
  drawActionCards,
  discardActionCards,
} from "../cards/actionCards";

export const ACTIONS_PER_TURN = 4;
export const MAX_ACTION_CARDS = 7;

/**
 * Starts the active player's turn with four actions.
 */
export function startPlayerTurn(state: GameState): GameState {
  if (state.players.length < 3 || state.players.length > 5) {
    throw new Error("NORTHMEN supports 3 to 5 players.");
  }

  return {
    ...state,
    remainingActions: ACTIONS_PER_TURN,
  };
}

/**
 * Completes one action and draws one Action Card.
 * This applies to both successful and failed actions.
 */
export function completeAction(
  state: GameState,
): GameState {
  if (state.remainingActions <= 0) {
    throw new Error("No actions remaining this turn.");
  }

  const player = state.players[state.activePlayerIndex];

  if (!player) {
    throw new Error("Active player does not exist.");
  }

  const actionResult = drawActionCards(state, 1);
  const updatedPlayer = actionResult.state.players[
    state.activePlayerIndex
  ];

  const updatedHand = [
    ...updatedPlayer.actionCardIds,
    ...actionResult.drawnCards.map((card) => card.id),
  ];

  return {
    ...actionResult.state,
    players: actionResult.state.players.map((item, index) =>
      index === state.activePlayerIndex
        ? { ...item, actionCardIds: updatedHand }
        : item,
    ),
    remainingActions: state.remainingActions - 1,
  };
}

/**
 * Discards selected Action Cards from the active player's hand.
 * If a hand-limit discard is pending, exactly the required number
 * of cards must be discarded before the selection is cleared.
 */
export function discardPlayerActionCards(
  state: GameState,
  cards: ActionCard[],
): GameState {
  const player = state.players[state.activePlayerIndex];

  if (!player) {
    throw new Error("Active player does not exist.");
  }

  const handIds = new Set(player.actionCardIds);
  const selectedIds = new Set(cards.map((card) => card.id));

  if (selectedIds.size !== cards.length) {
    throw new Error("The same card cannot be discarded twice.");
  }

  if (cards.some((card) => !handIds.has(card.id))) {
    throw new Error("A selected card is not in the active player's hand.");
  }

  const pending = state.pendingActionCardSelection;

  if (pending) {
    if (pending.playerId !== player.id) {
      throw new Error("The pending discard belongs to another player.");
    }

    if (cards.length !== pending.discardCount) {
      throw new Error(
        `You must discard exactly ${pending.discardCount} Action Card(s).`,
      );
    }
  }

  const result = discardActionCards(state, cards);

  return {
    ...result,
    pendingActionCardSelection: pending ? null : result.pendingActionCardSelection,
  };
}

/**
 * Ends the active player's turn, checks the Action Card hand limit,
 * resets recruitment capacity, and advances to the next player.
 *
 * The starting player rotates by one position each round.
 */
export function endPlayerTurn(state: GameState): GameState {
  if (state.remainingActions !== 0) {
    throw new Error("The player must use all four actions before ending the turn.");
  }

  const playerCount = state.players.length;

  if (playerCount < 3 || playerCount > 5) {
    throw new Error("NORTHMEN supports 3 to 5 players.");
  }

  const currentPlayer = state.players[state.activePlayerIndex];

  if (!currentPlayer) {
    throw new Error("Active player does not exist.");
  }

  // Check whether the player exceeds the seven-card hand limit.
  const excessCards = currentPlayer.actionCardIds.length - MAX_ACTION_CARDS;

  if (excessCards > 0) {
    return {
      ...state,
      pendingActionCardSelection: {
        playerId: currentPlayer.id,
        discardCount: excessCards,
      },
    };
  }

  const currentStartingPlayer = (state.round - 1) % playerCount;

  const currentTurnPosition =
    (state.activePlayerIndex - currentStartingPlayer + playerCount)
    % playerCount;

  const updatedRecruitmentUsed = {
    ...state.recruitmentUsed,
  };

  state.settlements
    .filter((settlement) => settlement.ownerId === currentPlayer.id)
    .forEach((settlement) => {
      updatedRecruitmentUsed[settlement.id] = 0;
    });

  const isLastPlayerInRound = currentTurnPosition === playerCount - 1;

  if (isLastPlayerInRound) {
    return {
      ...state,
      round: state.round + 1,
      activePlayerIndex: (currentStartingPlayer + 1) % playerCount,
      remainingActions: ACTIONS_PER_TURN,
      recruitmentUsed: updatedRecruitmentUsed,
      pendingActionCardSelection: null,
    };
  }

  return {
    ...state,
    activePlayerIndex: (state.activePlayerIndex + 1) % playerCount,
    remainingActions: ACTIONS_PER_TURN,
    recruitmentUsed: updatedRecruitmentUsed,
    pendingActionCardSelection: null,
  };
}