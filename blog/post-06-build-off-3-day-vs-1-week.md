# 3-Day vs 1-Week

The 1-week build produced a bundle 2.4x larger than the 1-day build's. The 3-day build didn't compile at all. That's the budget curve.

Going in, I expected a monotonic curve. More time → more polish → better adherence → smaller, cleaner artifacts. It didn't come out that way.

## The 3-day build

- Budget: ~90 min wall-clock, ~75 iterations.
- Actual: 35 iterations, ~45 minutes.
- Status: does not compile as delivered.

The 3-day agent had time to do what the 1-day couldn't. Eleven files got written. A full `tokens.css.ts` design token contract, full vanilla-extract global styles, the mobile responsive sidebar the 1-day cut, ARIA scaffolding (aria-selected, aria-live, keyboard handlers, focus-visible rings), a motion system tokenized with named duration and easing curves.

All of that is in the code. The code also doesn't build. Three independent mistakes, any one of which a single `pnpm install && pnpm build` pass would have surfaced.

### Mistake 1: non-existent version pin

```json
"@vanilla-extract/vite-plugin": "^4.0.21"
```

No 4.0.21 exists. Max 4.x is 4.0.20. Current stable is 5.2.2. `pnpm install` fails in ten seconds with `ERR_PNPM_NO_MATCHING_VERSION`. The agent probably started from a remembered or intuited version number and didn't check.

### Mistake 2: `tokens.ts` is not a `.css.ts` file

Vanilla-extract's compiler only processes files matching `.css.ts`. That's how it knows which files to extract CSS from at build time. The agent named the design-tokens file `tokens.ts` and used `globalStyle()` and `createGlobalTheme()` inside it. The build fails:

```
[vite-plugin-vanilla-extract] Styles were unable to be assigned to a file.
You may have created styles outside of a '.css.ts' context
```

The agent named every other vanilla-extract file correctly (`global.css.ts`). Missing `.css.ts` on `tokens.ts` reflects the file being written early, before the convention was front-of-mind, and never revisited against a working build.

### Mistake 3: `selectors` inside `globalStyle()`

The agent used `selectors: { '&:hover': {...}, '&:active': {...} }` inside multiple `globalStyle()` calls. The `selectors` key is valid on vanilla-extract's `style()` function (which returns a generated class name) but not on `globalStyle()` (which takes a literal selector). Each variant needs its own `globalStyle('.foo:hover', {...})` call. About 12 edits across `global.css.ts` would fix this.

### The orchestrator's patch budget

Methodology allows the orchestrator to fix trivial install-blockers (a version pin typo). Restructuring vanilla-extract API usage is different. That's rewriting the agent's code. I fixed mistake 1 (one line) and mistake 2 (rename + import update). Stopped at mistake 3.

The bundle was never measured. The 3-day build does not produce a `dist/` output with any configuration I was willing to patch.

### The agent's self-claim

Final message to the orchestrator:

> Everything looks correct. The build is complete.

Both statements structurally false. The agent had no way to verify either. First sighting of a pattern that defines the rest of Act 2. Self-verification through reading code does not substitute for running it.

## The 1-week build

- Budget: ~4 hours wall-clock, ~150 iterations.
- Actual: 140 iterations, 18 minutes wall-clock.
- Status: doesn't pass `tsc --noEmit && vite build`. Passes `vite build` alone after the same `tokens.ts` rename.
- Measured bundle: 533 KB gzipped entry.

18 minutes of 240 available. The agent's `build-notes.md` said "~90 minutes of active writing + review." The gap is real.

One plausible reading. The agent's sense of time is cognitive load, not clock time. Writing 27 source files feels long. It's not. The agent stopped when completeness-by-inspection was achieved, not when the budget ran out.

### What got written in 18 minutes

- 27 source files
- 3 vanilla-extract stylesheets
- Full design token system
- Manual `manualChunks` config in `vite.config.ts`
- Cmd+N keyboard shortcut, F2-to-rename on sidebar items
- Word count footer, relative dates on notes
- Mobile responsive sidebar with backdrop overlay
- 20 Vitest unit tests
- 7 Playwright e2e scenarios

### Six "evolved beyond the proposal" claims

Some real improvements, some not.

1. Word count footer. Costs ~5 lines, writers want it, uses an already-reactive signal.
2. Relative date in sidebar. Scannability.
3. `inkHighlightStyle` using Lezer tags. A correctness fix over the proposal's sketched approach.
4. Mobile responsive fully implemented. The proposal treated this as a placeholder.
5. `view.setState()` for history clearing. Cleaner than the proposal's two-dispatch sketch.
6. `viewReady` signal for initial lifecycle ordering. `createEffect` runs before `onMount`, and the proposal didn't address it.

