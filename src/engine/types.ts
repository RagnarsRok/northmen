
export type PlayerId = string;
export type RegionId = string;
export type TerritoryId = string;
export type ArmyId = string;
export type LongboatId = string;
export type VoyageEventCardId = string;

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
  /** Present while this army is aboard a longboat. */
  longboatId?: LongboatId;
}

// A clan-owned ship used to transport warriors.
export type LongboatLocation = "at-port" | "anchored" | "at-sea";

export interface Longboat {
  id: LongboatId;
  /** Undefined means the vessel is neutral or abandoned. */
  ownerId?: PlayerId;
  /** Current coastal territory; also identifies the anchorage. */
  territoryId: TerritoryId;
  /** at-sea is transient and must never persist at turn end. */
  location: LongboatLocation;
  /** Original construction port; retained after capture. */
  homePortId?: PortId;
  /** Current port, only when location is at-port. */
  portId?: PortId;
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



export type VoyageEventCategory =
  | "favorable-conditions"
  | "dangerous-weather"
  | "discovery"
  | "encounter"
  | "tragedy"
  | "legendary";

export type VoyageEventEffect =
  | { type: "surcharge-adjustment"; amount: number }
  | { type: "shipwreck" }
  | { type: "divert"; destinationTerritoryId: TerritoryId }
  | { type: "strand"; destinationTerritoryId: TerritoryId }
  | { type: "resource-gain"; resource: ResourceType; amount: number }
  | { type: "no-effect" };

export interface VoyageEventChoice {
  id: string;
  label: string;
  effect: VoyageEventEffect;
}

export interface VoyageEventCard {
  id: VoyageEventCardId;
  name: string;
  description: string;
  category: VoyageEventCategory;
  /** Event adjustment is limited to -5 through +5 Provisions. */
  surchargeAdjustment?: number;
  effect?: VoyageEventEffect;
  choices?: VoyageEventChoice[];
}

export interface PendingOceanVoyage {
  playerId: PlayerId;
  longboatId: LongboatId;
  originTerritoryId: TerritoryId;
  destinationTerritoryId: TerritoryId;
  normalArmyProvisionsCost: number;
  baseSurcharges: number[];
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
  voyageEventDeck?: VoyageEventCard[];
  voyageEventDiscard?: VoyageEventCard[];
  pendingOceanVoyage?: PendingOceanVoyage | null;
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
