# NORTHMEN: The Viking Age

A 3–5 player strategy game inspired by the Viking world. Clans compete through settlement, trade, exploration, warfare, diplomacy and three endgame paths: Christianisation, Crusade and Ragnarök.

## Project status
- Design clusters 1–16 have been worked through.
- A TypeScript, React and Vite starter project exists.
- The full game is not yet implemented.
- The consolidated rules baseline is in `docs/MASTER_GAME_SPECIFICATION.md`.

## Documentation
- `docs/MASTER_GAME_SPECIFICATION.md` — consolidated rules and product requirements.
- `docs/DECISIONS.md` — confirmed decisions and open questions.
- `docs/ARCHITECTURE.md` — intended software architecture.
- `docs/DEVELOPMENT_ROADMAP.md` — staged implementation plan.

## Governance
**Confirmed** means explicitly agreed. **Provisional** means the direction is agreed but values/details need testing. **Open** means undecided. **Recommendation** means proposed but not approved.

Never silently convert a recommendation or open item into a game rule.

## Development principles
1. The game engine is the authoritative source of truth.
2. Keep game rules independent of the React interface.
3. Validate every command in the engine.
4. Record state-changing actions in a chronological history.
5. Test rules and edge cases automatically.
6. Build a playable vertical slice early.
7. Design for AI and online multiplayer.
8. Inspect the existing repository before changing its structure or adding dependencies.
