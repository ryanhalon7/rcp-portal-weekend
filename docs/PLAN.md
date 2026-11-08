# RCP America B2B Portal Redesign

## 1. Goal, scope, and evidence

Make RCP America the easiest supplier for dealerships, distributors, and wholesale partners to reorder from, while preserving each account’s purchasing controls.

Evolve the existing portal rather than replace its platform. Give all three partner types equal weight in design, testing, and launch. Camping World supplies concrete requirements, but its restrictions must remain account-specific.

**Design mandate:** deliver a complete change in visual direction. The new portal must look and feel like a modern enterprise application, with a newly designed application shell, navigation, typography, components, and page layouts. Retaining the existing platform is an implementation constraint, not a requirement to retain its visual design. This is a full interface redesign, not a cosmetic refresh.

**First-release scope:** redesigned shopping and account experience, quick ordering, CSV import, favorites and reorder lists, product kits, approval workflows, split orders, quotes, volume pricing, account-credit workflows, reporting, and onboarding.

**Outside scope:** platform replacement, native mobile apps, automated replenishment, new payment processors, and live accounting/ERP integration.

### What the repository establishes

The portal uses Python/Flask, custom HTML templates, JavaScript, and `spGlobal.apiV2`. Existing services already support products, account catalogs, store groups, cart persistence, orders, favorites, saved “Auto Carts,” approvals, and notifications.

Several meeting requests already have partial implementations, including chemical/equipment reporting and core-versus-approval spend. Treat these as features to verify and improve, not automatically rebuild.

Important implementation constraints:

- Carts are currently shared at the store level.
- Catalog inheritance allows local overrides; Camping World needs a stricter group-wide policy.
- Current approval logic includes owner/admin bypasses.
- Historical reporting can infer classifications from the current catalog.
- Monthly store-budget enforcement contains an unfinished path.
- Quotes and credit management need new workflows; existing price fields do not establish a complete volume-pricing system.

These are source-code findings, not confirmation of production behavior. Review changes with Mark through the existing repository workflow.

### Research informing the design

