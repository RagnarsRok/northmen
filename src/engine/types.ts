
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

export type BonusCardId = string;
export type ObjectiveCardId = string;

export interface Player {
  id: PlayerId;
  name: string;
  clanName: string;
  color: string;

  religion: ReligionStatus;
  victoryPoints: number;

  bonusCardIds: BonusCardId[];
  objectiveCardIds: ObjectiveCardId[];
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


// The central state of the entire game.
export interface GameState {
  version: 1;
  round: number;
  activePlayerIndex: number;
  players: Player[];
  regions: Region[];
  territories: Territory[];
  armies: Army[];
  longboats: Longboat[];
}
