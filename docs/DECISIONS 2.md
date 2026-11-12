# NORTHMEN — Decision Register

## Status labels
- **Confirmed:** explicitly agreed.
- **Provisional:** direction agreed, numerical values/details remain subject to testing.
- **Open:** not decided.
- **Recommendation:** proposed, not approved.

## Confirmed decisions
| ID | Decision | Status |
|---|---|---|
| D-001 | 3–5 players; one player controls one clan | Confirmed |
| D-002 | Maximum normal game length: 15 rounds | Confirmed |
| D-003 | 2 actions initially; 2 Outposts unlock 4 actions from next turn | Confirmed |
| D-004 | From Round 8, all clans receive 4 actions | Confirmed |
| D-005 | Endgame paths: Christianisation, Crusade, Ragnarök | Confirmed |
| D-006 | Full geography visible; exploration reveals hidden opportunities/information | Confirmed |
| D-007 | Resources: Timber, Iron, Provisions, Fish, Silver | Confirmed |
| D-008 | Unlimited regional storage pools | Confirmed |
| D-009 | One primary and one secondary resource per territory | Confirmed |
| D-010 | Each port produces 1 Fish per round | Confirmed |
| D-011 | Longboats are transports, not warships | Confirmed |
| D-012 | Land and sea routes are separate networks | Confirmed |
| D-013 | D6 combat; simultaneous rolls; defender wins ties | Confirmed |
| D-014 | Attacker maximum 3 warrior dice; defender maximum 2 | Confirmed |
| D-015 | Alliances do not automatically create war or require military assistance | Confirmed |
| D-016 | Shared Bonus Card deck; maximum 7 regular cards | Confirmed |
| D-017 | Initial General Event deck size: 50 | Provisional content size |
| D-018 | Initial Settlement Event deck size: 30 | Provisional content size |
| D-019 | Initial Voyage Event deck size: 20 | Provisional content size |
| D-020 | Highest total VP wins regardless of endgame path | Confirmed |
| D-021 | 5 Silver = 1 VP | Confirmed |
| D-022 | Engine tracks all game state and full chronological history | Confirmed |
| D-023 | Undo latest action only if no other player has acted since | Confirmed |
| D-024 | Engine enforces rules; legal actions/costs are shown | Confirmed |
| D-025 | Browser and desktop target; AI and online asynchronous multiplayer required | Confirmed product direction |
| D-026 | Autosave after every completed action; multiple save slots | Confirmed |
| D-027 | Automated rule tests and developer test mode required | Confirmed |

## Ownership and control
| ID | Decision | Status |
|---|---|---|
| O-001 | Settlement ownership and control of its territory are inseparable | Confirmed |
| O-002 | Ordinary territory control requires a warrior to remain one full turn | Confirmed |
| O-003 | Regional control requires at least one settlement and more controlled territories than any rival | Confirmed |
| O-004 | Tie for highest regional territory count means contested region | Confirmed |
| O-005 | Port in settlement territory transfers when settlement is captured | Confirmed |
| O-006 | Port in territory without settlement must be captured separately | Confirmed |
| O-007 | Losing final settlement in a region causes loss of that clan's stored resources there | Confirmed |
| O-008 | Elimination requires no settlements and no warriors remaining | Confirmed |
| O-009 | Eliminated clan's assets become neutral; resources disappear | Confirmed |

## Open decisions
| ID | Question | Status |
|---|---|---|
| OPEN-001 | Regional control VP amount and final scoring condition | Open |
| OPEN-002 | Longboat VP achievements, repeatability and retention after ship loss | Open |
| OPEN-003 | Minimum warriors required for coastal raid | Open |
| OPEN-004 | Christianisation eligibility for defensive victories/failed attacks | Open |
| OPEN-005 | Exact elimination effect on Crusade-related tracker | Open |
| OPEN-006 | Definition of established presence for gathering | Open |
| OPEN-007 | Neutral asset acquisition and interaction rules | Open |
| OPEN-008 | Exact longboat capacity accounting | Open |
| OPEN-009 | Whether/how split armies may regroup | Open |
| OPEN-010 | Terrain defensive modifiers | Open |
| OPEN-011 | Construction, upgrade, recruitment costs and capacities | Open |
| OPEN-012 | VP values except 1 VP per territory and 5 Silver = 1 VP | Open |
| OPEN-013 | Endgame thresholds and exact tracker values | Open |
| OPEN-014 | Final map, territory assignments, resource assignments and port locations | Open |
| OPEN-015 | Final card lists and texts | Open |

## Rule hierarchy
1. A card explicitly overrides a core rule when it states an exception.
2. More specific card instructions take precedence.
3. If equally specific card instructions directly conflict, the later card takes precedence.
4. Between a card and ongoing General Event, the most specific instruction takes precedence.
5. Compatible ongoing event effects both apply.
6. Uncovered situations use the closest existing rule; designers record a permanent clarification after the game.

## Change log
### Version 1.0
- Consolidated design decisions from Clusters 1–16.
- Separated confirmed decisions from provisional values and open questions.
- Established governance labels to prevent recommendations becoming rules accidentally.

Add new entries with unique IDs. Never silently overwrite a confirmed decision; record the change and rationale.
