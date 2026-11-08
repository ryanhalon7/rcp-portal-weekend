# Edition two design decisions

Application: [portal-app-2](../../portal-app-2/). Commands and code paths below are relative to that app folder unless stated otherwise.

Reference: `references/dribbble.com_shots_27719212-Avenra-AI-Neurology-Dashboard-SaaS.png` supplied by the user.

Borrowed the reference's large rounded white panels, soft typography, pill actions, stacked location-card treatment, and translucent illustration. The palette is derived from `#009ace`: pale cyan surfaces, deep blue-green text and actions, and cyan chart/illustration accents. Primary navigation remains on the left as requested, with a left drawer on phones. The top bar contains location, search, and utilities only.

Palette: brand `#009ace`, strong action/text `#006b8f`, soft tint `#e3f5fb`, deep ink `#082f40`, chart secondary `#7ccce7`. Dark mode uses blue-green surfaces and brighter cyan accents. Darker cyan shades support white action labels; the exact seed color is used for charts and accent details.

Translated the reference's patient card into an ordering-location card, its insight illustration into a conceptual supply container, and its reports into account purchasing insights. The lower panels pair reorder essentials with recent orders, followed by account attention and support. Category totals remain visible and reconcile to the spend total. The photo banner uses locally bundled detailing photography.

The new stylesheet `src/edition-two.css` builds on the inherited functional components. Existing React Bits Stepper, RubberSegment, and AnimatedList remain. Layouts adapt from three top panels to two then one, with single-column purchasing panels on narrower screens. Light is the initial theme; dark mode is optional. Browser storage uses independent `rcp-v2-*` keys.

Runtime modules and static assets are bundled locally. No original-app files or shared skills are required to run this edition. Data and product packaging are illustrative; production requires approved catalog records, brand assets, and backend integration.

## Application interface review

The interface-design review in `DESIGN-REVIEW.md` promotes reordering and recent orders above supporting overview panels. `src/interface-review.css` defines the application text/control tokens, readable typography, and actual desktop/touch hit areas while preserving the supplied reference and cyan brand direction. Buttons use native semantics, reorder tabs support roving focus and arrow keys, Quick Order errors are associated with the input, and the mobile drawer isolates background interaction and returns focus.
