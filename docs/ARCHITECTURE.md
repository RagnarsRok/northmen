# NORTHMEN — Software Architecture

## 1. Purpose

The game engine owns the rules and canonical game state. The interface displays state and submits commands. The same engine should support human players, AI, automated tests and online multiplayer.

## 2. Existing technology foundation

The starter project uses TypeScript, React and Vite. Preserve the existing repository and inspect its actual structure before moving files or adding dependencies.

## 3. Logical layers

### Domain model
Define game concepts independently of React/browser code:
- Game, round, turn and phase.
- Clan/player.
- Region, territory and route connection.
- Resource and regional storage.
- Warrior, army and settlement.
- Port and longboat.
- Card, deck and event.
- Alliance, war and relationship.
- Objective, VP and endgame tracker.

### Canonical game state
A serializable representation of:
- Current round, active clan and action allowance.
- Every clan's assets and resources.
- Territory ownership/control.
- Settlement, port and ship state.
- Alliances and wars.
- Deck order, discard piles and hands.
- Active events and durations.
- Hidden information and random generator state.
- Scoring and endgame trackers.
- History metadata.

Hidden information exists in authoritative state even when excluded from a player's view.

### Commands
Player intent is represented as commands, for example:
`GatherResources`, `TransportResources`, `BuildOutpost`, `UpgradeSettlement`, `BuildPort`, `BuildLongboat`, `RecruitWarriors`, `MoveArmy`, `SplitArmy`, `AttackTerritory`, `ConductRaid`, `TradeResources`, `GiveGift`, `ProposeAlliance`, `LeaveAlliance`, `PlayBonusCard`, `ExploreTerritory`, `EndTurn`.

These are conceptual names; final TypeScript payloads are defined during implementation.

### Rules engine
For every command:
1. Validate game phase and acting clan.
2. Validate ownership, access, action allowance, resources and prerequisites.
3. Resolve random outcomes through an injected random source.
4. Produce state changes and structured history events.
5. Return success or a structured rejection explaining why.

The UI is not trusted to enforce rules. Resolution should be deterministic for the same state, command and random outcomes.

### Systems
Keep focused systems for turns, map/routes, resources, construction, recruitment, movement, combat, maritime/raids, diplomacy, cards/events, scoring/endgame, history and persistence.

### User interface
React components render the map, panels, cards, combat and history; collect input; submit commands; and display engine results. UI components must not duplicate game rules.

## 4. History and undo

Every successful state-changing command produces updated state and structured history events. Undo is limited to the most recent action if no other player has acted since. Prefer reversible state transitions or snapshots/checkpoints over improvised inverse operations.

## 5. Randomness

Normal play uses automatic dice rolls and card/event draws. Inject randomness into the engine to support reproducible tests, exact save/load continuation and server-authoritative online outcomes. Do not expose secret deck order or hidden random state to clients. Manual result entry, if implemented, is developer/test-only.

## 6. Multiplayer and security

Long-term model:
- Server/trusted process owns canonical game state.
- Clients send commands, not arbitrary state mutations.
- Server validates commands and returns public/private views.
- Each player receives only information they may see.
- Hidden deck order and random state remain server-side.
- Commands should include game/player identity and expected state version to prevent stale or duplicate actions.

A local browser prototype is acceptable, but avoid UI-only state that cannot later become server-authoritative.

## 7. Persistence

Save:
- Complete canonical game state.
- Hidden information.
- Deck order and discard piles.
- Random generator state or equivalent reproducibility data.
- History.
- Save schema version.

Autosave after each completed action. Support multiple independent saves. Version save formats and plan migrations.

## 8. Testing

**Unit tests:** resource costs, production, legal movement, combat comparisons, settlement defence, regional control and scoring.

**System tests:** settlement capture and event draw; settlement/port transfer; loss of regional storage; elimination and neutral assets; Christianisation final round; Crusade contribution; Ragnarök overriding another endgame.

**Integration tests:** complete games through the interface with multiple clans and edge cases.

Developer test mode should allow controlled setup of territories, armies, resources, cards and trackers.

## 9. Suggested organization

Adapt to the actual starter project rather than moving files unnecessarily.

```text
src/
  app/
  engine/
    state/
    commands/
    validation/
    history/
    random/
    systems/
      turns/
      map/
      resources/
      construction/
      recruitment/
      movement/
      combat/
      maritime/
      diplomacy/
      cards/
      events/
      scoring/
      endgame/
    ai/
  data/
    map/
    cards/
    objectives/
    events/
    balance/
  components/
    map/
    panels/
    cards/
    combat/
    dialogs/
  services/
    persistence/
    multiplayer/
  styles/
  test/
```

This is a target organization, not a requirement to create every folder immediately.

## 10. Architecture rules to preserve

- Engine independent of UI.
- Commands validated by engine.
- Canonical game state authoritative.
- Randomness injectable and reproducible.
- Structured history.
- Versioned saves.
- Per-player information filtering.
- AI uses the same command interface as humans.
- Online clients cannot directly mutate game state.


## Maritime and longboat system (implementation foundation)
- `systems/longboats/longboats.ts` owns construction, loading/unloading, boarding capture, combat-victory capture, port-occupation capture, neutralization and destruction.
- `systems/maritime/maritimeMovement.ts` owns coastal route traversal, open-ocean pre-departure validation, normal-cost payment before event reveal, and surcharge/event resolution after reveal.
- `systems/maritime/voyageCosts.ts` owns maximum-reserve and actual surcharge calculations.
- `systems/maritime/voyageEvents.ts` owns Voyage Event deck operations and player-choice validation.
- Longboat location is represented as docked at a port, anchored at a coastal territory, or transiently at sea. Turn-end validation rejects a longboat left at sea.
- Army-to-vessel association is stored on `Army.longboatId`; the longboat remains the authoritative location for the embarked army and movement updates both territory references.
- Base ocean surcharges and the card catalogue are data-driven/provisional.
- Movement functions do not consume the turn action themselves; the action-command layer must call the existing `completeAction` after resolving a successful or failed action, consistent with the existing turn architecture.
