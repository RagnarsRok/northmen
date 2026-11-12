import type {
  GameState,
  VoyageEventCard,
  VoyageEventChoice,
  VoyageEventEffect,
} from "../../engine/types";

export function shuffleVoyageEventCards(cards: VoyageEventCard[], random: () => number = Math.random): VoyageEventCard[] {
  const shuffled = [...cards];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function drawVoyageEventCards(
  state: GameState,
  count: number,
  random: () => number = Math.random,
): { state: GameState; drawnCards: VoyageEventCard[] } {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("Voyage Event draw count must be a non-negative whole number.");
  }
  let deck = [...(state.voyageEventDeck ?? [])];
  let discard = [...(state.voyageEventDiscard ?? [])];
  const drawnCards: VoyageEventCard[] = [];

  while (drawnCards.length < count) {
    if (deck.length === 0) {
      if (discard.length === 0) break;
      deck = shuffleVoyageEventCards(discard, random);
      discard = [];
    }
    const card = deck.shift();
    if (card) drawnCards.push(card);
  }

  return {
    state: { ...state, voyageEventDeck: deck, voyageEventDiscard: discard },
    drawnCards,
  };
}

export function discardVoyageEventCards(state: GameState, cards: VoyageEventCard[]): GameState {
  const ids = new Set(cards.map((card) => card.id));
  if (ids.size !== cards.length) throw new Error("A Voyage Event card cannot be discarded twice.");
  return {
    ...state,
    voyageEventDiscard: [...(state.voyageEventDiscard ?? []), ...cards],
  };
}

export function resolveVoyageEventChoice(
  card: VoyageEventCard,
  choiceId?: string,
): VoyageEventEffect {
  if (card.choices?.length) {
    if (!choiceId) throw new Error(`Voyage Event '${card.name}' requires a player choice.`);
    const choice: VoyageEventChoice | undefined = card.choices.find((item) => item.id === choiceId);
    if (!choice) throw new Error(`Invalid choice for Voyage Event '${card.name}'.`);
    return choice.effect;
  }
  if (choiceId) throw new Error(`Voyage Event '${card.name}' does not offer a choice.`);
  if (card.effect) return card.effect;
  return { type: "surcharge-adjustment", amount: card.surchargeAdjustment ?? 0 };
}
