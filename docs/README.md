# RCP America portal documentation

Project Markdown files and notes are grouped here. Application code remains in its own version folder; installed skills and their instructions remain at the workspace root.

## Shared source documents

- [PLAN.md](PLAN.md): implementation plan and acceptance criteria.
- [SUMMARY.md](SUMMARY.md): original user-feedback notes that informed the plan.

## Current version: portal-app-2

- [Run instructions and features](portal-app-2/README.md)
- [Visual design decisions](portal-app-2/DESIGN.md)
- [Application interface review](portal-app-2/DESIGN-REVIEW.md)
- [Shop implementation and source traceability](portal-app-2/SHOP-IMPLEMENTATION.md)
- [React Bits components](portal-app-2/REACT-BITS.md)
- [Photo credits](portal-app-2/PHOTO-CREDITS.md)
- [Vendored artwork sources](portal-app-2/ASSET-SOURCES.md)

Run from the workspace root:

```sh
cd portal-app-2
npm ci
npm run dev
```

The current development server uses port 5182. Each app retains its own source, public assets, dependencies/lockfile, configuration, scripts, and build output. Documentation is maintained separately here.

## First version: portal-app

- [Run instructions](portal-app/README.md)
- [Design decisions](portal-app/DESIGN.md)
- [Validation notes](portal-app/REHEARSAL.md)
- [React Bits components](portal-app/REACT-BITS.md)
- [Photo credits](portal-app/PHOTO-CREDITS.md)
- [Vendored artwork sources](portal-app/ASSET-SOURCES.md)

## Workspace layout

```text
b2b-portal/
  docs/
    PLAN.md
    SUMMARY.md
    README.md
    portal-app/
    portal-app-2/
  portal-app/
  portal-app-2/
  RCPAb2b/
  .agents/
  .claude/
  skills-lock.json
```
