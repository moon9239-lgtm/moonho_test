# PIPC Dashboard Altivo Visual Refresh Design

## Intent

Refresh the PIPC dashboard toward the Altivo smart productivity dashboard mood while preserving the density and seriousness needed for public meeting, agenda, transcript, law, and commissioner analysis.

The chosen direction is not a full task-management clone. It borrows the clean productivity-tool rhythm: bright workspace canvas, strong ink typography, green and warm orange accents, compact action surfaces, and clearer visual grouping.

## Scope

This visual refresh applies to the existing static dashboard:

- Integrated status dashboard
- Agenda integrated search
- Meeting transcript lookup
- Law article drawer and inline law references
- Commissioner dashboard
- New agenda assistant
- Animation view

The refresh must not alter parsing, Supabase sync, law lookup logic, meeting data, commissioner analysis, or test data contracts.

## Visual Principles

- Use an off-white workspace background instead of a gray-blue dashboard background.
- Use near-black text for titles and key metrics so the interface feels sharper.
- Use green as the main activity/accent color, warm orange as the secondary highlight, and muted blue only where legal/information context benefits from it.
- Keep repeated cards at a disciplined radius of 8px or less; softness should come from spacing, contrast, and subtle shadows, not oversized rounded cards.
- Avoid decorative blobs, orbs, and marketing-style hero composition.
- Keep Korean text compact and readable at dashboard scale.
- Preserve dense tables, transcript logs, and law content as work surfaces rather than turning them into large promotional cards.

## Layout Direction

### Shell

The sidebar should feel like a productivity workspace rail:

- Compact brand block with a bold PIPC mark.
- Navigation items with small geometric icon treatments and a strong active indicator.
- Data 기준 block remains, but should look like a small workspace status tile.

The main area should feel more like a command workspace:

- Strong page title and short context line.
- Clear top-level panels separated by light borders and white surfaces.
- Less pastel wash, more crisp white and ink contrast.

### Integrated Status Dashboard

The status page should read as an operations overview:

- KPI cards become compact productivity widgets with strong numbers.
- Important distributions use restrained green/orange/ink accents.
- Long panels keep table-like density and clear section headings.
- No return of removed counters, meeting shortcuts, filter reset labels, or transcript segment counts.

### Agenda Integrated Search

Search should become the most app-like surface:

- A prominent command-style search block at the top.
- Result cards grouped by target, issue, legal basis, and disposition.
- Chipped metadata remains compact and scannable.
- Speaker and keyword filters stay removed.

### Meeting Transcript Lookup

The meeting view should feel like a meeting log workspace:

- Meeting selector and agenda list remain immediately visible.
- Agenda headings should be clear, colored, and stronger than ordinary utterances.
- Utterance cards should read as transcript log entries, with visual distinction between commissioners and secretariat or staff.
- Inline law references should be tappable chips that open the law drawer.
- The law drawer remains hidden until needed and should display legal content as a focused side panel.

### Commissioner Dashboard

Commissioner cards keep the single-column layout and large contained portraits:

- Current second-term members remain first.
- Chair, vice chair, and ex officio members get distinct but restrained accent treatment.
- Character images should remain fully visible without vertical cropping.
- Role, question style, representative question, affiliation, and activity metrics stay visible in one readable card system.

### Animation And Assistant

The animation view should inherit the same palette without changing behavior:

- Stage, timeline, and control surfaces use green/orange/ink accents.
- Scene timeline remains compact.

The assistant view should feel like a structured workspace panel:

- Inputs and generated outputs should use the same command/workbench treatment as search.
- It must remain a tool surface, not a marketing page.

## Implementation Constraints

- Prefer a CSS refresh over markup changes.
- If markup hooks are needed, keep them minimal and preserve existing test selectors.
- Do not add dependencies.
- Do not change data generation, Supabase sync, Korean law lookup, or transcript parsing.
- Keep the dashboard usable at narrow in-app browser width and normal desktop widths.
- Preserve accessibility basics: visible focus states, readable contrast, and button semantics.

## Verification

The implementation is complete only after:

- `npm.cmd test` passes in `pipc_dashboard`.
- `node --check app.js` passes.
- `node --check standalone.js` passes.
- `node --check src/renderers.mjs` passes.
- Browser smoke checks confirm the major tabs render without console errors.
- Visual checks confirm no obvious text overflow, portrait cropping, nested-card clutter, or law drawer overlap.

## Non-Goals

- No database schema changes.
- No new crawler or Supabase migration.
- No change to law article resolution.
- No landing page or marketing hero.
- No replacement of commissioner character assets.
