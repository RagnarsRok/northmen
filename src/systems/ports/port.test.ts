
import { describe, expect, it } from "vitest";
import {
  createEmptyGameState,
} from "../../engine/initialState";
import type {
  GameState,
  PortId,
} from "../../engine/types";
import {
  PORT_CONSTRUCTION_COST,
  canConstructPort,
  constructPort,
  capturePort,
} from "./port";

function createPortTestState(): GameState {
  const state = createEmptyGameState([
    "Ragnar",
    "Player 2",
    "Player 3",
  ]);

  return {
    ...state,
    regions: [
      {
        id: "region-1",
        name: "Test Region",
        territoryIds: ["territory-1"],
        storage: {
          "player-1": {
            timber: 10,
            iron: 10,
            provisions: 10,
            fish: 10,
            silver: 10,
          },
        },
      },
    ],
    territories: [
      {
        id: "territory-1",
        name: "Coastal Territory",
        regionId: "region-1",
        terrain: "coastal",
        primaryResource: "timber",
        secondaryResource: "iron",
        connections: [],
        ownerId: "player-1",
      },
    ],
    armies: [
      {
        id: "army-1",
        ownerId: "player-1",
        territoryId: "territory-1",
        warriorCount: 2,
      },
    ],
    ports: [],
  };
}

describe("Port construction", () => {
  it("uses the approved construction cost", () => {
    expect(PORT_CONSTRUCTION_COST).toEqual({
      timber: 2,
      iron: 1,
      provisions: 1,
      fish: 0,
      silver: 0,
    });
  });

  it("allows construction in an eligible coastal territory", () => {
    const state = createPortTestState();

    expect(
      canConstructPort(state, "player-1", "territory-1")
    ).toBe(true);
  });

  it("rejects construction in a non-coastal territory", () => {
    const state = createPortTestState();

    state.territories[0].terrain = "forest";

    expect(
      canConstructPort(state, "player-1", "territory-1")
    ).toBe(false);
  });

  it("rejects construction in territory owned by another player", () => {
    const state = createPortTestState();

    state.territories[0].ownerId = "player-2";

    expect(
      canConstructPort(state, "player-1", "territory-1")
    ).toBe(false);
  });

  it("rejects construction without a stationed friendly warrior", () => {
    const state = createPortTestState();

    state.armies = [];

    expect(
      canConstructPort(state, "player-1", "territory-1")
    ).toBe(false);
  });

  it("rejects a second port in the same territory", () => {
    const state = createPortTestState();

    state.ports = [
      {
        id: "existing-port",
        ownerId: "player-1",
        territoryId: "territory-1",
      },
    ];

    expect(
      canConstructPort(state, "player-1", "territory-1")
    ).toBe(false);
  });

  it("rejects construction when resources are insufficient", () => {
    const state = createPortTestState();

    state.regions[0].storage["player-1"].iron = 0;

    expect(
      canConstructPort(state, "player-1", "territory-1")
    ).toBe(false);
  });

  it("constructs a port and deducts the correct resources", () => {
    const state = createPortTestState();

    const result = constructPort(
      state,
      "player-1",
      "territory-1",
      "port-1" as PortId
    );

    expect(result.ports).toHaveLength(1);
    expect(result.ports[0]).toEqual({
      id: "port-1",
      ownerId: "player-1",
      territoryId: "territory-1",
    });

    const inventory =
      result.regions[0].storage["player-1"];

    expect(inventory.timber).toBe(8);
    expect(inventory.iron).toBe(9);
    expect(inventory.provisions).toBe(9);
    expect(inventory.fish).toBe(10);
    expect(inventory.silver).toBe(10);
  });

  it("does not construct a port with an existing port ID", () => {
    const state = createPortTestState();

    state.ports = [
      {
        id: "port-1",
        ownerId: "player-2",
        territoryId: "another-territory",
      },
    ];

    const result = constructPort(
      state,
      "player-1",
      "territory-1",
      "port-1" as PortId
    );

    expect(result).toBe(state);
  });

  it("does not modify the original state", () => {
    const state = createPortTestState();

    const originalTimber =
      state.regions[0].storage["player-1"].timber;

    const result = constructPort(
      state,
      "player-1",
      "territory-1",
      "port-1" as PortId
    );

    expect(result).not.toBe(state);
    expect(state.ports).toHaveLength(0);
    expect(
      state.regions[0].storage["player-1"].timber
    ).toBe(originalTimber);
  });
});

describe("Port capture", () => {
  it("transfers ownership without changing territory ownership", () => {
    const state = createPortTestState();

    state.ports = [
      {
        id: "port-1",
        ownerId: "player-1",
        territoryId: "territory-1",
      },
    ];

    const result = capturePort(
      state,
      "player-2",
      "port-1" as PortId
    );

    expect(result.ports[0].ownerId).toBe("player-2");
    expect(result.territories[0].ownerId).toBe("player-1");
  });

  it("does not change ownership of a settlement in the territory", () => {
    const state = createPortTestState();

    state.ports = [
      {
        id: "port-1",
        ownerId: "player-1",
        territoryId: "territory-1",
      },
    ];

    state.settlements = [
      {
        id: "settlement-1",
        ownerId: "player-1",
        territoryId: "territory-1",
        level: "town",
        isMainSettlement: true,
      },
    ];

    const result = capturePort(
      state,
      "player-2",
      "port-1" as PortId
    );

    expect(result.ports[0].ownerId).toBe("player-2");
    expect(result.settlements[0].ownerId).toBe("player-1");
  });

  it("does not modify the original state", () => {
    const state = createPortTestState();

    state.ports = [
      {
        id: "port-1",
        ownerId: "player-1",
        territoryId: "territory-1",
      },
    ];

    const result = capturePort(
      state,
      "player-2",
      "port-1" as PortId
    );

    expect(result).not.toBe(state);
    expect(state.ports[0].ownerId).toBe("player-1");
  });

  it("returns the original state if the port does not exist", () => {
    const state = createPortTestState();

    const result = capturePort(
      state,
      "player-2",
      "missing-port" as PortId
    );

    expect(result).toBe(state);
  });

  it("returns the original state if the owner is unchanged", () => {
    const state = createPortTestState();

    state.ports = [
      {
        id: "port-1",
        ownerId: "player-1",
        territoryId: "territory-1",
      },
    ];

    const result = capturePort(
      state,
      "player-1",
      "port-1" as PortId
    );

    expect(result).toBe(state);
  });
});
