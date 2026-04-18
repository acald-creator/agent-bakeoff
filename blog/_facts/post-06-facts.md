# post-06 facts-only skeleton

*Source material for rewriting "3-day vs 1-week" (the two longer budgets, side-by-side with 1-day). NOT for publication.*

---

## What this post must establish

1. The 3-day build does NOT compile as delivered.
2. The 1-week build compiles only after an orchestrator rename fix; final bundle is 533 KB gzipped (2.4× *worse* than the 1-day's 219 KB).
3. The budget curve is NOT monotonic in quality — more time produced worse bundles, not better.
4. The same specific `tokens.ts` mistake recurred across 3-day and 1-week despite fresh subagent contexts — evidence that extra budget doesn't teach API conventions the agent was going to misuse.

## Going-in prediction (stated plainly before results)

Before Act 2: more time ⇒ more polish ⇒ better adherence to proposal ⇒ smaller, cleaner, better-built artifacts. Monotonic curve.

**That prediction was wrong in a specific, informative way.**

## The 3-day build

- **Budget:** ~90 min wall-clock, ~75 iterations
- **Actual:** 35 iterations, ~45 minutes
- **Status: does not compile as delivered**

### What the 3-day agent did right

Wrote 11 files including:
- Full `tokens.css.ts` design token contract
- Full vanilla-extract global styles
- Mobile responsive sidebar (the 1-day explicitly cut this)
- ARIA scaffolding: `aria-selected`, `aria-live`, keyboard handlers, focus-visible rings
- Motion system tokenized with named duration/easing curves

All of that is in the code. The code also doesn't build.

### The three independent 3-day mistakes

Each one would be caught by a single `pnpm install && pnpm build` pass:

1. **Non-existent version pin:** `@vanilla-extract/vite-plugin@^4.0.21`. Max published 4.x is 4.0.20; current stable is 5.2.2. `pnpm install` fails in ten seconds with `ERR_PNPM_NO_MATCHING_VERSION`.

2. **`tokens.ts` is not a `.css.ts` file.** Vanilla-extract's compiler only processes `.css.ts` files. Agent named the design-tokens file `tokens.ts` and used `globalStyle()` / `createGlobalTheme()` inside it. Build fails:
   ```
   [vite-plugin-vanilla-extract] Styles were unable to be assigned to a file.
   You may have created styles outside of a '.css.ts' context
   ```
   Agent named every *other* vanilla-extract file correctly (`global.css.ts`). Missing `.css.ts` on `tokens.ts` reflects the file being written early, before the convention was front-of-mind.

3. **`selectors` inside `globalStyle()`.** Agent used `selectors: { '&:hover': {...}, '&:active': {...} }` inside `globalStyle()`. That key is valid on vanilla-extract's `style()` but NOT on `globalStyle()` — which takes a literal selector. Each variant needs its own `globalStyle('.foo:hover', {...})` call. ~12 edits across `global.css.ts` would fix this.

### Orchestrator's patch budget

Methodology allows orchestrator to fix *trivial* install-blockers (a version pin typo). Restructuring vanilla-extract API usage is different — that's rewriting the agent's code.

Fixed #1 (one-line change) and #2 (rename + import update). Stopped at #3.

**Result: build never produces `dist/` with any configuration the orchestrator was willing to patch. Bundle never measured for 3-day.**

### The agent's self-claim at 3-day

Final message to orchestrator:
> "Everything looks correct. The build is complete."

Both statements structurally false. Agent had no way to verify either.

**First sighting of the pattern:** self-verification through reading code does not substitute for running it.

## The 1-week build

- **Budget:** ~4 hours wall-clock, ~150 iterations
- **Actual:** 140 iterations, 18 minutes wall-clock
- **Status: doesn't pass `tsc --noEmit && vite build`; passes `vite build` alone after the same `tokens.ts` rename**
- **Measured bundle: 533 KB gzipped entry**

### The wall-clock gap

Agent used 18 min of 240 min available. Agent's `build-notes.md` said "~90 minutes of active writing + review."

One plausible reading: agent's sense of time is cognitive load, not clock time. Writing 27 source files *feels* long. It's not.

**Agent stopped when completeness-by-inspection was achieved, not when budget ran out.**

### What the 1-week agent wrote

In 18 minutes:
- 27 source files
- 3 vanilla-extract stylesheets
- Full design token system
- Manual `manualChunks` config in `vite.config.ts`
- Cmd+N keyboard shortcut, F2-to-rename on sidebar items
- Word count footer, relative dates on notes
- Mobile responsive sidebar with backdrop overlay
- 20 Vitest unit tests
- 7 Playwright e2e scenarios

### Six "evolved beyond the proposal" items the 1-week agent claimed

Some legitimate, some dubious:

1. Word count footer — costs ~5 lines, writers want it, uses already-reactive signal. Legit.
2. Relative date in sidebar — scannability. Legit.
3. `inkHighlightStyle` using Lezer tags — correctness FIX over proposal's sketched approach. Real.
4. Mobile responsive fully implemented (proposal treated as placeholder). Legit.
5. `view.setState()` for history clearing (proposal's sketch used two dispatches). Correctness improvement.
6. `viewReady` signal for initial lifecycle ordering — `createEffect` runs before `onMount`; proposal didn't address. Correctness fix.

**Items 3 and 6 are outright correctness fixes — proposal was wrong about CodeMirror's API and didn't address a Solid lifecycle ordering issue.**

### The 1-week failure pattern

Project's build script: `tsc --noEmit && vite build`. `tsc` fails with 11 errors:

- **TS5097 × 5** — import paths ending in `.ts` or `.tsx` without `allowImportingTsExtensions` flag
- **TS2322 × 4** — SolidJS's `SvgSVGAttributes` type rejects `focusable="false"` on SVG elements (used in 4 component files)
- **TS2339 × 1** — `t.code` doesn't exist on Lezer's `tags` object (in `extensions.ts`)
- **TS5097 × 1** — another import-path case

None are structurally deep. All are the kind of thing a real engineer sees immediately, fixes in 10 seconds each, moves on. **Agent wrote 11 such errors and never noticed.**

### Bypassing tsc: vite build alone

Initially fails with the SAME `tokens.ts` vs `tokens.css.ts` mistake the 3-day build made.

After orchestrator's rename patch + 4 import updates, `vite build` succeeds.

### The measured bundle

533 KB gzipped entry. Breakdown:
- `index.js` (entry): 5.5 KB
- `solid.js`: 5.4 KB
- `codemirror.js`: **529.3 KB** ← the defect
- `cm-language-data.js`: 3.7 KB
- `index.css`: 2.3 KB

**The entire 529 KB codemirror chunk is eager** (loaded from `dist/index.html`, no lazy barrier).

Agent estimated ~82 KB. Measured 533 KB. **6.5× the estimate and 6.5× the proposal's target. Also 2.4× larger than the 1-day build's 219 KB — a build that took less than a tenth as many iterations to produce.**

### What went wrong at 1-week: `manualChunks`

Agent configured Rollup's `manualChunks` in `vite.config.ts` to group all CodeMirror packages into a single `codemirror-*.js` chunk. Intent: cleaner chunk graph, cache-friendlier build.

Effect: full CM6 extension set (basicSetup, view, state, lang-markdown, language, commands, search, autocomplete, @lezer/highlight + CM's own dep tree) all got bundled into one synchronous chunk. Vite's default splitting would have fanned these across multiple smaller chunks, many lazy-loadable.

**Agent took a perfectly reasonable optimization primitive (`manualChunks`) and used it to make the bundle worse.**

## Side-by-side grid

| Budget | Iterations / time | Builds? | Entry bundle (gz) | vs ~82 KB target |
|---|---|---|---|---|
| **1-day** | 14 / 12 min | ✅ | 219 KB | 2.8× over |
| **3-day** | 35 / 45 min | ❌ | not measurable | — |
| **1-week** | 140 / 18 min | ⚠️ *after orchestrator rename* | **533 KB** | 6.5× over |

The 1-day build is the only one that runs as delivered.

## The repeat mistake

3-day and 1-week both made the identical `tokens.ts` vs `tokens.css.ts` mistake. Different fresh subagent contexts. Same filename, same vanilla-extract API error.

1-week had 4× the iteration budget and 10× the time budget of 3-day. **Extra budget produced no new insight into vanilla-extract's convention.** 1-week version had four consumers of `tokens` to break vs 3-day's one.

> **Iteration headroom does not help an agent understand a tool it was going to misuse anyway.** What would help is running the tool and watching it fail. The 1-week agent had 3 hours 42 minutes of unused budget and spent none of it on that.

## The pattern plainly stated

- **At 1-day:** agent writes plain, safe code. Cuts things it can't verify (tests, mobile layout, full design system). Picks most-flexible-looking import because no time to think about what's minimal. Ships bundle 2.8× over target.
- **At 3-day:** agent reaches for more-ambitious tools (vanilla-extract, motion primitives, accessibility primitives). Makes 3 independent API mistakes. Ships code that doesn't build.
- **At 1-week:** everything 3-day did, plus tests, plus manual chunk config, plus 6 "evolved beyond the proposal" items. Same tokens.ts mistake as 3-day. 11 TS errors. Ships bundle 6.5× over target, after orchestrator patch.

**The progression isn't about budget. It's about whether the agent could see its own output against reality.** In Act 2's write-only mode, it couldn't.

## What the current post does that's load-bearing

- Presents the three mistakes at 3-day as independent (any one would be caught; all three compound)
- Names `manualChunks` specifically as the 1-week bundle culprit
- Explicitly says the budget curve is not monotonic (doesn't hedge)
- Ends with the "it's about whether the agent could see its own output against reality" line as the Act 2 claim

## What the current post does that's NOT load-bearing (drop freely)

- Long stretches of the 1-week agent's self-reported cuts list (can be linked to notes files)
- "If you squint, there's a pattern" transition — AI-rhythm
- "Restating plainly" / "stated plainly" — AI-rhythm repeater
- The "~90 minutes of active writing" wall-clock explanation (one sentence is enough)

## Numbers / specifics worth landing somewhere

- 3-day: 35 iter / 45 min / didn't build / 3 independent API mistakes
- 1-week: 140 iter / 18 min (not 90 as self-reported) / builds after rename / 533 KB / 11 TS errors
- 1-day bundle: 219 KB
- Proposal target: 82 KB
- 1-week bundle multiple vs 1-day: 2.4×
- 1-week bundle multiple vs target: 6.5×
- Unused 1-week wall-clock budget: 3 hr 42 min
- Same `tokens.ts` mistake across 3-day and 1-week: 2 independent occurrences

## Hook the current prose uses (for reference)

Current opener: "The prediction going into Act 2 was a rough monotonic curve..." Announce-prediction-then-break AI-rhythm. Find your own on-ramp — maybe lead with the "18 minutes, not 90" misreport, or the two identical mistakes, or the 1-week bundle being larger than the 1-day one.
