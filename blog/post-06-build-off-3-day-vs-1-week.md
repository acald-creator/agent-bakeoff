# 3-Day vs 1-Week — Post 6

*Same proposal, same agent, three budgets. The 1-day build shipped working-but-oversized code. This post covers the two longer budgets — and how the budget curve bends.*

---

The prediction going into Act 2 was a rough monotonic curve. More time ⇒ more polish ⇒ better adherence to the proposal ⇒ smaller, cleaner, better-built artifacts. A 1-day build would be an MVP; a 3-day build would hit most of the design; a 1-week build would look exactly like the proposal promised.

That prediction was wrong in a specific, informative way.

## The 3-day build

- **Budget:** ~90 min wall-clock, ~75 iterations
- **Actual:** 35 iterations, ~45 minutes
- **Status:** does not compile as delivered

The 3-day agent had time to do what the 1-day couldn't: implement vanilla-extract properly, wire the full design token system, add accessibility scaffolding (ARIA roles, `aria-selected`, `aria-live`, keyboard handlers, focus-visible rings throughout), tokenize the motion system with named duration/easing curves, and implement the mobile responsive sidebar the 1-day explicitly cut.

All of that is in the code. The agent's report enumerates it in detail.

The code also does not build.

Three independent mistakes, any one of which a single `pnpm install && pnpm build` pass would have surfaced:

### Mistake 1: non-existent version pin

```json
"@vanilla-extract/vite-plugin": "^4.0.21"
```

There is no 4.0.21. The max 4.x version published is 4.0.20. The current stable is 5.2.2. `pnpm install` fails in ten seconds with `ERR_PNPM_NO_MATCHING_VERSION`.

The agent probably started from a remembered or intuited version number. It didn't check.

### Mistake 2: `tokens.ts` is not a `.css.ts` file

Vanilla-extract's compiler only processes files matching the `.css.ts` pattern. That's how it knows which files to extract CSS from at build time. The agent named the design-tokens file `tokens.ts` and used `globalStyle()` and `createGlobalTheme()` inside it. The build fails with:

```
[vite-plugin-vanilla-extract] Styles were unable to be assigned to a file.
You may have created styles outside of a '.css.ts' context
```

The agent named every *other* vanilla-extract file correctly (`global.css.ts`). `tokens.ts` missing the `.css.ts` suffix reflects the file being written early, before the convention was front-of-mind — and then never revisited against a working build.

### Mistake 3: `selectors` inside `globalStyle()`

The agent used `selectors: { '&:hover': {...}, '&:active': {...} }` inside multiple `globalStyle()` calls. That `selectors` key is valid on vanilla-extract's `style()` function (which returns a generated class name) but *not* on `globalStyle()` (which takes a literal selector). Each hover/active/focus-visible variant needs to be its own `globalStyle('.foo:hover', {...})` call.

The build fails with:

```
[vite-plugin-vanilla-extract] Selectors are not allowed within "globalStyle"
```

Five or six `globalStyle()` call sites have this problem, each with 2–4 selectors. Fixing them would require splitting each call into multiple call sites — roughly 12 edits across `global.css.ts`.

### The orchestrator's patch budget

The methodology lets the orchestrator fix *trivial* install-blockers (a version pin typo). Restructuring the vanilla-extract API usage is different — that's rewriting the agent's code. I fixed mistake 1 (one-line change) and mistake 2 (rename + import update). I stopped at mistake 3.

The bundle was never measured. The 3-day build does not produce a `dist/` output with any configuration the orchestrator was willing to patch.

### What the agent thought it had

The final message the agent sent to the orchestrator included:

> Everything looks correct. The build is complete.

Both statements are structurally false. The agent had no way to verify either. It had written the code and reasoned about it file-by-file, but the cross-cutting errors (between `tokens.ts` and vanilla-extract's conventions, between `globalStyle()` and its actual API) were invisible to inspection.

This is the first sighting of the pattern that defines the rest of Act 2: **self-verification through reading code does not substitute for running it**. At 1-day the agent had no time to verify; at 3-day it had the time and used it on more code.

## The 1-week build

- **Budget:** ~4 hours wall-clock, ~150 iterations (effectively unlimited)
- **Actual:** 140 iterations, 18 minutes
- **Status:** doesn't pass the project's `tsc --noEmit && vite build` script; passes `vite build` alone after the same `tokens.ts` rename as the 3-day required
- **Measured bundle: 533 KB gzipped entry**

The 1-week run used ~18 minutes of wall-clock. Three hours and forty-two minutes of budget remained when the agent stopped. The agent's `build-notes.md` claims "~90 minutes of active writing + review" — which is not the wall-clock time, but rather what the agent felt the work took. (Agent wall-clock estimation is itself a topic we'll come back to in post 7.)

