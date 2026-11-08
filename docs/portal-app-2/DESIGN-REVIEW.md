# Application interface review

Application: [portal-app-2](../../portal-app-2/). Commands and code paths below are relative to that app folder unless stated otherwise.

Reviewed with the root `interface-design` skill. Scope: the functional Home dashboard in `portal-app-2`; the user-supplied reference and #009ace palette remain the visual direction.

## Working brief

Intent: a dealership or wash-bay purchasing coordinator needs to select the correct location, restock approved supplies, and follow orders with confidence. The workspace should feel calm, legible, and quick to operate.

Domain: location carts, case/pail packaging, account pricing, core products, approval groups, SKU imports, shipped orders.

Color world: RCP cyan (#009ace), water-blue tints, white containers, deep blue-green ink, steel-gray metadata, amber approval notices, green delivery confirmation.

Signature: location-specific purchasing context repeated in the ordering selector, cart, location card, reorder list, and item-spend breakdown. Prices, packaging, and approval labels stay next to each reorder action.

Defaults rejected: decorative overview before purchasing → order controls first; miniature dashboard labels → legible application typography; bespoke span buttons and partial tabs → native buttons and complete keyboard interaction.

## Component checkpoint

Hierarchy: reorder essentials lead immediately after the compact account summary. Recent orders accompany them; location and spend context follow. The existing illustration and cyan panels remain supporting elements.

Palette: retain #009ace for identity and visual data; use #006b8f for actions and readable links. Introduce named ink, supporting-text, metadata, control-fill, control-border, and focus tokens for both themes.

Depth/surfaces: pale cyan canvas, white working panels, lightly inset inputs; dark mode follows the same blue-green elevation steps. Popovers retain subtle elevation, and working cards use quiet tonal boundaries.

Typography: retain DM Sans; a 14px working base, 12px metadata, 18–22px panel headings, 28–34px page headings. Use weight and contrast to distinguish labels, values, and context. Prices and counts use tabular numerals.

Spacing: a 4px base, 16–24px card padding, 8–16px control gaps, and at least 40px desktop controls; coarse-pointer controls use 44px targets without overlapping hit areas.

## Findings and corrections

| Priority | Finding | Correction |
| --- | --- | --- |
| High | Purchasing followed an entire overview; on mobile it required scrolling past several cards. | Move reorder/recent-orders before the overview in both DOM and visual order. |
| High | Many useful captions were 7–10px with pale text; table and product text were undersized. | Apply a working type scale and theme-aware foreground tokens. Decorative container lettering remains an illustration. |
| High | Quantity buttons were 20px wide and 27px high; add buttons and utilities were also small. | Increase actual control boxes, reflow product rows, and use larger touch targets. |
| High | Shared Action used a span with role/button and manual keyboard activation. | Use a native button through the existing shared component. |
| Medium | Reorder tabs lacked roving focus, arrow-key navigation, and explicit panel relationships. | Complete the keyboard and ARIA tab contract. |
| Medium | Quick Order announced errors but did not associate them with the input or focus the failed field. | Add field error semantics and return focus to the SKU input after validation fails. |
| Medium | Mobile navigation had no focus trap or background isolation. | Trap focus in the drawer, lock background scrolling, restore focus, and make the workspace inert while open. |
| Medium | Small input/control styles varied across modules; secondary/hover states were inconsistent. | Add semantic tokens and consistent hover/focus/disabled treatment in the app stylesheet. |

## Review limits

This is a source and browser review of a local prototype, not a certification or a user study. Live loading/retry behavior and real catalog/approval rules require backend integration. Navigation to future portal pages intentionally opens the existing scope notice. Validate the full purchasing journey with dealership users before production.

## Verification completed

- Production TypeScript/Vite build passed.
- Existing portal ordering regressions passed, including separate location carts, persisted quantities, Quick Order validation and duplicate merging, saved lists, order filtering/details, dialog focus, and mobile navigation.
- React Bits Quick Order/period-filter and location-picker browser checks passed.
- The focused review check passed at 1440, 1280, 1024, 768, 540, 390, and 320px in both themes. Reordering appears before the overview at every size; product labels render at 14px or above; quantity targets are at least 40px on desktop and 44px on coarse-pointer devices.
- Four semantic text tokens passed 4.5:1 contrast against the working-panel surface in both themes. This sampled token check does not certify every rendered color combination.
- Roving tab focus, arrow/Home/End selection, field-error association/focus, drawer isolation/focus return, and closing the drawer when resizing to desktop passed. No browser runtime errors were recorded.

Artifacts: `qa/interface-review-results.json`, `qa/review-before-*.png`, `qa/review-after-*.png`, and the side-by-side comparison `qa/design-review.html`.


## Home usability feedback refinement

User walkthrough feedback identified four points of friction: cart density, the meaning of Quick Order, similar summary cards, and a dispersed category-spend breakdown. The implementation keeps the existing cyan purchase tokens, DM Sans, panel radii, and responsive shell.

- Use **Order by SKU** consistently for the shared SKU-entry feature and dialog.
- Cart rows separate product/packaging/unit price, quantity, and line total; include explicit removal and a single subtotal panel. Approval guidance appears when off-list products are present. Location context and sample-checkout limits remain visible.
- Summary cards have distinct icon treatments and action-specific helper labels; amber remains reserved for approval status.
- **Spend by category** lives inside **Purchasing overview** and follows the same three/six-month selection. Compact aligned rows show amount and percentage. Category amounts reconcile to the period total.

Retest from Home without step-by-step navigation hints:

- [ ] Order two cases of cleaner and one pack of towels from a SKU list.
- [ ] Reduce the cleaner to one case, remove the towels, and verify quantity, purchasing unit, and subtotal.
- [ ] Find an order waiting on approval, then review open invoices; distinguish the two tasks at a glance.
- [ ] Compare chemicals and supplies with equipment spend, then change the period and confirm the breakdown updates.

Report Easy / Hesitated / Stuck and the first point of uncertainty for each task. Repeat cart review and the spend comparison on a phone. Browser validation covers Home purchasing flows, cart changes/removal/totals, period reconciliation, both themes, narrow widths, touch targets, and runtime errors.
