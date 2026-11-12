# NORTHMEN — Development Roadmap

## Current status — 12 November 2026
- Turn and Action Card management milestone was previously secured.
- Longboat/maritime foundation is now implemented in the domain layer: construction, crew loading/unloading, coastal movement, open-ocean voyage staging, surcharge calculations, Voyage Event deck operations/choices, anchorage validation, capture and destruction.
- Full land movement, general combat resolution, coastal raids, map data and UI integration remain outstanding.
- Full Vitest suite and Vite production build still need to be run in the user's normal repository environment; the uploaded archive did not have a complete installable dependency tree in this environment.

## Goal

Build a complete but initially basic playable game, then expand to the full product. AI opponents, online multiplayer and asynchronous play remain product requirements. They should shape the architecture from the beginning, even if delivered in stages.

## Milestone 0 — Repository baseline
- Inspect current repository, branch and file structure.
- Install dependencies, run tests and production build.
- Record baseline behavior.
- Keep generated output and dependencies out of Git.

**Exit:** clean working tree, tests/build pass, baseline commit exists.

## Milestone 1 — Domain model and initial state
- Define identifiers and core types.
- Model clans, regions, territories and connections.
- Model resources, storage, warriors, armies, settlements, ports and longboats.
- Model cards, decks, events, alliances and trackers.
- Define round, phase, active player and action allowance.
- Create a small deterministic test map and initial 3–5 clan state.
- Test initial-state invariants.

**Exit:** complete initial state can be created and verified; types are independent of React.

## Milestone 2 — Turn and command engine
- Define command and result types.
- Validate active clan and actions remaining.
- Implement action consumption, end turn and round progression.
- Implement two-Outpost unlock and Round 8 four-action rule.
- Add chronological history and limited undo foundation.

**Exit:** tests can advance multiple rounds and verify turn/action rules.

## Milestone 3 — Map, ownership and control
- Define land and sea route graphs.
- Implement ownership and control.
- Implement one-turn occupation.
- Implement settlement-territory confrontation checks.
- Implement regional control, settlement requirement, majority and contested ties.
- Validate map data.

**Exit:** ownership/control transitions and edge cases are tested.

## Milestone 4 — Economy and development
- Primary production and secondary gathering.
- Port Fish production.
- Regional storage and transportation.
- Construction and settlement upgrades.
- Main settlement production bonus.
- Recruitment costs and capacities.
- Loss of regional storage when final settlement is lost.

**Exit:** production, costs, storage and recruitment are deterministic and tested.

## Milestone 5 — Movement, combat and maritime
- Provisions calculation and land movement.
- Passage permissions.
- Army splitting.
- Combat dice and settlement defense resolution implemented as a deterministic engine module; integration with army state remains.
- Terrain modifiers remain open and are not applied by the current combat resolver.
- Retreat, territorial capture and Settlement Event ownership integration remain to be implemented.
- Longboat transport/capacity (maritime foundation implemented; further integration/testing remains).
- Coastal and open-ocean routes (maritime foundation implemented; map integration remains).
- Voyage events (deck engine implemented; catalogue and balancing remain).
- Coastal raids and ship capture/destruction.

**Exit:** core military rules and representative edge cases have automated tests.

## Milestone 6 — Cards, events and diplomacy
- Bonus deck, hand limit and draw timing.
- Objectives and exclusivity.
- General, Settlement and Voyage Events.
- Event durations and precedence.
- Trade, gifts, alliances, departure, expulsion and betrayal.
- Neutrality and allied defensive support.

**Exit:** card timing, precedence, diplomacy and event effects are tested.

## Milestone 7 — Endgame and scoring
- Territory, settlement, port, wealth and objective scoring.
- Christian Influence Track and Christianisation.
- Crusade declaration, participation and contribution.
- Ragnarök stages, triggers and immediate ending.
- Final scoring and tie-breakers.

**Exit:** all three endgames can be triggered in controlled tests; Ragnarök correctly overrides other procedures.

## Milestone 8 — Complete playable interface
- Main map, clan dashboard and main settlement display.
- Resource/action indicators.
- Territory selection and information.
- Action menu and direct map interaction.
- Legal-action highlighting and explanations.
- Combat screen, cards/events and game history.
- Autosave and multiple save slots.

**Exit:** human can play a complete basic game through the interface.

## Milestone 9 — AI opponents
- AI uses the same command interface as humans.
- Implement legal action selection.
- Add strategic priorities for economy, expansion, defence and endgame paths.
- Add difficulty levels only after baseline behavior is reliable.

**Exit:** human can complete a game against AI.

## Milestone 10 — Online and asynchronous multiplayer
- Authoritative server-side game state.
- Player authentication and game membership.
- Server-side command validation.
- Public/private state views.
- Turn notifications and asynchronous turns.
- Reconnection and resume.
- Server-authoritative random outcomes.
- Save/history synchronization.

**Exit:** multiple remote players can complete a game while preserving hidden information and rule integrity.

## Milestone 11 — Desktop, polish and release
- Package shared application for desktop.
- Improve map artwork and visual presentation.
- Accessibility/usability review.
- Performance and save migration testing.
- Full balance testing, documentation and release process.

**Exit:** stable release candidate supports intended game modes and rules.

## Working method

For each milestone:
1. Agree exact scope.
2. Inspect relevant existing files.
3. Implement a small change.
4. Run tests and production build.
5. Review behavior.
6. Commit working change.
7. Update documentation when decisions or architecture change.

Do not guess unresolved rules. Use clearly labelled temporary test fixtures only when necessary; do not treat them as official balance data.