| Evidence | Application to RCP |
| --- | --- |
| [Microsoft’s B2B ordering documentation](https://learn.microsoft.com/en-us/dynamics365/commerce/b2b/quick-bulk-orders) emphasizes item-number entry, order templates, and reordering. | Give repeat buyers direct routes to a populated cart. |
| [Imperial Supplies’ published app description](https://play.google.com/store/apps/details?id=com.imperial.ImperialApp) includes mobile ordering and approvals. | Make purchasing and approving practical on a phone. |
| [Safety-Kleen’s support page](https://www.safety-kleen.com/support) brings invoices, scheduled services, and product requests into its customer portal. | Keep order history, delivery information, and help close to purchasing. |
| [Shopify’s B2B catalog documentation](https://help.shopify.com/en/manual/b2b/catalogs) describes account catalogs, quantity rules, and volume pricing. | Show the buyer’s eligible products, purchasing units, and applicable prices together. |
| [Adobe’s quote workflow](https://experienceleague.adobe.com/en/docs/commerce-admin/b2b/quotes/quotes) supports buyer/seller negotiation and recorded revisions. | Treat quotes as a visible, versioned workflow that converts into an order. |
| [Baymard’s B2B research](https://baymard.com/research/business-to-business) covers connected discovery, purchasing, and self-service journeys. | Test complete purchasing tasks rather than judge isolated screens. |

These sources support the recommendations; they do not establish that any particular feature will increase RCP revenue. Glen’s references to competitor kits and approved-only catalogs remain meeting feedback, not independently verified competitor behavior.

## 2. Experience and visual design

### Shared shell and navigation

Build a consistent enterprise application shell: a persistent left navigation rail on desktop, a compact top utility bar, and a spacious main workspace. Place the RCP logo and account/location switcher in the shell; keep prominent product search, **Quick Order**, and cart quantity/total immediately accessible. On mobile, move navigation into a labeled drawer and keep location context and the primary ordering action visible.

Primary navigation:

- **Shop**
- **Lists & Reorder**
- **Orders & Invoices**
- **Quotes**
- **Resources**

Expose **Approvals**, **Reports**, and **Account & Credit** according to permissions. Keep RCP administration separate from the buyer experience.

Buyers land on Shop with reorder shortcuts. Approvers land on their queue. Finance users land on account balances and requests. Every role retains a prominent ordering entry point where authorized.

Replace hierarchical state-to-store navigation with one searchable location selector. Persist location across pages and refreshes, validate access on every request, and clearly distinguish reporting across locations from ordering for one location.

### Visual direction

Create a new visual system that communicates clarity, precision, and confidence. Retain the RCP name, logo, and recognizable brand cues, while giving the application a new visual language. The current portal's colors, CSS, component styling, and layouts are not design constraints.

- **Palette:** use cool neutral backgrounds, white working surfaces, dark slate text, and one restrained blue action accent. Reserve green, amber, and red for meaningful states. Establish accessible color tokens rather than reusing the current stylesheet's values by default.
- **Typography:** use a modern sans-serif stack led by Inter when available, with system-font fallbacks. Set a clear hierarchy for page titles, section headings, body copy, and metadata; use tabular numerals for prices, quantities, and financial tables.
- **Layout:** use a consistent spacing scale, aligned page headers, clear content groups, and generous separation between tasks. Pair a restrained navigation rail with flexible workspaces; give tables and ordering tools enough width to work efficiently.
- **Components:** design a unified family of buttons, inputs, searchable selects, tabs, badges, tables, drawers, dialogs, notifications, and empty states. Use subtle borders, modest corner radii, and restrained shadows. Define default, hover, focus, disabled, loading, error, and selected states together.
- **Data presentation:** use clean tables with aligned numbers, sortable headings, concise status labels, and clear row actions. Reports should prioritize interpretable trends and actionable comparisons; use metric cards only when they help a decision.
- **Interaction:** make primary actions visually obvious, keep secondary actions quiet, and give immediate inline feedback. Use short, purposeful transitions and respect reduced-motion preferences. Replace routine blocking popups with inline validation or non-blocking feedback.

Remove the current oversized gradient banners, decorative effects, scattered floating controls, and inconsistent page-specific styling. Apply the new system across shopping, checkout, reporting, account management, and administration so the product feels like one coherent application.

Use product imagery to help identify packaging and variants, with consistent image treatment and compact rows as the default ordering view. Offer a grid view for visual browsing. Keep the initial shopping viewport focused on products and repeat-order shortcuts.

On phones, use stacked product rows, large quantity controls, and a persistent cart action. Target WCAG 2.2 AA, including keyboard operation, visible focus, labeled controls, readable errors, and unobscured focused elements. Use approximately 44-pixel touch controls where practical. [W3C guidance](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)

### Core screens

| Screen | Required experience |
| --- | --- |
| Shop | Search by name/SKU; category filters; account pricing; purchasing unit and pack size; availability; inline quantities; favorites. |
| Product details | Packaging, variants, product information, SDS/PDS when available, delivery information, and eligible related products. |
| Quick Order | SKU/name entry, paste multiple SKUs, CSV upload, validation preview, quantities, and add-to-cart. |
| Lists & Reorder | Personal favorites, named location lists, editable reorder quantities, recent purchases, and curated category kits. |
| Cart & Checkout | Location, items, prices, PO/reference, delivery, payment terms, approval split, and explicit totals. |
| Orders & Invoices | Searchable history, linked split orders, status timeline, invoice links, tracking, and reorder actions. |
| Quotes | Drafts, requests, seller responses, revisions, expiry, acceptance, and conversion to checkout. |
| Approvals | Pending requests, requester/location, reasons, amounts, approve/reject controls, and decision history. |
| Account & Credit | Terms, credit limit, reconciled balance, commitments, available credit, holds, and credit-change requests. |
| Reports | Spend breakdowns, location comparisons, and drill-downs into supporting records. |
| Resources | Ordering video, short guides, product documents, and account-representative contact. |

Empty, loading, failed, unavailable, and permission-denied states are required for every screen.

## 3. Purchasing rules and workflows

### Account-specific catalogs

For Camping World, show exactly two purchasing tabs: **Approved Core Items** and **Requires Approval**. Favorites and categories are filters within these tabs.

Maintain one core list for the entire Camping World account. Store-level exceptions cannot make off-list products orderable without approval. Remove stray products such as Super Blue from the eligible catalog unless explicitly assigned.

Off-list requests require approval on every purchase, including reorders, kit additions, CSV imports, and accepted quotes. Hide products that are unavailable to the buyer entirely.

Other partners retain their own catalogs, prices, and approval policies. Do not impose Camping World’s two-tab model on unrestricted accounts.

### Repeat and bulk ordering

Preserve existing favorites. Present saved Auto Carts as clearly named reorder lists, without implying automatic order placement.

Kits are editable collections of ordinary product lines. Each line retains its own availability, price, quantity rules, and approval requirements.

Provide a downloadable CSV template using `sku` and `quantity`. Preview matched products and row-level errors before changing the cart. Combine duplicate SKUs, reject ambiguous matches, and never silently round quantities to case multiples.

Reorders use current eligibility, prices, and availability. Explain changes from the previous order before submission.

### Cart ownership and store switching

Preserve the shared location cart for compatibility, label it **Location cart**, and add revision checking to prevent one user silently overwriting another’s changes.

Switching locations opens the destination location’s cart and leaves the previous cart intact. Never carry products or prices into another location automatically.

Named personal lists remain separate from shared carts.

### Checkout and automatic approval splitting

Preview two groups when applicable:

1. **Ready to order**
2. **Requires approval**

Submit them as linked child orders under one purchase reference. Core items proceed only when all other applicable checks pass. Off-list items wait for the configured customer approver.

Price delivery separately for each child order and show both estimates before submission. If the approval order’s price or delivery charge changes, require buyer acceptance before release; material changes invalidate the previous approval.

Do not allow splitting to bypass whole-purchase budgets, credit checks, or quantity restrictions. Recalculate final totals on the server.

Use durable, idempotent submission so retries cannot create duplicate orders. Show a confirmation with both order numbers and their individual statuses.

If no approver is configured, retain the request in a visible blocked state and route it to account administration for configuration. Never silently approve it.

### Roles and assisted ordering

Separate capabilities for buyer, customer approver, account administrator, RCP rep/driver, RCP sales, and RCP finance.

Drivers and reps receive individual logins scoped to assigned locations. Their assisted-ordering view follows the same purchasing rules as the buyer and records the actual submitting user.

Replace implicit owner/admin approval bypasses with explicit authorized decisions. A customer approval must be distinct from the requester’s action.

Camping World’s approver identity remains a launch configuration prerequisite to resolve through Kendall; the software must support assigning that role without code changes.

### Quotes, pricing, and credit

Quotes support draft → requested → seller response → buyer acceptance or revision → converted, declined, or expired. Keep comments and revision history. Acceptance creates a checkout draft; it does not bypass procurement approval or credit checks.

RCP sales manages account-specific quantity tiers. Show unit price, qualifying quantity, and line savings. Pricing precedence is: valid accepted quote, applicable account tier, existing account price. Do not stack discounts automatically.

Use an RCP-managed credit workflow for the first release:

- Finance maintains terms, limits, holds, and reconciled opening balances.
- Record balance adjustments and reconciliation timestamps.
- Track uninvoiced order commitments separately from receivables to avoid double counting.
- Reserve credit for submitted orders, including approval-pending commitments; release it on rejection or cancellation.
- Block purchases exceeding available credit or on explicit hold, and provide a finance-review request.
- Do not invent credit limits, payment terms, or automatic financing decisions.

### Reporting and historical truth

Separate **Chemicals & Supplies**, **Equipment**, and **Unclassified**. Default Top 5 products to Chemicals & Supplies.

Break item spend into Approved Core, Requires Approval, and Unclassified. Show tax and delivery separately so totals reconcile with overall expense.

Snapshot product classification and approval policy on new order lines. Historical records lacking reliable evidence remain unclassified rather than inheriting today’s catalog rules.

Define average monthly core spend as invoiced core-item spend, net of recorded credits and excluding tax/delivery, divided by complete calendar months in the selected period. Include genuine zero-spend months; mark incomplete periods and stores instead of treating missing data as zero.

Make months, products, and store comparisons link to filtered supporting invoices or order history. Preserve location and date filters when navigating back.

Tampa’s incomplete QuickBooks history must be reconciled or visibly labeled before comparisons are presented as complete.

## 4. Implementation and delivery

### Architecture and interface changes

Keep Flask, the custom template structure, existing routes, and `spGlobal.apiV2`. Build a new application shell and shared design tokens, then implement reusable navigation, product rows, status labels, forms, tables, and feedback states within that structure. Replace legacy presentation styles on redesigned screens; do not layer the new visual system over conflicting legacy CSS.

Extend existing services with:

- Effective account policy and quantity-tier information.
- Cart revision checks and bulk validation.
- Checkout preview and idempotent split submission.
- Linked-order identifiers and immutable line snapshots.
- Quote revisions and conversion.
- Credit reconciliation, reservations, and holds.
- Reporting filters, classification coverage, and drill-down links.

Preserve existing single-order responses for legacy callers; use a new split-submission endpoint returning the purchase reference and child orders.

Use transactional SQLite persistence for new split-submission, quote, and credit workflow records. Keep legacy orders readable and use a durable dispatch record to bridge committed purchases into existing order processing without duplicate fulfillment. Serialize credit reservations at account level.

Enforce authorization, pricing, catalog eligibility, quantity rules, and approval requirements server-side. Treat UI visibility as presentation, not enforcement.

### Delivery sequence

1. **Baseline and design:** document current flows; establish test accounts for all partner types; create the new visual system and component specifications; prepare high-fidelity desktop/mobile prototypes of Shop, Quick Order, Checkout, Orders, and Reports, plus a role matrix. Use these prototypes as the visual reference for implementation.
2. **Ordering foundation:** deliver navigation, location persistence, catalog cleanup, product rows, favorites, lists, kits, quick entry, and CSV preview.
3. **Transaction workflows:** deliver split checkout, approvals, quotes, tier pricing, credit workflows, and linked order history.
4. **Reporting and operations:** correct classifications, drill-downs, data-completeness labels, onboarding tools, and resource content.
5. **Pilot and rollout:** test with Glen’s three to four managers plus distributor and wholesale buyers; address findings; expand by account.

These are implementation increments within the agreed first release, not reasons to drop wholesale capabilities.

Prepare reviewable changes for Mark’s master branch. Use account-level feature flags and additive migrations. Rollback disables new entry points while preserving submitted orders, quotes, and financial records.

Send review materials through the existing Kendall process when separately authorized: manager-view screenshots, concise change notes, and a final Teams review. Record the ordering video after workflows stabilize.

## 5. Acceptance, measurement, and launch gates

### Required acceptance scenarios

- Representative screens demonstrate a complete visual departure from the current portal and consistently use the new enterprise application shell, typography, spacing, and components.
- Shop, checkout, orders, reports, and administration follow the same visual system, with no legacy-styled sections left inside redesigned workflows.
- Desktop and mobile implementation matches the high-fidelity design references, including loading, empty, error, focus, and disabled states.
- A buyer finds and submits a repeat order on desktop and phone without assistance.
- Location remains consistent across shopping, checkout, history, reports, refresh, and back navigation.
- Unauthorized locations, products, prices, invoices, and credit records cannot be accessed directly.
- Camping World stores share the same core list; off-list products require approval every time.
- Mixed-cart submission creates linked orders with correct separate charges and no duplicated lines.
- Network retries and concurrent submissions do not duplicate orders or exceed credit.
- CSV errors identify affected rows without silently adding incorrect products.
- Concurrent shared-cart edits produce a recoverable conflict.
- Expired quotes, changed prices, removed products, and unavailable items produce clear recovery paths.
- Rejected orders release reservations; invoice reconciliation does not count commitments twice.
- Analytics reconcile to records and distinguish incomplete data from zero spend.
- Keyboard and mobile users can complete ordering and approval flows.

### Success measures

Capture a baseline before launch and compare comparable cohorts after rollout:

- Repeat-order completion time and checkout completion rate.
- Active ordering locations and repeat-order frequency.
- Portal share of eligible orders.
- Revenue and product breadth per active account.
- Approval turnaround and quote-to-order conversion.
- Ordering support requests and correction rates.

Proposed usability targets: at least 90% unassisted completion of the core ordering task and a median familiar reorder time under two minutes. Treat commercial improvement targets as hypotheses until baseline data exists.

### Launch gates and defaults

- Every participating location has valid users, a catalog, pricing, delivery settings, and any required approver.
- Finance has initialized and reconciled credit-enabled accounts.
- Imported invoices have stable source identifiers to prevent duplicates.
- RCP drivers and reps use portal logins for assisted orders.
- Camping World retires routine manual write-ups after onboarding; any outage recovery is recorded in the portal with actor and source.
- Live inventory and delivery promises appear only where backed by reliable data.
- No production behavior is considered verified solely because supporting code exists.
