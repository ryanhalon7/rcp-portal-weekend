# Shop implementation — ordering foundation

Application: [portal-app-2](../../portal-app-2/). Commands and code paths below are relative to that app folder unless stated otherwise.

## Source decisions

Read both the shared [PLAN.md](../PLAN.md) and the original [SUMMARY.md](../SUMMARY.md) before implementation. The summary supplied the user priorities; the plan supplies the broader account-policy and delivery constraints.

| User/source requirement | Implemented behavior |
| --- | --- |
| SUMMARY: dead simple ordering, prominent Quick Order, no manual write-ups | Shop is a real sidebar destination, with compact ordering rows, name/SKU search, inline quantities, and Quick Order accessible from catalog and product details. No manual order-submission path was introduced. |
| SUMMARY task 1 and PLAN account catalogs: exactly two CW purchasing tabs | Approved Core Items and Requires Approval are the only purchasing tabs. Favorites and categories remain filters within the selected tab. |
| SUMMARY: one approved core list across stores, no Tampa exceptions | All three demo locations load the same account catalog. Power Clean is always off-list; no location override can promote it. Super Blue is absent from the eligible fixtures and unknown detail links cannot add a product. |
| SUMMARY: approval every time for off-list products | Product rows, details, Quick Order review, and the location cart retain approval labels. Catalog addition is not approval; no approval is submitted or bypassed in this prototype. |
| SUMMARY task 5: sticky selected store across pages | Home, Shop, product details, and cart share the existing persistent location and separate location carts. Switching locations reloads catalog context without transferring cart lines. |
| SUMMARY: categories, favorites and approved-only browsing | Category filters, persistent personal favorites, sorting, and list/grid views work inside the two policy tabs. Core items are the default. Kits remain part of the planned Lists & Reorder increment. |
| PLAN Shop/product details | Purchasing unit, pack size, sample account price, availability, quantity controls, packaging choices, related eligible products, and an honest document-unavailable/contact path. |
| PLAN empty/loading/error/unavailable/permission states | An abortable fetch loads the sample catalog manifest. Empty assignment, invalid payload, failed request with retry, 403 restriction, 404 unavailable catalog, unavailable item, and ineligible detail links have distinct states. |
| PLAN preserve filters/back navigation | Hash URLs carry the selected tab, name/SKU query, category, favorites filter, view, sort, and product. Details link back to the filtered list; native back/forward work. |

## Interface design checkpoint

Intent: a dealership purchasing coordinator identifies an eligible product and its pack size, enters a whole purchasing quantity, and adds it to the correct location cart.

Domain: core assortment, purchasing cases/pails/packs, SKU entry, off-list approvals, location carts, repeat ordering. Natural color world: RCP cyan, water-blue tints, white containers, steel-gray metadata, deep blue-green ink, and amber approval status.

Signature: account policy is repeated at the two-tab boundary, every product row, detail page, Quick Order review, and cart. Store context remains visible in the shell, specification list, and persistent cart action.

Rejected defaults: an unrestricted mixed product grid → policy tabs with compact rows by default; decorative promotional hero → an actionable catalog; fake stock/document claims → explicitly sampled availability and unavailable official documents.

Hierarchy: product names, packaging and account price precede the quantity/add control. Related products and documents follow the purchasing decision. Favorites are a secondary control, not another catalog tab.

Palette/depth/surfaces: reuse `--brand`, `--purchase-*`, and the shared working-panel system. White surfaces over pale cyan; inset control fills and quiet borders; dark mode uses the same blue-green hierarchy. New SVGs are clearly representative packaging illustrations, not actual catalog photographs.

Typography/spacing: DM Sans, 14–15px product names, 12px packaging, 11px SKU/policy metadata, tabular prices; a 4px spacing base with 16–24px panel spacing and actual 44px quantity/favorite targets. Shop's static add labels skip animated text, since repeat actions should remain immediate. The cart bar reserves scroll clearance for focus.

## Files and boundaries

