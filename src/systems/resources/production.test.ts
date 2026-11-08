
import { describe, expect, it } from "vitest";
import type { GameState } from "../../engine/types";
import { createEmptyGameState } from "../../engine/initialState";
import {
  calculatePrimaryProduction,
  calculateSecondaryProduction,
  calculatePortProduction,
} from "./production";

const testState: GameState = {
  ...createEmptyGameState(["Ragnar", "Player 2", "Player 3"]),
  territories: [
    {
      id: "t1",
      name: "Norway",
      regionId: "r1",
      terrain: "forest",
      primaryResource: "timber",
      secondaryResource: "iron",
      connections: [],
      ownerId: "player-1",
    },
    {
      id: "t2",
      name: "Denmark",
      regionId: "r1",
      terrain: "farmland",
      primaryResource: "provisions",
      secondaryResource: "fish",
      connections: [],
      ownerId: "player-2",
    },
    {
      id: "t3",
      name: "Iceland",
      regionId: "r2",
      terrain: "arctic-tundra",
      primaryResource: "silver",
      secondaryResource: "timber",
      connections: [],
    },
  ],
  ports: [
    {
      id: "port-1",
      ownerId: "player-1",
      territoryId: "t1",
    },
    {
      id: "port-2",
      ownerId: "player-2",
      territoryId: "t2",
    },
  ],
};

describe("resource production", () => {
  it("calculates primary production for owned territories", () => {
    const results = calculatePrimaryProduction(testState);

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      playerId: "player-1",
      resource: "timber",
      amount: 1,
      source: "primary",
    });
  });

  it("does not produce territorial Silver", () => {
    const results = calculatePrimaryProduction(testState);

    expect(results.some((result) => result.resource === "silver"))
      .toBe(false);
  });

  it("only gathers secondary resources from owned territories", () => {
    const results = calculateSecondaryProduction(
      testState,
      "player-1",
      ["t1", "t2"]
    );

    expect(results).toHaveLength(1);
    expect(results[0].resource).toBe("iron");
    expect(results[0].playerId).toBe("player-1");
  });

  it("produces one Fish per owned port", () => {
    const results = calculatePortProduction(testState);

    expect(results).toHaveLength(2);
    expect(results.every((result) => result.resource === "fish")).toBe(true);
    expect(results.every((result) => result.amount === 1)).toBe(true);
  });
});
