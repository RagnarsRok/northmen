# Design decisions and open questions

Statuses: **Agreed direction**, **Provisional**, **Open**, **Backlog**.

## Agreed direction
- 3–5 players.
- Hybrid map: geographical regions containing settlements.
- Sea is a separate route network, not ordinary land territories.
- Individual ships are the preferred direction.
- Modular systems, feature branches and pull requests.

## Provisional
- Territory count: approximately 35–40 meaningful regions (54-region draft is under review).
- Port levels: Landing Place, Trading Port, Naval Stronghold.
- Candidate starting homelands: Hordaland, Trøndelag, Svealand, Götaland, Jutland.
- Resources: Timber, Iron, Provisions, Fish, Silver.
- Silver primarily earned through trade, raids, tribute and events.

## Backlog
- If only one attacker survives a successful settlement battle, retreat immediately; no capture and no Settlement Event card. Not finalised.

## Open
- Final map, region count, boundaries, adjacency and sea-route graph.
- Starting positions and starting assets for 3/4/5 players.
- Resource production and costs.
- Turn structure, actions, combat, naval rules and victory conditions.

Before implementing cross-system rules: specify player-facing rule, edge cases, affected systems, record decision, then implement with tests.
