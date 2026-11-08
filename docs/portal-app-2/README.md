# RCP America portal — edition two

Application: [portal-app-2](../../portal-app-2/). Commands and code paths below are relative to that app folder unless stated otherwise.

A separate, runnable React/Vite portal based on the visual reference in `references/`. The palette is derived from RCP cyan `#009ace`, with pale blue surfaces, rounded white panels, deep cyan pill actions, cyan charts, and a persistent left sidebar. Mobile navigation opens as a left drawer.

## Run

From the `portal-app-2/` app folder, with Node.js 22 and npm:

```sh
npm ci
npm run dev
```

The development server uses port 5182. `npm run build` checks TypeScript and builds `dist/`; `npm run preview` serves the production build.

`portal-app-2/` includes its own source, bundled assets, dependencies/lockfile, configuration, UI components, and QA scripts. It does not import runtime files from `portal-app/`, `RCPAb2b/`, or the shared root skills. The first version remains in [portal-app](../../portal-app/).

## Included behavior

- Searchable animated location picker and separate persistent carts for each location.
- Product search, saved reorder lists, quantities, and cart editing.
- Quick Order with paste/CSV import, validation, duplicate merging, review, and approval labels.
- Location and cart overview cards; restock action leading to the reorder list.
- Period-filtered spend charts, keyboard-readable monthly values, category breakdown, and data table.
- Order filters, details, reordering, invoices, notifications, and resource/support dialogs.
- Light and dark themes, responsive layouts, keyboard navigation, reduced motion.
- Shop and product details: account-policy tabs, name/SKU search, categories, persistent favorites, sorting, list/grid views, packaging choices, sample availability, and the shared location cart. Open **Shop** in the sidebar or use `/#/shop`.

All records are clearly marked demonstration data. No live orders or financial records are submitted. The illustrated container is a conceptual RCP supply visual, not an approved product-packaging image. Photography attribution remains in [PHOTO-CREDITS.md](PHOTO-CREDITS.md).

## Verification

Start the app first. Browser checks use locally installed Google Chrome through Playwright. In PowerShell:

```powershell
$env:QA_BASE_URL='http://127.0.0.1:5182'
node scripts/qa.mjs
node scripts/qa-react-bits.mjs
node scripts/qa-animated-list.mjs
node scripts/qa-visuals.mjs
node scripts/qa-edition-two.mjs
node scripts/qa-interface-review.mjs
node scripts/qa-shop.mjs
```

The edition uses `rcp-v2-*` browser storage keys so it keeps its own theme, location, and carts.

The application interface review and its scope are documented in [DESIGN-REVIEW.md](DESIGN-REVIEW.md). Before/after screenshots are in `qa/`, and `qa/design-review.html` compares them side by side. The review checks cover keyboard tabs, field-error focus, drawer isolation, text-token contrast, purchasing hierarchy, touch targets, and responsive layouts.

[SHOP-IMPLEMENTATION.md](SHOP-IMPLEMENTATION.md) traces the Shop implementation to both the shared PLAN and SUMMARY in `docs/`, and records what remains for live backend integration. Shop request states are backed by the bundled sample catalog manifest; production access checks remain a server responsibility.
