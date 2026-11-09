
import { describe, expect, it } from "vitest";

import {
  recruitWarriors,
  RECRUITMENT_CAPACITY,
  RECRUITMENT_COST,
} from "./recruitment";

import { createEmptyGameState } from "../../engine/initialState";

function createRecruitmentTestState() {
    


  const state = createEmptyGameState([
    "Ragnar",
    "Player 2",
    "Player 3",
  ]);

  state.regions = [
    {
      id: "region-1",
      name: "Test Region",
      territoryIds: ["territory-1"],
      storage: {
        "player-1": {
          timber: 5,
          iron: 2,
          provisions: 10,
          fish: 0,
          silver: 10,
        },
        "player-2": {
          timber: 5,
          iron: 2,
          provisions: 10,
          fish: 0,
          silver: 10,
        },
        "player-3": {
          timber: 5,
          iron: 2,
          provisions: 10,
          fish: 0,
          silver: 10,
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
      level: "outpost",
      isMainSettlement: false,
    },
  ];

  return state;
}


describe("recruitWarriors", () => {
  it("recruits warriors and creates a new army", () => {
    const state = createRecruitmentTestState();

    const updatedState = recruitWarriors(
      state,
      "player-1",
      "settlement-1",
      1,
      "army-1"
    );

    expect(updatedState.armies).toHaveLength(1);
    expect(updatedState.armies[0]).toEqual({
      id: "army-1",
      ownerId: "player-1",
      territoryId: "territory-1",
      warriorCount: 1,
    });

    const inventory =
      updatedState.regions[0].storage["player-1"];

    expect(inventory.provisions).toBe(
      10 - RECRUITMENT_COST.provisions
    );
    expect(inventory.silver).toBe(
      10 - RECRUITMENT_COST.silver
    );
  });

  it("adds recruited warriors to an existing army", () => {
    const state = createRecruitmentTestState();

    state.armies = [
      {
        id: "army-existing",
        ownerId: "player-1",
        territoryId: "territory-1",
        warriorCount: 2,
      },
    ];

    const updatedState = recruitWarriors(
      state,
      "player-1",
      "settlement-1",
      1,
      "army-new"
    );

    expect(updatedState.armies).toHaveLength(1);
    expect(updatedState.armies[0].id).toBe("army-existing");
    expect(updatedState.armies[0].warriorCount).toBe(3);
  });

  it("does not allow recruitment beyond remaining capacity", () => {
    const state = createRecruitmentTestState();

    state.settlements[0].level = "trading-post";

    const firstRecruitment = recruitWarriors(
      state,
      "player-1",
      "settlement-1",
      RECRUITMENT_CAPACITY["trading-post"],
      "army-1"
    );

    const secondRecruitment = recruitWarriors(
      firstRecruitment,
      "player-1",
      "settlement-1",
      1,
      "army-2"
    );

    expect(firstRecruitment.armies[0].warriorCount).toBe(
      RECRUITMENT_CAPACITY["trading-post"]
    );
    expect(secondRecruitment).toBe(firstRecruitment);
  });
});