In those 18 minutes, the agent wrote 27 source files: three vanilla-extract stylesheets, a full design token system, multiple component files, 20 Vitest test assertions, and 7 Playwright e2e scenarios. It manually configured Rollup's `manualChunks` to split code between `solid`, `codemirror`, and `cm-language-data` bundles. It added a Cmd+N keyboard shortcut, F2-to-rename on sidebar items, a word count footer, relative dates on notes, and mobile responsive sidebar with a backdrop overlay.

The agent enumerated six items that "evolved beyond the proposal":

1. **Word count footer** — "not in the proposal. Added because (a) it costs ~5 lines, (b) writers universally want it, (c) it uses the `wordCount` signal that's already reactive."
2. **Relative date in sidebar items** — not in proposal, added as a `<time>` element for scannability.
3. **`inkHighlightStyle` using Lezer tags** — the proposal sketched markdown decoration via `.cm-header` class selectors. In CodeMirror 6's actual API, the correct approach is `HighlightStyle.define([{ tag: t.heading1, ... }])`. This is a correctness improvement over the proposal's sketched approach.
4. **Mobile responsive sidebar fully implemented** — the proposal treats this as a placeholder; 1-week wires the full slide-in/backdrop/hamburger behavior.
5. **`view.setState()` for history clearing on note switch** — cleaner atomic replacement than the proposal's sketched two-dispatch approach.
6. **`viewReady` signal for initial lifecycle ordering** — fixes a subtle Solid lifecycle issue (`createEffect` runs before `onMount`) that the proposal didn't account for.

Several of these are legitimate improvements. Items 3 and 6 are outright correctness fixes — the proposal was wrong about CodeMirror's API and didn't address a Solid lifecycle ordering issue. At 1-week budget, engaging with the proposal critically is appropriate, and the agent did.

None of those improvements help the code build.

### The 1-week build's failure pattern

The project's own build script is `tsc --noEmit && vite build`. The `tsc` step fails with 11 errors:

- **TS5097 × 5** — import paths that explicitly end in `.ts` or `.tsx`, which aren't allowed without the `allowImportingTsExtensions` tsconfig flag. Imports like `import { … } from '../design/tokens.css.ts'` should be `'../design/tokens.css'`.
- **TS2322 × 4** — SolidJS's `SvgSVGAttributes` type rejects `focusable="false"` on `<svg>` elements. The agent used it in 4 different component files.
- **TS2339 × 1** — `t.code` doesn't exist on Lezer's `tags` object. The agent referenced it in `extensions.ts` when setting up the markdown highlighter.
- **TS5097 × 1** — another import-path case.

None are structurally deep. All are the kind of thing a real engineer would see immediately, fix in 10 seconds each, and move on. The fact that the agent wrote 11 such errors and never noticed is the signal.

Bypassing `tsc` and running `vite build` alone also fails initially, with the same `tokens.ts` → `tokens.css.ts` vanilla-extract mistake the 3-day build made. After I renamed the file and updated four import paths (two in `../design/tokens` form, two in `./tokens` form), `vite build` succeeded.

### The measured bundle

After the rename patch, `vite build` produces a `dist/` output with these entry chunks, gzipped:

| Chunk | Gzipped |
|---|---|
| `index-C2C_Ib07.js` (entry) | 5.5 KB |
| `solid-ColDgmpT.js` | 5.4 KB |
| `codemirror-rXDgOxW3.js` | **529.3 KB** |
| `cm-language-data-Dzyvl2tO.js` | 3.7 KB |
| `index-BZ6t820i.css` | 2.3 KB |
| **Total entry gzipped** | **533.4 KB** |

The entire 529 KB codemirror chunk is eager — loaded from `dist/index.html`, no lazy barrier.

The agent estimated ~82 KB. The measured bundle is **6.5× the estimate and 6.5× the proposal's target.** It's also **2.4× larger than the 1-day build's 219 KB** — a build that took less than a tenth as many iterations to produce.

### What went wrong: `manualChunks`

