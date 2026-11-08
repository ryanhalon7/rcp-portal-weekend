# React Bits components

Application: [portal-app-2](../../portal-app-2/). Commands and code paths below are relative to that app folder unless stated otherwise.

Source: the official `@react-bits` registry at https://reactbits.dev/r/{name}.json, retrieved through the shadcn MCP.

- `Stepper-TS-CSS`: Quick Order entry and validated review. Adapted to existing Phosphor icons, with focus transfer and inert outgoing panes.
- `RubberSegment-TS-CSS`: controlled three/six-month spend filter. Uses Motion; retains keyboard navigation and reduced-motion support. Added native click activation for keyboard and assistive technology.

Portal colors and layout adjustments live in `src/visuals.css`.

- `AnimatedList-TS-CSS`: searchable location picker with keyboard selection, current-location checkmark, and focus restoration. Removed demo icons/items to reuse Phosphor. Added a listbox label, scoped arrow keys to list focus, and disabled animation/smooth scrolling when reduced motion is requested (including preference changes).
