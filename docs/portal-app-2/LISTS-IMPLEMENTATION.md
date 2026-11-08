# Lists & reorder

Application: `portal-app-2`. Route: `#/lists?mode=saved&id=essentials`.

## Buyer intent and design

A location buyer chooses familiar supplies, checks packaging and current account prices, adjusts whole purchasing quantities, and adds one deliberate selection to the location cart. Domain: replenishment, named location lists, SKU packaging, previous purchases, off-list approvals, selection, and location carts.

The page reuses DM Sans, the cyan `--brand` and `--purchase-*` palette, white/blue-green panels, the 4px spacing rhythm, and 44px controls. Quiet borders define panels; amber marks purchasing exceptions. One source picker sits beside one review panel. The signature is the relationship between saved purchasing quantities, current prices, and approval labels on a location-specific reorder. Promotional metrics, automatic add-all behavior, and hidden unavailable lines were rejected in favor of reviewable selection.

## Working behavior

- The sidebar and Home saved-list summary open a dedicated page. Saved lists and Past orders are keyboard-operable source tabs with URL state and browser history.
- Sample named location lists: Everyday essentials and Wash bay supplies. Your favorites reads the same personal favorites as Shop.
- Review rows show supplied photos or representative artwork, packaging, SKU, current unit price, editable quantity, line total, and applicable availability/approval information.
- Select available items uses a tri-state checkbox. Unavailable or unassigned products remain visible and cannot be selected or added. Only selected valid rows count toward the subtotal and cart addition.
- Save quantities updates a named location list without touching the cart. Save as new list copies only the selected products and quantities, requires a nonempty name, and rejects duplicate names for that location.
- Named lists persist in `localStorage` under `rcp-v2-lists-<location>`. Unsaved review quantities and selections persist in `sessionStorage` under a location/source-specific key. These are device-local prototype records, not shared backend lists.
- Past purchases use the same sample orders as Home. Home order details now open the review page through Reorder items, before anything is added to the cart. Current catalog eligibility and prices apply; off-list items require approval again.
- Shared cart validation rejects invalid, unavailable, or over-limit additions. The review also checks the maximum combined quantity of 999 units against the current location cart.
- Loading, request failure/retry, restricted access, unavailable catalog, empty catalog, empty favorites, missing source, invalid quantities, and local save failure have explicit behavior. Failed catalog checks cannot add products.

## Implementation

- `src/Lists.tsx`: source navigation, catalog request, selection review, local list saving and creation, current-price totals, and cart handoff.
- `src/lists.css`: desktop source/sidebar layout and mobile disclosure/stacked rows, both using existing design tokens.
- `src/saved-lists.ts`: sample list seeds, safe local list reading, and shared favorite reading.
- `src/orders.ts`: shared sample order records extracted from App.
- `src/shop-route.ts`, `src/App.tsx`: dedicated route, sidebar/Home integration, and shared cart/order flow.
- `scripts/qa-lists.mjs`: real browser validation for the complete flow and request boundaries.

## Validation

Build/typecheck, Home and Shop regression checks, and Lists browser checks. The Lists suite covers selected-line totals, quantities, saving/copying/duplicate names, refresh and draft persistence, location isolation, order review before addition, unavailable/approval behavior, missing and empty sources, catalog errors/retry/denial/empty assignment, invalid and maximum quantities, primary action text contrast, mobile source selection, 44px controls, and both themes at eight widths.

## User walkthrough tasks

Start from Lists & reorder. Opening the cart is part of review; checkout remains a prototype.

- [ ] Order two cases of all-purpose cleaner and one pack of towels from Everyday essentials, leaving out wash & wax.
- [ ] Change and save the quantities you want next time, then reopen the list and confirm saving did not add anything to the cart.
- [ ] Save a selection as a named list, leave the page, and find that list again.
- [ ] Restock from Wash bay supplies; identify the unavailable product and the item requiring approval before adding the rest.
- [ ] Review order #10482, adjust what you need, and reorder only selected products.
- [ ] Switch to another location and check that saved lists and carts remain separate.
- [ ] Find products previously favorited in Shop and use them for a repeat order.

Report Easy / Hesitated / Stuck with the first point of uncertainty. Live catalog/order history and server-backed shared lists remain future integration work.


## Walkthrough refinements: inclusion and product details

The walkthrough found it unclear how product checkboxes relate to cart addition, and buyers expected to open product details from a review row.

- Available products remain included by default on a fresh review. Each checkbox says Included or Include, the helper explains how to leave products out, and the primary action names the count (for example, Add 2 products to cart). Zero selection gives an explicit recovery hint. Existing draft selections remain intact.
- Product images and identity areas link to the existing PDP. Checkbox and quantity controls remain independent. Unavailable assigned products can be inspected; unassigned products cannot expose a catalog detail link.
- PDP links carry a validated internal return route. Back to your list returns to the same named list, favorites, or past-order source. Variant and related-product navigation retain that return context. The regular Shop navigation drops the return context so it does not leak into ordinary browsing.
- Location/source session drafts preserve quantities and inclusion through PDP navigation, reload, explicit return, and browser back. Inspecting a packaging alternative on the PDP does not silently replace a saved list SKU.
- `scripts/qa-lists-refinements.mjs` validates count-based actions, no-selection recovery, image/name links, return after packaging changes, past-order return, exact added SKU/quantity totals, unavailable-product behavior, internal return validation, and both themes at eight widths. Existing Lists and Shop suites remain applicable.

Retest: order only cleaner and towels from Everyday essentials; inspect a product from a list and return without losing the draft; repeat product inspection from a past order.