The agent configured Rollup's `manualChunks` in `vite.config.ts` to group all CodeMirror packages into a single `codemirror-*.js` chunk. Intent: cleaner chunk graph, cache-friendlier build.

Effect: the full CM6 extension set — `basicSetup`, `@codemirror/view`, `@codemirror/state`, `@codemirror/lang-markdown`, `@codemirror/language`, `@codemirror/commands`, `@codemirror/search`, `@codemirror/autocomplete`, `@lezer/highlight`, and CodeMirror's own dependency tree — all got bundled into one synchronous chunk. Vite's default splitting would have fanned these across multiple smaller chunks, many of them lazy-loadable.

The agent took a perfectly reasonable optimization primitive (`manualChunks`) and used it to make the bundle worse.

## Side-by-side: the three-build grid

| Budget | Iterations / Time | Builds? | Entry bundle (gz) | vs ~82 KB target |
|---|---|---|---|---|
| **1-day** | 14 / 12 min | ✅ | 219 KB | 2.8× over |
| **3-day** | 35 / 45 min | ❌ | not measurable | — |
| **1-week** | 140 / 18 min | ⚠️ *after orchestrator rename* | 533 KB | 6.5× over |

The 1-day build is the only one that runs as delivered. The 3-day build doesn't run at all. The 1-week build, after a one-line orchestrator rename, runs with the largest bundle of the three.

**The budget curve is not monotonic in quality.**

## The repeat mistake

Both the 3-day and 1-week builds made the identical `tokens.ts` vs `tokens.css.ts` vanilla-extract mistake. Different agent contexts (each run gets a fresh subagent). Same mistake, same filename.

The extra budget (1-week had 140 iterations vs 3-day's 35) gave the agent no new insight into the convention. It just reproduced the same error against a larger code surface: the 1-week version had four consumers of `tokens` to break (vs. the 3-day's one).

This is an important finding in its own right. *Iteration headroom doesn't help an agent understand a tool it was going to misuse anyway.* What would help is running the tool and watching it fail. The 1-week agent had 3 hours 42 minutes of unused budget and spent none of it on that.

## Why "1-week" didn't feel like 1-week

The agent's self-report said "~90 minutes of active writing." The orchestrator's telemetry said 18 minutes of wall-clock. What's going on?

One plausible reading: the agent's sense of time is about cognitive load, not clock time. Writing 27 source files with tests, configs, design tokens, and thoughtful architecture decisions *feels* like a long task. That feeling isn't wrong — it's just not wall-clock.

The methodological consequence is that "1-week" never became 1-week in any meaningful sense. The agent stopped when it had written what it thought was the full proposal, not when it had spent its time budget. In `build-notes.md`:

> The 1-week budget allowed full implementation without cuts.

That's the wrong heuristic. "Full implementation" at a write-only pace takes less time than "full implementation with verification." The agent optimized for *completeness-by-inspection* and stopped as soon as that was achieved. Verification-headroom went unused because nothing in the agent's process pulled it in.

## What the three builds actually show

If you squint, there's a pattern.

At 1-day: the agent writes plain, safe code. It cuts things it can't verify (tests, mobile layout, full design system, confirmation dialogs). It picks the most-flexible-looking import for CodeMirror because it doesn't have time to think about what's minimal. It ships a bundle 2.8× over target.

At 3-day: the agent reaches for more-ambitious tools (vanilla-extract, full token system, motion primitives, accessibility primitives). It makes three independent API mistakes across those tools. It ships code that doesn't build.

At 1-week: the agent does everything the 3-day did, plus tests, plus manual chunk configuration, plus six "evolved beyond the proposal" items. It makes the same mistake as the 3-day agent (same file name, same error). It also makes 11 TypeScript errors and one elaborate misuse of `manualChunks`. It ships a bundle 6.5× over target, *after an orchestrator patch*.

The progression isn't about budget. It's about *whether the agent could see its own output against reality*. In Act 2's write-only mode, it couldn't. Post 7 is about what that means.

---

*Series: Post 6 of 8. Previous: [1-Day Build](post-05-build-off-day-1.md). Next: [What Time Pressure Does to LLM Code](post-07-what-time-pressure-does.md).*

*Full artifacts: [builds/1-day/](../builds/1-day/), [builds/3-day/](../builds/3-day/), [builds/1-week/](../builds/1-week/). Each has an agent's `build-notes.md` and an orchestrator's `orchestrator-notes.md`.*
