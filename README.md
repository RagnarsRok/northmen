# NORTHMEN — The Viking Age

A modular digital implementation of a strategic Viking Age board game.

## Status
Milestone 1 — Foundation. This is a clean technical starter, not yet a playable game.

## Requirements
- Node.js 20+
- npm
- Git

## Run locally
```bash
npm install
npm run dev
```

## Checks
```bash
npm test
npm run build
```

## Branch workflow
`main` stays stable. Create one focused branch per feature:
```bash
git switch main
git pull
git switch -c feature/game-domain-model
```
After changes:
```bash
npm test
npm run build
git add .
git commit -m "feat: add initial game domain model"
git push -u origin feature/game-domain-model
```
Open a Pull Request. Merge only after review and passing checks.

## Architecture rule
Game rules must not depend on React or the browser. The engine is plain TypeScript; React displays state and sends commands. Never put rule calculations inside UI click handlers.
