# Architecture principles

1. **Engine:** pure TypeScript game state, validation and transitions; no React/DOM imports.
2. **Data:** regions, routes, resources, cards and setups use stable IDs.
3. **Presentation:** React renders state and dispatches commands; it does not implement rules.
4. **Assets:** map art and icons are presentation assets, never the authority for adjacency.

Flow: UI action → command → engine validation → state transition → updated state → UI render.

Keep land adjacency separate from sea-route connectivity. Ports belong to coastal territories; sea nodes are not ownable territories. Make random events reproducible in tests through an injected random source/seed.
