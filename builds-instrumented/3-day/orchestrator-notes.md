# orchestrator-notes.md — instrumented 3-day build

*Round 2 of Act 2. Feedback loop: subagent → orchestrator → subagent. Orchestrator runs all builds out-of-band.*

## Headline

**216 KB gzipped entry bundle. Builds clean. 40 agent iterations across 2 rounds.** Slightly smaller than instrumented 1-day's 236 KB — first evidence of a monotonic curve in instrumented mode.

## Comparison grid

|  | Round 1 (write-only) | Round 2 (instrumented) |
|---|---|---|
| 1-day | 219 KB gz, builds | 236 KB gz, builds, +vanilla-extract |
| **3-day** | **Doesn't build** (3 independent API mistakes) | **216 KB gz, builds, full polish** |
| 1-week | 533 KB gz (with orchestrator rename) | TBD |

The 3-day cell flipped from "didn't build at all" to "builds clean, ships design system, mobile sidebar, keyboard nav, focus states." That's a big qualitative shift.

## Rounds

### Round A (37 iterations)

Wrote 11 files in one pass:
- `src/design/tokens.css.ts` — `createGlobalTheme(':root', {...})` full token contract (colors, fonts, spacing, motion, z-index)
- `src/design/global.css.ts` — reset, app shell layout, mobile sidebar `@media` overlay, `:focus-visible` ring
- `src/sidebar/sidebar.css.ts` + `Sidebar.tsx` — note list with search, arrow/Enter/Space/Delete keyboard nav, ARIA `listbox`/`option`
- `src/editor/editor.css.ts` + `Editor.tsx` — CodeMirror 6 with `Compartment`-based reconfiguration, `@codemirror/language-data` dynamic import, 400ms debounced save
- `src/lib/id.ts`, `src/lib/persistence.ts`, `src/app/store.ts`, `src/app/App.tsx`, `src/main.tsx`
- `vite.config.ts` — removed `manualChunks` codemirror grouping

**All four major learned lessons from the 1-day instrumented run were applied**:
- `tokens.css.ts` suffix (not `.ts`)
- Separate `globalStyle()` per pseudo-variant (not `selectors` key inside `globalStyle`)
- `Compartment` pattern for dynamic reconfiguration (not `EditorState.reconfigure`)
- Dynamic import for `language-data`; no direct `@codemirror/language` import
- manualChunks removed

Round A's `pnpm build` result: **tsc --noEmit passed (zero TS errors — big step up from Round 1's 11 errors)**. `vite build` failed at vanilla-extract compilation with `Invalid selector: &:hover [data-delete-btn]`.

### Round B (3 iterations)

Vanilla-extract's `style()` requires `selectors` to target `&` only; descendant selectors like `&:hover [data-delete-btn]` aren't allowed (that would cross-style another element). Fixed with the **parent-selector form** `${noteItem}:hover &` moved to the delete button's own `style()`. Two-line fix.

Round B's `pnpm build`: **succeeded**. Entry bundle **216.4 KB gzipped**.

## Bundle composition

Entry chunks from `dist/index.html`:

| Chunk | Gzipped |
|---|---|
| `index-BbjzGIDv.js` | 214.2 KB |
| `solid-ImX80alS.js` | 5.4 KB |
| `index-IJLD7B5e.css` | 1.9 KB |
| **Total** | **216.4 KB** |

Plus 113 lazy chunks (language-data language parsers, dynamic-imported).

The 214 KB entry is dominated by the `codemirror` meta-package barrel — same ceiling the 1-day instrumented run hit. To get under this requires adding `@codemirror/basic-setup` (or similar sub-packages) to `package.json` and re-installing, which the methodology forbids.

## What 3-day bought vs 1-day (instrumented)

Same bundle ceiling (meta-package barrel). Different polish level:

- 3-day added: full `createGlobalTheme` token contract, mobile sidebar with overlay + backdrop + hamburger, keyboard nav on sidebar items (Enter/Space/arrow/Delete), ARIA roles, `:focus-visible` ring, CSS transitions via named duration tokens
- 1-day had: plain global styles, basic sidebar, no keyboard nav, no mobile layout

## Feedback-loop observations

- Lessons from 1-day carried cleanly into 3-day even though each subagent is a fresh context. The lessons came via **the prompt**, not subagent memory.
- The agent's self-reported "tsc --noEmit is clean" was technically true (tsc passed) but misleading in context (vite build still failed). Agent-level self-verification remains unreliable even in instrumented mode.
- Round B's fix was the narrowest possible (2 edits, 3 tool calls total). Instrumented mode makes these tight fix-passes possible because the error is specific.
- The remaining bundle distance to target (216 → 82 = 134 KB) is structural, not fixable without dep changes.

## Iteration accounting

- Round A: 37 iterations
- Round B: 3 iterations
- **Total: 40 iterations** (vs. 75-iteration 3-day budget; used 53%)
- Round 1 3-day used 35 iterations but produced non-building code

## Files

```
builds-instrumented/3-day/
├── package.json            Template (unmodified)
├── vite.config.ts          Template (manualChunks removed by Round A)
├── tsconfig.json           Template
├── index.html              Template + Google Fonts preload added by Round A
├── node_modules/           Pre-installed (gitignored)
├── pnpm-lock.yaml          Pre-generated (gitignored)
├── src/                    Agent (11 files across 2 rounds)
│   ├── main.tsx, app/, design/, editor/, lib/, sidebar/
├── dist/                   Orchestrator build output (gitignored)
└── orchestrator-notes.md   This file
```

build-notes.md from agent perspective not written for same reason as 1-day: the 2-round structure didn't have a natural "agent writes final notes" checkpoint.
