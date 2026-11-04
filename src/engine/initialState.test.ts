import { describe, expect, it } from "vitest";
import { createEmptyGameState } from "./initialState";
describe("createEmptyGameState", () => {
  it("creates a 3-player state", () => { const s=createEmptyGameState(["A","B","C"]); expect(s.players).toHaveLength(3); expect(s.round).toBe(1); expect(s.players[0].resources.provisions).toBe(3); });
  it("allows five players", () => { expect(createEmptyGameState(["A","B","C","D","E"]).players).toHaveLength(5); });
  it("rejects fewer than three players", () => { expect(()=>createEmptyGameState(["A","B"])).toThrow("3 to 5 players"); });
  it("rejects more than five players", () => { expect(()=>createEmptyGameState(["A","B","C","D","E","F"])).toThrow("3 to 5 players"); });
  it("does not share inventory objects", () => { const s=createEmptyGameState(["A","B","C"]); s.players[0].resources.timber=99; expect(s.players[1].resources.timber).toBe(2); });
});
