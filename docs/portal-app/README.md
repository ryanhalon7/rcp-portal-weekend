# RCP America — new portal dashboard

Application: [portal-app](../../portal-app/). Commands and code paths below are relative to that app folder unless stated otherwise.

`portal-app/` contains the standalone first app version. Run all commands below from `portal-app/`. Node.js 22 and npm were used for verification. On a fresh copy, install the locked dependencies with `npm ci`. Source, public assets, configuration, scripts, and the runtime UI kit are included in the app folder; no files from `../RCPAb2b`, `../.agents`, or `../.claude` are needed to run or build it.

React Bits MCP is configured through the official shadcn MCP server in the user Codex configuration. `components.json` registers `@react-bits` at `https://reactbits.dev/r/{name}.json`. The server handshake, tool discovery, project registry lookup, and React Bits component search were verified. Restart Codex to load the server into a new session. The app now uses React Bits Stepper for validated Quick Order entry/review RubberSegment for the 3/6-month spend filter, and AnimatedList for the searchable location picker. Source is in src/components/react-bits; Motion is installed, and Stepper uses the existing Phosphor icons. Run node scripts/qa-react-bits.mjs and node scripts/qa-animated-list.mjs for focused checks (QA_BASE_URL can select the preview server).

A standalone, responsive Home/Dashboard prototype following PLAN.md and the stageshow skill. RCPAb2b was not opened or used. All records are sample data; no live systems are connected.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` checks TypeScript and creates `dist/`.

Working interactions: location selection and separate persistent location carts, product search, reorder lists and quantities, cart updates, Quick Order with paste/CSV validation and preview, order details and reordering, date/status filters, notifications, resource guide, mobile navigation, and keyboard-accessible dialogs. Other portal pages are deliberately outside this first-page scope.

The dashboard includes a location-specific sample spend trend with 3/6-month filtering and keyboard-accessible monthly values, a reconciled category donut, and locally bundled Pexels stock photography. Charts exclude tax/delivery, identify sample data, and keep unclassified spend visible. The moon/sun toggle remembers the chosen theme. Photo sources are recorded in [PHOTO-CREDITS.md](PHOTO-CREDITS.md). Run `node scripts/qa-visuals.mjs` to check the visual additions.

`DESIGN.md` records the design decisions. `REHEARSAL.md` records validation. `src/vendor/stageshow` contains the supplied kit; `src/reference/static-card` retains the starting gold composition. Styling uses kit components with new portal tokens. Before production, replace demonstration records and representative details, supply approved brand assets, connect the existing Flask services, and enforce purchasing policy on the server.
