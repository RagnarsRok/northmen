
export type PlayerId = string;
export type RegionId = string;
export type TerritoryId = string;
export type ArmyId = string;
export type LongboatId = string;

export type ResourceType =
  | "timber"
  | "iron"
  | "provisions"
  | "fish"
  | "silver";

export type ResourceInventory = Record<ResourceType, number>;

// The seven terrain types in NORTHMEN.
export type TerrainType =
  | "forest"
  | "mountains"
  | "farmland"
  | "coastal"
  | "marshland"
  | "open-plains"
  | "arctic-tundra";

// Types of routes connecting playable territories.
export type ConnectionType =
  | "land"
  | "coastal"
  | "open-ocean";

export interface TerritoryConnection {
  territoryId: TerritoryId;
  type: ConnectionType;
}

export type ReligionStatus = "pagan" | "christian";

export type ActionCardId = string;
export type ObjectiveCardId = string;
export type SettlementEventCardId = string;

// A card drawn when a qualifying settlement is captured.
export interface SettlementEventCard {
  id: SettlementEventCardId;
  name: string;
  description: string;
}

export interface Player {
  id: PlayerId;
  name: string;
  clanName: string;
  color: string;

  religion: ReligionStatus;
  victoryPoints: number;

  actionCardIds: ActionCardId[];
  objectiveCardIds: ObjectiveCardId[];
}

// An Action Card that can be held and played by a clan.
export interface ActionCard {
  id: ActionCardId;
  name: string;
  description: string;
}

// Tracks a player who must discard Action Cards at the end of their turn.
export interface PendingActionCardSelection {
  playerId: PlayerId;
  discardCount: number;
}

// A large geographical area containing multiple territories.
export interface Region {
  id: RegionId;
  name: string;
  territoryIds: TerritoryId[];
  storage: Record<PlayerId, ResourceInventory>;
}

// An individual playable area on the game map.
export interface Territory {
  id: TerritoryId;
  name: string;
  regionId: RegionId;
  terrain: TerrainType;
  primaryResource: ResourceType;
  secondaryResource: ResourceType;
  connections: TerritoryConnection[];
  ownerId?: PlayerId;
}
// A clan's warriors grouped together in one territory.
export interface Army {
  id: ArmyId;
  ownerId: PlayerId;
  territoryId: TerritoryId;
  warriorCount: number;
}

// A clan-owned ship used to transport warriors.
export interface Longboat {
  id: LongboatId;
  ownerId: PlayerId;
  territoryId: TerritoryId;
  location: "at-port" | "at-sea";
}

// Development levels for settlements.
export type SettlementLevel =
  | "outpost"
  | "village"
  | "trading-post"
  | "town";

export type SettlementId = string;
export type PortId = string;

// A clan-owned settlement located in a territory.
export interface Settlement {
  id: SettlementId;
  ownerId: PlayerId;
  territoryId: TerritoryId;
  level: SettlementLevel;
  isMainSettlement: boolean;
}

// A port is independently owned and located in a territory.
export interface Port {
  id: PortId;
  ownerId: PlayerId;
  territoryId: TerritoryId;
}


// The central state of the entire game.
export interface GameState {
  version: 1;
  round: number;
  activePlayerIndex: number;
  remainingActions: number;
  players: Player[];
  regions: Region[];
  territories: Territory[];
  armies: Army[];
  longboats: Longboat[];
  settlements: Settlement[];
  recruitmentUsed: Record<SettlementId, number>;
  ports: Port[];
  actionDeck: ActionCard[];
  actionDiscard: ActionCard[];
  pendingActionCardSelection: PendingActionCardSelection | null;
  settlementEventDeck: SettlementEventCard[];
  settlementEventDiscard: SettlementEventCard[];
  activeSettlementEvent: SettlementEventCard | null;
}