- `src/catalog.ts`: shared sample product records, purchasing units, availability and catalog loading/validation.
- `public/data/catalog.json`: sample account eligibility manifest; no API credentials or live customer data.
- `src/shop-route.ts`: hash navigation and URL filter parsing/serialization.
- `src/Shop.tsx`, `src/shop.css`: catalog, states and product details, lazy-loaded as a separate route bundle.
- `src/components/ProductArt.tsx`, `OrderQuantity.tsx`: representative illustrations and accessible quantity controls.
- `src/App.tsx`: shared navigation, location cart and common validation for additions from Home, Shop, Quick Order and reorders.
- `scripts/qa-shop.mjs`: policy, search, filtering, details, persistence, request states and responsive browser checks.

This is the current React prototype increment. It does not implement production authorization, inventory, pricing, actual approval routing, shared-user cart revisions or checkout submission. All prices/product records are illustrative. CW policy is scoped to the Camping World sample account; distributor/wholesale policies must be loaded from their own backend account context, not inherited from this fixture. The Flask/service integration and transactional enforcement described in PLAN remain required before launch.

## Verification

- Production build passes; Shop loads as a separate route bundle.
- Existing Home/cart/order regressions and Quick Order/React Bits checks pass.
- Shop browser checks cover exactly two CW policy tabs, no store-specific core overrides, omitted Super Blue, Power Clean approval labels, unavailable-item blocking, fractional-quantity rejection, cumulative quantity limits, category/favorite/sort/view filters, filter refresh/back behavior, packaging detail routes, location cart isolation and all catalog request states.
- Desktop and mobile layouts were checked at 1440, 1280, 1024, 768, 600, 540, 390 and 320px in both themes. Local screenshots and results are in `qa/shop-*`.
- A touch-device check passed for left-drawer Home/Shop navigation, background isolation, 44px purchasing/favorite targets, unavailable-SKU CSV rejection and approval preservation for Power Clean entered through Quick Order.

## Shop layout refinement

The supplied `portal-app-2/references/shop-page.webp` informs the category-sidebar and product-area structure. Existing DM Sans typography, cyan purchase tokens, rounded panels, product artwork, policy tabs, and purchasing controls remain the design foundation.

A compact Shop heading replaces the introductory headline and repeated location copy. Categories with counts and Favorites sit in a 184px sidebar, separated from products by 24px. Search, sort, and list/grid controls share a desktop toolbar. Purchasing policy uses a disclosure; product eligibility labels and the approval-tab reminder remain visible where the purchasing decision occurs. Below 1101px, filters collapse into a keyboard-accessible disclosure with an active-filter indicator. Mobile search retains its own full-width row.

The desktop first product begins within 400px of the viewport top, approximately 220px higher than the previous layout. Browser QA checks this boundary, policy disclosure, mobile filter expansion/reset, existing shopping flows, and overflow in both themes at eight viewport widths.


## Shop walkthrough feedback refinement

The walkthrough found packaging variants hard to discover, repeated row metadata overwhelming, Favorites unexpectedly hiding the approval catalog, and the search click-focus ring too prominent.

- Group matching packaging variants into one product-family row, with native radio controls for purchasing packaging. Selection changes the displayed SKU, price, photo, quantity state, favorite state, and item added to the cart. Counts represent product families. Exact-SKU searches still return the requested packaging. Choices respect current search and Favorites filters; detail pages expose all eligible packaging near the top.
- Remove repeated core-approval, available-in-sample, and account-price labels from browsing rows. Preserve off-list approval and unavailability labels, plus detailed policy information.
- Switching purchasing-policy tabs clears Favorites and category filters, retains search/sort/view, and announces cleared filters. Active category and Favorites filters have removable chips beside the result count, including on mobile.
- Search receives a subtle border when clicked. Keyboard Tab navigation gives the search container a visible focus ring; the input does not create a second outline.

Retest tasks:

- [ ] Find all-purpose cleaner, choose bulk packaging while browsing, and verify the cart contains the selected pack at the correct price.
- [ ] Browse Favorites, switch to Requires Approval, and find Power Clean without manually clearing filters.
- [ ] Start with an unfiltered Shop, find a wash product, and add one purchasing unit; assess whether the first glance feels calmer.
- [ ] Search for a product using the mouse, then move through the controls with the keyboard; assess the focus treatment.

Validation: grouped-pack price/photo/cart behavior, exact-SKU search, policy-tab filter reset, pointer/keyboard focus distinction, shopping regression flows, photo/fallback behavior, touch targets, both browsing views and themes, and responsive widths.
