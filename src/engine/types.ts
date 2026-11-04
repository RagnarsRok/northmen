export type PlayerId = string;
export type RegionId = string;
export type ResourceType = "timber" | "iron" | "provisions" | "fish" | "silver";
export type ResourceInventory = Record<ResourceType, number>;
export interface Player { id: PlayerId; name: string; clanName: string; color: string; resources: ResourceInventory; }
export interface Region { id: RegionId; name: string; isCoastal: boolean; landNeighbours: RegionId[]; primaryResource: ResourceType; secondaryResource?: ResourceType; ownerId?: PlayerId; portLevel: 0 | 1 | 2 | 3; }
export interface GameState { version: 1; round: number; activePlayerIndex: number; players: Player[]; regions: Region[]; }
