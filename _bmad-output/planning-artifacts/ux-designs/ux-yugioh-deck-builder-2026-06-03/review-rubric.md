# Spine Pair Review — Yu-Gi-Oh! Deck Builder

## Overall verdict

The spine pair is structurally well-organized and reads clearly, but two critical gaps prevent clean source-extraction by downstream consumers: DESIGN.md has zero YAML frontmatter design tokens (all values live in prose/tables), and visual reference files (2 JPGs in `imports/`) are orphaned with no inline links from either spine. Component coverage is split unevenly between the spines, and no flow documents a failure path. The pair is usable for a human reader but requires significant inference from a machine consumer.

## 1. Flow coverage — adequate

All 4 PRD UJs (UJ-1–UJ-4) have corresponding Key Flows with named protagonist, numbered steps, and a climax beat. 3 additional flows (Import, Sort, Clear) cover features not tied to a named UJ — acceptable coverage.

### Findings
- **critical** No flow has a failure path paragraph (the example shows a `Failure:` section after climax). Every flow should document at least one error/edge path. (EXPERIENCE.md § Key Flows, Flows 1–7). *Fix:* Append a `Failure:` paragraph to each flow. Flow 5 (Import) partially mitigates this by showing error handling inline in step 3.
- **low** Flow 5 title doesn't include a UJ reference (unlike Flows 1–4 which use `(UJ-N)` in the heading). (EXPERIENCE.md:152). *Fix:* Add `(FR-15)` or note it's an extended flow.

## 2. Token completeness — broken

DESIGN.md has **zero** YAML frontmatter design tokens. The `design-md-spec.md` requires `colors`, `typography`, `rounded`, `spacing`, and `components` as machine-readable frontmatter entries. Every value is embedded in prose tables instead. No `{path.to.token}` references appear anywhere in the body.

### Findings
- **critical** No `colors`, `typography`, `rounded`, `spacing`, or `components` frontmatter tokens. Downstream consumers cannot source-extract any design value programmatically. (DESIGN.md frontmatter, lines 1–7). *Fix:* Migrate all color values to a `colors:` YAML object in frontmatter; add `typography:`, `rounded:`, `spacing:`, `components:` objects with kebab-case keys and hex values. Use `{colors.primary}` references in prose body.
- **critical** Color tokens in body tables are flat CSS variable names (`--background`, `--foreground`) rather than semantic design tokens (`colors.background`, `colors.foreground`). Light/dark pairs exist but are not structured for resolution. (DESIGN.md:25–55). *Fix:* Define `colors.background-light`, `colors.background-dark` (or `colors.surface-base`, `colors.surface-base-dark`) in frontmatter.
- **high** Zone-specific colors (Main/Extra/Side backgrounds) reference CSS variables and phrases like "tinted `--primary`" — not machine-resolvable. (DESIGN.md:57–64). *Fix:* Define as named tokens (`colors.zone-main`, `colors.zone-extra`, `colors.zone-side`) with explicit hex pairs.

## 3. Component coverage — adequate

DESIGN.md lists 6 components; EXPERIENCE.md lists 12. Seven components in EXPERIENCE.md have no corresponding visual spec in DESIGN.md.

### Findings
- **high** Components in EXPERIENCE.md.Component Patterns with no DESIGN.md row: Search Input, Create Deck Button, Cover Image Upload, Save Button, Clear Button, Sort Button, Delete Button. (EXPERIENCE.md:46–57; compare DESIGN.md:112–120). *Fix:* Add rows to DESIGN.md.Components for each. At minimum document size, color tokens, and state appearances.
- **medium** Naming mismatch: DESIGN.md says "Search Result", EXPERIENCE.md says "Search Result Row". (DESIGN.md:117, EXPERIENCE.md:47). *Fix:* Unify to one name across both files.
- **medium** DESIGN.md "Deck Card (library)" vs EXPERIENCE.md "Deck Card (Library)" — parenthetical capitalization differs. (DESIGN.md:116, EXPERIENCE.md:50). *Fix:* Normalize.
- **low** Theme Toggle behavioral note says "Top-right of header" — this is layout, not behavior. (DESIGN.md:119). *Fix:* Move placement info to Layout section; keep behavioral rules (light/dark/system toggle, localStorage persistence) in the behavioral column.

