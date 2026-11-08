# Orders & invoices

Application: `portal-app-2`. Overview route: `#/orders`.

## Buyer task and design

A location buyer finds a previous purchase, checks fulfillment or approval status, locates linked invoice information, and starts a current-price reorder review. Domain: historical purchasing units, order identifiers, shipment status, approval handoffs, invoices, recorded prices, and repeat ordering.

The page retains DM Sans, the existing cyan/blue-green purchase tokens, rounded panels, quiet borders, 4px rhythm, and 44px controls. Search and records lead; no new metric cards sit above the history. Fulfillment status and invoice status are deliberately separate. Product identity areas link to the existing PDP. Invoice document availability precedes order-item detail in the mobile reading and focus order.

Rejected defaults: decorative reporting cards instead of lookup tools; downloads without real documents; invented tracking or status timestamps; immediate reorder additions without eligibility/quantity review.

## Behavior

- Dedicated sidebar destination plus Home View all orders and View all invoices entry points. Existing Home summary dialogs remain quick-access views.
- Orders and Invoices tabs. Switching tabs clears the old search and order-status filter while retaining the visible date range.
- Order lookup accepts an order number, product name, or SKU. Invoice lookup accepts invoice/linked-order identifiers and linked product terms.
- Order status supports All statuses, Open orders, Shipped, Processing, Awaiting approval, and Delivered. Date filters use the explicitly labeled sample snapshot date, November 7, 2026.
- Whole record rows are native links. Search, status, period, source tab, and record detail are URL-backed and survive refresh, browser back, and explicit return.
- Order details show recorded line prices, purchasing quantities, recorded item subtotal, known status, and linked invoices. No carrier, delivery date, approval actor name, or status event timestamp is invented.
- Invoice details show issue date, Open status, recorded amount, linked order, and related order items. Invoice PDFs, payment terms, and reconciled balances have not been supplied; a representative-contact action opens the existing support dialog.
- Review reorder opens the existing Lists & reorder review before cart mutation. Current catalog prices/availability/eligibility apply there. Off-list products require approval on every purchase.
- Product detail links carry a validated internal history return URL. Returning from the PDP restores the order/invoice and its overview filters. Ordinary Shop navigation drops return context.
- A fetched fixture manifest validates permitted locations and known order/invoice IDs, including invoice/order relationships. Loading, failed/retry, unavailable, denied, invalid payload, empty records, and missing detail states are explicit.

## Data limits

The three permitted demo locations reuse the same illustrative record set, matching the existing prototype. This fixture manifest is not production authorization. A live service must return only authenticated, location-authorized history. Historical unit prices are now stored separately from mutable catalog prices. The document-unavailable state is intentional; no invoice PDF or tracking link is fabricated.

## Files

- `src/OrderHistory.tsx`, `src/order-history.css`: overview, filters, linked records, detail layouts, and reorder handoff.
- `src/order-history.ts`, `public/data/order-history.json`: sample invoice metadata and validated fixture loading.
- `src/history-route.ts`: parsed URL state and internal route construction.
- `src/orders.ts`: shared sample order metadata, ISO dates, and recorded unit prices.
- `src/App.tsx`, `src/shop-route.ts`, `src/Shop.tsx`: shell/Home entry points, route integration, shared recorded-price display, and PDP return handling.
- `scripts/qa-order-history.mjs`: full browser validation and screenshots.

## Validation

Build/typecheck; Home and Lists regression suites; history lookup/filter/detail/reorder workflows; exact recorded amounts; linked invoice/order/PDP return; support path; unchanged cart before reorder review; off-list approval; filter and browser-history persistence; loading/error/retry/403/404/malformed/empty/unassigned-location request boundaries; sticky location context; both themes at eight overview widths and four detail widths. Mobile document information is checked to precede the item list.

## User walkthrough

Start from Orders & invoices without navigation hints.

- [ ] Find order #10482, its products, and its current status.
- [ ] Find the order containing non-acid wheel cleaner and identify who holds the next approval step.
- [ ] Narrow history to open orders from the last seven days, inspect an order, and return with the filters intact.
- [ ] Find invoice INV-10482, its amount, and the linked order.
- [ ] Find the help option when an invoice PDF is unavailable.
- [ ] Begin a reorder from history and change the products/quantities before adding them to the cart.
- [ ] Inspect a product from an order, then return to the same order details.

Report Easy / Hesitated / Stuck and the first point of uncertainty.
