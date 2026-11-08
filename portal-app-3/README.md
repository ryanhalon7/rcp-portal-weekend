# RCP America — Edition 03

A standalone home dashboard, based on the six images in `references/` and `../docs/PLAN.md`.

## Run locally

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5184. Build with `npm run build`.

Only the home dashboard is implemented. Quick order, location selection, per-location carts, search, saved-list filtering, notifications, monthly summary, and detail dialogs work with sample data. Cart and location persist in browser storage. Other navigation entries are intentionally disabled until those screens are built. No production services, checkout, approval decisions, or message sending are connected.

The visual direction uses rounded white cards, thin circular controls, a muted silver canvas, an amber glow, and a blue/brown credit surface from the references. The dark reorder workspace carries the references’ black lower section into a practical purchasing area.

`npm run qa` checks dashboard interactions and responsive layouts using installed Google Chrome. Screenshots are saved to `qa/`.