## 4. State coverage — adequate

16 states documented across all 4 IA surfaces. Good coverage of loading, empty, in-progress, success, and failure states.

### Findings
- **medium** No error/network-failure state for Card Search or Deck Library. Both surfaces make API calls that could fail. (EXPERIENCE.md § State Patterns). *Fix:* Add "Search error" (Toast on API failure) and "Library load error" (inline error with retry button).
- **low** No "Zone full" rejection has visual feedback — noted as assumption but left unresolved. (EXPERIENCE.md:68). *Fix:* Add `border-destructive` flash on drop rejection (or commit to the assumption with a deferred note).
- **low** No "Deck name edit" state documented. Creating a deck shows a dialog, but inline rename in Deck Library is unaddressed. (EXPERIENCE.md § State Patterns). *Fix:* Add if v1 supports it, or explicitly scope out.

## 5. Visual reference coverage — broken

Two files exist in `imports/` (Screen_1.jpg, Screen_2.jpg) with zero references from either spine. No `mockups/` or `wireframes/` directories exist.

### Findings
- **critical** Screen_1.jpg and Screen_2.jpg are orphaned — neither DESIGN.md nor EXPERIENCE.md mentions or links to them inline. (imports/ directory). *Fix:* Add inline references in the relevant sections. For example, link Screen_1.jpg in the Layout & Spacing section of DESIGN.md to illustrate the three-panel layout.
- **critical** No "spine wins on conflict" statement exists anywhere in either file. (Both spines). *Fix:* Add a line at the top of EXPERIENCE.md's Foundation section: "→ Wireframes in imports/: Screen_1.jpg, Screen_2.jpg. Spine wins on conflict."
- **high** No wireframes/ or mockups/ directories at all. The decision-log notes "User-supplied draw.io wireframes imported to imports/" but the spines don't acknowledge them. (.decision-log.md:11–12). *Fix:* Rename `imports/` to `wireframes/` for clarity, or add a note about the directory structure.

## 6. Bloat & overspecification — strong

No significant bloat. Prose is lean and purposeful. No persona restatements, no decorative narrative untied to decisions. Tables are used appropriately. Do's and Don'ts are tight.

### Findings
- **info** No findings — this is the strongest category. The pair is clean and avoids overspecification.

## 7. Inheritance discipline — thin

Sources resolve partially; glossary and naming discipline have gaps. Token inheritance is broken because DESIGN.md has no tokens.

### Findings
- **critical** `sources` frontmatter uses `{planning_artifacts}` as an unresolved variable in both files. (DESIGN.md:5, EXPERIENCE.md:5). *Fix:* Replace `{planning_artifacts}` with the relative path `../prds/prd-yugioh-deck-builder-2026-06-03/prd.md`, or define the variable resolution mechanism in a README.
- **high** No glossary in either spine. PRD has a detailed glossary (§3). (DESIGN.md, EXPERIENCE.md). *Fix:* Copy the PRD glossary verbatim into a Glossary section in both spines, or add a reference: "See PRD §3."
- **high** EXPERIENCE.md never references DESIGN.md tokens by `{path.to.token}` name because no tokens exist to reference. This breaks the cross-reference contract. (EXPERIENCE.md, entire file). *Fix:* After adding frontmatter tokens to DESIGN.md, update EXPERIENCE.md to reference them (e.g., `{colors.primary}` instead of repeating hex).
- **medium** Component naming not fully consistent between spines (see §3 findings). (Both spines). *Fix:* Pass to align all component names.
- **low** FR numbers (FR-3, FR-6) are cited in EXPERIENCE.md component patterns but not systematically. No FR mapping to components. (EXPERIENCE.md:97, 102). *Fix:* Add a `Requires` column to Component Patterns or include FR numbers systematically.

## 8. Shape fit — strong

DESIGN.md sections are in the canonical order specified by `design-md-spec.md`. All 8 sections present. EXPERIENCE.md has all required default sections.

### Findings
- **info** Dropped defaults defensible: Responsive & Platform omitted because app is explicitly desktop-only (1200px min-width). Inspiration & Anti-patterns omitted — defensible for a hobby tool with clear domain conventions.
