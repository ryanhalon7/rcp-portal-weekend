# Rehearsal: Home / Dashboard

Application: [portal-app](../../portal-app/). Commands and code paths below are relative to that app folder unless stated otherwise.

Brand assets update: replaced the temporary text wordmark with the supplied black and white PNGs in `public/assets`. The active theme selects the appropriate source, including inside the mobile navigation drawer. Original proportions are preserved; CSS accounts for transparent padding in the black asset to keep visible logo sizes aligned. Alt text and the home link remain accessible.

Visual update: added a stageshow Chart area/line trend and a category donut using the same sample records. May–October are complete demonstration months; 3/6-month selection and location switching update both totals. Keyboard or pointer selection reads each month's value, and an expandable table exposes the data. Category totals reconcile with the line chart's period total, including Unclassified. This is sample invoiced item spend, excluding tax/delivery, with no claim about live Tampa history. The right-column guide and reorder header use locally downloaded Pexels photos by Tima Miroshnichenko, documented in [PHOTO-CREDITS.md](PHOTO-CREDITS.md).

Visual verification: `node scripts/qa-visuals.mjs` passed image decoding, reconciled totals, period changes, keyboard monthly readout, location-specific records, the data table, and overflow checks in light/dark at nine widths from 320 to 1440. Reviewed `qa/visuals-dark-1440.png` and `qa/visuals-light-390.png`; charts remain readable and photography doesn't cover controls. Stageshow host layout audit passes at 1440 and 390. Production build passes. The chart has a one-time draw-in and respects reduced motion; there is no scripted animation loop.

Dark mode update: added a keyboard-accessible moon/sun toggle in the top bar, a system-preference default, and a saved light/dark choice. The stageshow look context, native color scheme, and browser theme color follow the selected mode. Dark styles cover navigation, products, forms, status labels, location popovers, cart, dialogs, and error states. `node scripts/qa-dark.mjs` passed system-preference initialization, keyboard toggling, persistence after reload, mobile navigation, and overflow checks at 1440/768/390/320 pixels. Visually reviewed `qa/dark-desktop.png`, `qa/dark-dialog.png`, and `qa/dark-mobile.png`. Production build passed.

Gold: `src/reference/static-card`, copied from the stageshow skill before implementation. Kept its sidebar/list/detail hierarchy and supplied kit primitives. Replaced its miniature browser crop with a full-size responsive application, as requested. Product and account information uses realistic fidelity. The reference itself is available at `/gold.html` during development.

Composition: the reorder list is the primary working surface. The sidebar and utility bar provide location and ordering context. Order history and the account representative are secondary. Phone layout uses a drawer, visible location selector and search, and redesigned two-line product rows rather than scaling the desktop composition.

Captured and visually reviewed:

- `qa/gold-static-card.png`: supplied gold, captured with film.mjs.
- `qa/dashboard-desktop.png` and `qa/dashboard-1440.png`: complete desktop layout.
- `qa/dashboard-390.png` and `qa/dashboard-358.png`: complete phone layouts.
- `qa/quick-order-preview.png`, `qa/cart-desktop.png`: populated workflow states.
- `qa/mobile-navigation.png`, `qa/mobile-quick-order.png`, `qa/mobile-reduced-motion.png`: mobile drawer, dialog, and reduced motion.
- `qa/layout-desktop.png`, `qa/layout-mobile.png`: final visible layout audit captures.

Review findings and fixes: the initial inherited stage reset affected host typography and controls; the working app now uses the kit primitives with its own responsive root and tokens. Increased working text sizes and darkened metadata. Replaced the compressed phone table with stacked product rows. Added phone search, a labeled drawer close button, and hid the closed drawer from keyboard navigation. Fixed the guide heading's missing word space. Gave mobile summary controls enough height for their content. Corrected the shipped order subtotal so it reconciles to its lines.

Gold comparison: the reference focuses on a small satellite card. This dashboard puts its useful content directly in the page at 1:1 scale, with a clear dominant ordering surface and quieter supporting information. It deliberately uses no simulated browser frame or scripted cursor.

Validation:

- `npm run build`: passed TypeScript and production Vite build.
- `npm run qa`: passed. The retained Playwright script checks cart additions and totals, isolated location carts, persistence after refresh, invalid Quick Order rows, duplicate SKU merging, approval labels, saved-list switching, search, order date filters, order details, dialog focus cycling and Escape, mobile navigation, reduced motion, and browser runtime errors.
- No page overflow at 1440, 1280, 1024, 768, 540, 390, 358, or 320 pixels wide.
- Stageshow `layout.mjs --strict` at 1440 and 390: `no-issues-detected`. Reports retained in `qa/layout-desktop.json` and `qa/layout-mobile.json`.

Film/gate: this is an interactive page with no authored animation loop, so no loop rehearsal gate is claimed. The unchanged gold's still capture reports its own lopsided-row and kit stylesheet warnings; its film result was inconclusive. Those reference warnings were not suppressed or treated as a dashboard pass. The dashboard is checked using the skill's host-layout audit, real interaction tests, and visual review.

Assumptions: all products, SKUs, prices, account records, contacts, and statuses are sample data. The plain text wordmark is used until approved logo artwork is supplied. Product icons stand in for photography pending an approved catalog asset source. No RCPAb2b files were read.

Not checked: live Flask/API integration, server-side policy enforcement, live invoices, production branding/contact details, real shipment tracking, a screen-reader session, or a complete WCAG audit. No live orders, approvals, payments, or messages are submitted. Shop, Quotes, and Account settings explicitly describe their future-page scope. Production account credit and delivery promises are not invented.
