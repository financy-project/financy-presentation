---
name: figma-fidelity
id: figma-fidelity
version: 1.0.0
type: design
---

# Skill: Figma Fidelity

Extract a complete, numeric design spec from a Figma node and cross-reference every value
against this repo's actual tokens/components/icons — instead of eyeballing a screenshot —
so implementation gaps don't reach review.

This skill exists because of a real incident: the PM-006 register screen shipped, then took
**three separate rounds** of manual correction (colors, then sizing/spacing, then component
architecture) even though the full Figma spec was fetched on the first pass. The data was
there; it wasn't checked exhaustively before/after implementation. This skill makes that
checking mandatory and mechanical instead of relying on judgment calls under time pressure.

## Usage

```bash
/figma-fidelity <figma-url-or-node-id>
```

Run it:
- Before implementing any screen/component from a Figma link (proactively, not just when asked)
- Automatically as part of `/feature-plan`'s Component Blueprint step, whenever `spec.md`
  contains a `figma.com` link
- Standalone, after the fact, to audit an already-implemented screen against its Figma source

## Process

### 1. Extract full context — never skip any of these three calls

- `get_design_context` on the target node — reference code, hints, and a screenshot. This is
  necessary but **not sufficient**: it tells you what to build, not whether you built it right.
- `get_variable_defs` on the same node — determines whether values are bound to real Figma
  variables (design tokens) or are literal pixels/hexes. Either way, the value is still the
  spec — a literal `48px` is not "less real" than a token, it just means there's no named
  variable to preserve, so don't skip mapping it just because `get_variable_defs` comes back
  empty.
- `get_screenshot` at a high `maxDimension` for any node whose fidelity you'll eyeball later —
  a screenshot compressed to fit context easily hides 8–16px discrepancies.

### 2. Build the spec table before writing any code

For every distinct element (not just the ones that look novel), record:

| Element | Size (w×h) | Padding | Gap | Radius | Border (color+width) | BG color | Text color | Font (weight/size/line-height) | Icon (exact asset name) |
|---|---|---|---|---|---|---|---|---|---|

Do this exhaustively. A shadcn/DS default "looking about right" is a hypothesis, not a fact,
until it's checked against this row. Skipping a row for an element that resembles an existing
component is exactly how the register screen's 32px-vs-48px input height went unnoticed.

**Preserve the nesting**, not just the leaf values. Figma auto-layout groups spacing
hierarchically (e.g. a 16px gap between fields inside an "Inputs" group, then a 24px gap from
that whole group to the submit button). Flattening this into one uniform gap on the outer
container is a common, easy-to-miss mistake — match the DOM nesting to the Figma group nesting.

### 3. Map every value to this repo's tokens — don't approximate

- **Colors**: grep `src/index.css` for the closest custom property (`--gray-400`,
  `--color-gray-400`, etc.) and use the exact Tailwind utility (`text-gray-400`) — not a
  semantic alias (`text-muted-foreground`, `text-foreground`) unless you've confirmed the alias
  resolves to the *exact same* hex in the current theme. Check the value, don't assume "muted"
  means "the muted color in the design" — in this codebase `muted-foreground` is gray-500,
  which is wrong for a spec that calls for gray-400 or gray-600.
- **Spacing/sizing**: map px values to the Tailwind spacing scale (4px increments: `gap-2`=8px,
  `px-4`=16px, `h-12`=48px, ...). Figma auto-layout export sometimes yields odd values (e.g.
  `p-[33px]`) from rounding — treat these as intent (≈32px) and map to the clean scale value,
  don't skip mapping just because it isn't a round number.
- **Typography**: font-family is almost always already `font-sans` (Inter) globally — check
  `src/index.css`'s `@apply font-sans` before assuming you need to set it per-element. What
  actually varies node-to-node is weight/size/line-height/color — verify each of those four
  independently; a matching font-weight does not imply a matching color.
- **Icons**: the Figma layer/asset name (e.g. `imgIconEyeClosed`) is a strong hint at the exact
  `lucide-react` export name. Verify it actually exists — `node_modules/lucide-react` or
  `Object.keys(require('lucide-react'))` — before substituting a "close enough" icon. A closed
  eye and a slashed eye are different icons with different meaning; don't let `EyeOff` stand in
  for `EyeClosed` just because both read as "hide password."

### 4. Check existing components against the spec table — don't force-fit defaults

- For every element, check whether an existing `src/components/ui/*` primitive/variant already
  matches **all** of size/padding/gap/radius/text-size from the spec table — not just the ones
  that are visually obvious.
- If nothing matches (e.g. Figma wants a 48px CTA button and `Button`'s largest size is 36px),
  that's a **gap in the component library**, not a reason to accept the closest existing
  default. Either:
  1. add a new size/variant to the existing shared primitive (preferred when it's a sizing/style
     difference — e.g. adding `Button`'s `xl` size), or
  2. extract a new DS primitive under `src/components/ui/` when it's a recurring *composition*
     (e.g. `TextInput` for label+icon+input+error, appears 3+ times) — check `docs/features/PM-005-base-component`
     first to confirm it's genuinely missing rather than named differently.
- Never render at the wrong size/spacing because "it looked right in the screenshot" — reduced
  resolution and lack of a side-by-side hides exactly this class of gap.

### 5. Post-implementation verification (mandatory, not optional)

Run the app and pull real computed values in the browser for at least one instance of each
element type in the spec table:

```js
const el = document.querySelector('...')
const r = el.getBoundingClientRect()
const cs = getComputedStyle(el)
;({ w: r.width, h: r.height, padding: cs.padding, gap: cs.gap, border: cs.border,
    fontSize: cs.fontSize, color: cs.color })
```

Diff these against the spec table row by row. A visual screenshot match is necessary but not
sufficient — a 32px element next to a 48px one can look "about the same size" in a scaled-down
screenshot. Only report a screen as Figma-aligned once every row in the spec table has a
verified numeric match, or a documented, deliberate deviation (state it explicitly and why).

## Known blind spots this skill exists to close

From the PM-006 register screen incident — each of these caused a separate correction round:

1. Semantic color aliases (`text-muted-foreground`) silently resolving to the wrong gray shade.
2. Component defaults (button/input height, gap) never checked against literal Figma pixels.
3. Nested auto-layout gap groups flattened into one uniform gap.
4. Icon chosen because it "reads the same" instead of matching the exact asset/layer name.
5. A recurring composition (icon+label+input+error) implemented ad hoc per screen instead of
   extracted into a reusable component once.

## Output

- A design spec table — paste it into `plan.md`'s Component Blueprint as a "Figma Fidelity"
  subsection when run from `/feature-plan`, or keep it as scratch notes for a standalone fix.
- A concrete list of: new/changed component variants needed, exact token classes to use, exact
  icon names to import.
- Post-implementation verification results (row-by-row match, or documented deviations).

## See Also

- `/feature-plan` — invokes this skill automatically when `spec.md` contains a Figma link, and
  folds its spec table into the Component Blueprint
- `docs/architecture/dor.md` — Component Blueprint requires this skill's output whenever the
  feature has a Figma reference
- CLAUDE.md's "Design system (Figma)" section — where the resulting tokens/components live
