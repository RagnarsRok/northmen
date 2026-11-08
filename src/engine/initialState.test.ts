
import { describe, expect, it } from "vitest";
import { createEmptyGameState } from "./initialState";

describe("createEmptyGameState", () => {
  it("creates a 3-player state", () => {
    const state = createEmptyGameState(["A", "B", "C"]);

    expect(state.players).toHaveLength(3);
    expect(state.round).toBe(1);
    expect(state.players[0].religion).toBe("pagan");
    expect(state.players[0].victoryPoints).toBe(0);
  });

  it("allows five players", () => {
    const state = createEmptyGameState(["A", "B", "C", "D", "E"]);
    expect(state.players).toHaveLength(5);
  });

  it("rejects fewer than three players", () => {
    expect(() => createEmptyGameState(["A", "B"])).toThrow("3 to 5 players");
  });

  it("rejects more than five players", () => {
    expect(() =>
      createEmptyGameState(["A", "B", "C", "D", "E", "F"])
    ).toThrow("3 to 5 players");
  });

  it("initializes cards as empty collections", () => {
    const state = createEmptyGameState(["A", "B", "C"]);

    expect(state.players[0].bonusCardIds).toEqual([]);
    expect(state.players[0].objectiveCardIds).toEqual([]);
  });

  it("creates independent card collections for each player", () => {
    const state = createEmptyGameState(["A", "B", "C"]);

    state.players[0].bonusCardIds.push("bonus-1");

    expect(state.players[1].bonusCardIds).toEqual([]);
  });

it("creates empty geographical, military and settlement collections", () => {
  const state = createEmptyGameState(["A", "B", "C"]);

  expect(state.regions).toEqual([]);
  expect(state.territories).toEqual([]);
  expect(state.armies).toEqual([]);
  expect(state.longboats).toEqual([]);
  expect(state.settlements).toEqual([]);
  expect(state.ports).toEqual([]);
});
it("initializes the Settlement Event Card deck and discard pile as empty", () => {
  const state = createEmptyGameState(["A", "B", "C"]);

  expect(state.settlementEventDeck).toEqual([]);
  expect(state.settlementEventDiscard).toEqual([]);
});

it("initializes with no active Settlement Event Card", () => {
  const state = createEmptyGameState(["A", "B", "C"]);

  expect(state.activeSettlementEvent).toBeNull();
});

});