Items 3 and 6 are outright correctness fixes. The proposal was wrong about CodeMirror's API and didn't address a Solid lifecycle ordering issue. At 1-week budget, engaging with the proposal critically is appropriate, and the agent did.

None of those improvements help the code build.

### The 1-week failure pattern

Project's build script is `tsc --noEmit && vite build`. `tsc` fails with 11 errors.

- TS5097 × 5. Import paths ending in `.ts` or `.tsx` without the `allowImportingTsExtensions` flag.
- TS2322 × 4. SolidJS's `SvgSVGAttributes` type rejects `focusable="false"` on SVG elements. Used in 4 component files.
- TS2339 × 1. `t.code` doesn't exist on Lezer's `tags` object. Referenced in `extensions.ts`.
- TS5097 × 1. Another import-path case.

None are structurally deep. All are the kind of thing a real engineer sees immediately, fixes in 10 seconds each, moves on. The agent wrote 11 such errors and never noticed.

Bypassing `tsc` and running `vite build` alone fails initially, with the same `tokens.ts` vs `tokens.css.ts` mistake the 3-day build made. After I renamed the file and updated four import paths, `vite build` succeeded.

### The measured bundle

| Chunk | Gzipped |
|---|---|
| `index.js` (entry) | 5.5 KB |
| `solid.js` | 5.4 KB |
| `codemirror.js` | 529.3 KB |
| `cm-language-data.js` | 3.7 KB |
| `index.css` | 2.3 KB |
| Total | 533.4 KB |

The 529 KB codemirror chunk is eager. Loaded from `dist/index.html`, no lazy barrier.

Agent estimated ~82 KB. Measured 533 KB. 6.5x the estimate, 6.5x the target, 2.4x the 1-day's 219 KB.

### What went wrong: `manualChunks`

The agent configured Rollup's `manualChunks` in `vite.config.ts` to group all CodeMirror packages into a single `codemirror-*.js` chunk. Intent: cleaner chunk graph, cache-friendlier build.

Effect: the full CM6 extension set (basicSetup, view, state, lang-markdown, language, commands, search, autocomplete, @lezer/highlight, and CodeMirror's own dep tree) got bundled into one synchronous chunk. Vite's default splitting would have fanned these across multiple smaller chunks, many lazy-loadable.

The agent took a perfectly reasonable optimization primitive (`manualChunks`) and used it to make the bundle worse.

## Three-build grid

| Budget | Iterations / time | Builds? | Entry bundle (gz) | vs ~82 KB target |
|---|---|---|---|---|
| 1-day | 14 / 12 min | yes | 219 KB | 2.8x over |
| 3-day | 35 / 45 min | no | not measurable | — |
| 1-week | 140 / 18 min | after orchestrator rename | 533 KB | 6.5x over |

The 1-day build is the only one that runs as delivered.

## The repeat mistake

Both the 3-day and 1-week builds made the identical `tokens.ts` vs `tokens.css.ts` mistake. Different fresh subagent contexts. No shared memory. Same filename, same vanilla-extract API error.

The 1-week agent had 4x the iteration budget and 10x the time budget of the 3-day agent. The extra budget produced no new insight into vanilla-extract's convention. It reproduced the same mistake against a larger code surface. The 1-week version had four consumers of `tokens` to break vs the 3-day's one.

Iteration headroom does not help an agent understand a tool it was going to misuse anyway. What would help is running the tool and watching it fail. The 1-week agent had 3 hours 42 minutes of unused budget and spent none of it on that.

## The pattern

At 1-day, the agent writes plain, safe code. It cuts things it can't verify. It picks the most-flexible-looking import because there's no time to think about what's minimal. Ships a bundle 2.8x over target.

At 3-day, the agent reaches for more ambitious tools (vanilla-extract, motion primitives, accessibility primitives). Makes three independent API mistakes. Ships code that doesn't build.

At 1-week, the agent does everything the 3-day did, plus tests, plus manual chunk configuration, plus six "evolved beyond" items. Same `tokens.ts` mistake as 3-day, 11 TS errors on top. Ships a bundle 6.5x over target, after an orchestrator patch.

The progression isn't about budget. It's about whether the agent could see its own output against reality. In Act 2's write-only mode, it couldn't. Post 7 is about what that means.

Full artifacts in the repo: [builds/1-day/](https://github.com/acald-creator/agent-bakeoff/tree/main/builds/1-day), [builds/3-day/](https://github.com/acald-creator/agent-bakeoff/tree/main/builds/3-day), [builds/1-week/](https://github.com/acald-creator/agent-bakeoff/tree/main/builds/1-week). Each has an agent `build-notes.md` and an orchestrator `orchestrator-notes.md`.

Next: [What Time Pressure Does to LLM Code](post-07-what-time-pressure-does.md).
