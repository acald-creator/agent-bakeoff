# orchestrator-notes.md — 1-week build

*Notes from outside the agent's perspective. The agent's own self-report is in [build-notes.md](build-notes.md). This file records what the orchestrator did, observed, or had to compensate for.*

## Headline

The 1-week build had **four hours of wall-clock budget and ~150 iterations of tool budget, and used 18 minutes of wall-clock with 140 iterations.** It delivered 26 source files including Vitest tests, Playwright e2e tests, manual chunk config, three vanilla-extract stylesheet files, a full design token system, and thorough accessibility scaffolding.

The delivered code **does not pass the project's own build script** (`tsc --noEmit && vite build`). After a one-line orchestrator fix (the same `tokens.ts` → `tokens.css.ts` rename as the 3-day build needed), the code compiles under `vite build` alone. Bypassing `tsc` reveals 11 TypeScript errors across 6 files.

**Measured entry bundle: 533 KB gzipped — 6.5× the ~82 KB proposal target and 2.4× worse than the 1-day build's 219 KB.**

The larger budget did not produce a smaller, more polished, or better-verified artifact. It produced a more elaborate one with the same verification gap.

## Agent self-report summary

- ~35 tool calls (agent's count), 140 by the orchestrator's telemetry (difference likely: reads/greps not counted, vs all tool calls)
- ~18 minutes wall-clock (agent said "90 minutes of active writing"; actual agent-loop time was 18 min)
- Estimated ~82 KB gzipped (stated as "in line with the proposal target")
- Claimed the code is "written to be correct but has not been executed"
- Enumerated six items "evolved beyond the proposal" — word count footer, relative dates, `HighlightStyle` over class-selectors, mobile responsive sidebar, `view.setState()` for history clearing, `viewReady` signal for lifecycle ordering

## What the orchestrator did

1. Ran `pnpm install` in `builds/1-week/`. **Succeeded** in 13.5 seconds, no version-pin issues.
2. Ran `pnpm build` (the project's script is `tsc --noEmit && vite build`). **Failed at tsc:** 11 errors across 6 files:
   - 5× TS5097 — explicit `.ts`/`.tsx` extensions in import paths without `allowImportingTsExtensions`
   - 4× TS2322 — SolidJS's `SvgSVGAttributes` type rejects `focusable` attribute on SVG elements
   - 1× TS2339 — `t.code` property doesn't exist on Lezer's `tags` object
   - 1× on `Editor.tsx` — another TS5097
3. Ran `pnpm exec vite build` alone (bypassing tsc). **Failed:** same `tokens.ts` not a `.css.ts` file error the 3-day build hit.
4. Patched: renamed `src/design/tokens.ts` → `src/design/tokens.css.ts`, updated imports in 4 consumers (2× `../design/tokens`, 2× `./tokens`). Re-ran `pnpm exec vite build`. **Succeeded.**
5. Measured entry bundle from `dist/`:
   ```
   assets/index-C2C_Ib07.js            5.5 KB gzipped
   assets/solid-ColDgmpT.js            5.4 KB gzipped
   assets/codemirror-rXDgOxW3.js     529.3 KB gzipped  ← dominant
   assets/cm-language-data-Dzyvl2tO.js 3.7 KB gzipped
   assets/index-BZ6t820i.css           2.3 KB gzipped
                                       ──────────
   Total entry (gzipped):            533.4 KB
   ```

## The findings, ranked by time-pressure signal strength

1. **Repeat of the `tokens.ts` mistake from the 3-day build.** The exact same conceptual error, in the exact same file name, made by the same agent lens on a different run. The extra budget gave the agent no new insight into vanilla-extract's `.css.ts` convention; it just reproduced the error against a larger code surface. Strong signal that budget alone doesn't fix class-of-error mistakes.

2. **Manual chunk config in `vite.config.ts` made the bundle worse, not better.** The agent configured Rollup's `manualChunks` to group `codemirror` packages into a single chunk, then loaded that chunk from the entry HTML. Default Vite splitting would have produced many smaller chunks with lazy loading. The agent's elaboration *increased* the initial-load size instead of decreasing it. This is the textbook "more configuration is better" fallacy — at the 1-week budget, the agent reached for optimization primitives it didn't fully understand.

3. **11 TypeScript errors the agent never saw.** The project's own build script does `tsc --noEmit` first. None of the TS errors are deep — 5 are literal `.ts`/`.tsx` extensions in imports, 4 are `focusable` on SVG elements, 1 is a mis-referenced Lezer tag name. All would have been surfaced by typing `pnpm build` once. The agent never typed it.

4. **Tests that were written but never run.** 20 Vitest assertions plus 7 Playwright scenarios. The Vitest tests might work (the source files they test — `search.ts`, `persistence.ts` — don't have the TS errors that block the app files). The Playwright tests would fail because the app can't run. The agent enumerated these as evidence of polish without recognizing that polish-without-execution is wallpaper.

## What's observable from outside

- **The self-correctness loop broke at scale.** At 1-day, the agent wrote straightforward code that mostly worked. At 3-day, the extra code produced 3 independent build-breaking mistakes. At 1-week, the pattern continued and *expanded*: more code, more dependencies (11 CodeMirror/Lezer packages vs 1-day's 5), more config, more tests — and more unverified edges.

- **"Evolved beyond the proposal" is mostly real.** The word count footer, relative dates, `HighlightStyle` approach, mobile responsive sidebar, and `viewReady` signal are all legitimate improvements. In some cases (e.g., `HighlightStyle` over the proposal's class-selector approach) the agent correctly identified that the proposal was inaccurate about CM6's actual API.

- **The Cmd+N shortcut, F2 rename, debounced search, keyboard navigation, and ARIA throughout are substantially better than 1-day's sketched accessibility.** When the code works, the 1-week version is a demonstrably more finished product.

- **The 15-minute human fix gap.** With the `tokens.ts` rename + the 11 TS errors fixed (all mechanical) + the manualChunks config removed, this build would likely produce a bundle near the proposal's ~82 KB target. The agent had 3 hours 42 minutes of unused wall-clock budget. It used none of it on verification.

## Three-budget summary

| Budget | Builds? | Entry bundle (gz) | Notes |
|---|---|---|---|
| 1-day | ✅ | 219 KB | Wrong CM6 import (`language-data` over `lang-markdown`), 2.8× over target |
| 3-day | ❌ | — | 3 independent vanilla-extract / version-pin mistakes; doesn't compile |
| 1-week | ⚠️ (after orchestrator fix) | **533 KB** | Same `tokens.ts` mistake as 3-day; 11 TS errors; manual chunk config made it 6.5× over target |

The budget curve is **not monotonic in quality**. 1-day was the only build that ran as delivered. 3-day didn't build at all. 1-week built after a rename fix but with a larger bundle than 1-day.

## The meta-finding

All three builds share the same root cause: *the agent had no feedback loop against reality*. The 1-day was cheapest and shipped working-but-oversized code. The 3-day was ambitious and shipped non-building code. The 1-week was most elaborate and shipped non-building code at 2.4× the size of the working 1-day build.

If there is a single takeaway for post 7, it's this: **within the range of budgets we tested, adding iteration headroom without adding verification headroom produces strictly worse outcomes**. The 1-week agent had four hours of wall-clock it could have spent running `pnpm build` twice an hour and watching where the errors pointed. It spent the headroom on code instead.

This is not a claim about LLMs at scale. It's a claim about *this bakeoff's methodology*. Act 2's permission issues forced a "write-only" mode on the subagents, and the resulting data is about how LLMs behave when their only feedback channel is their own inspection. A properly-instrumented agent with a live build watch would produce different artifacts and different findings. The Act 2 rules, as adjusted, measure a specific and narrower thing: what happens when self-verification is all the agent has.

## Fix path (for reference, not applied)

To make 1-week actually ship:

1. Rename `src/design/tokens.ts` → `src/design/tokens.css.ts` and update 4 imports (**done by orchestrator** to enable measurement).
2. Remove explicit `.ts`/`.tsx` extensions from 5 import paths.
3. Use a type assertion or cast for `focusable="false"` attributes on SVG elements (4 places), or omit the attribute.
4. Replace `t.code` with the correct Lezer tag name for inline code (likely `t.literal` or use `monospace`).
5. Remove the `manualChunks` configuration from `vite.config.ts` and let Vite/Rollup do default splitting.
6. Rebuild and re-measure. Expected bundle: ~85–100 KB gzipped (close to 1-day's target, with the design-system weight as the main delta).

Estimated human fix time: ~20 minutes. Not done here because the value of Act 2 is measuring the delivered artifact, not the orchestrator-rescued one.

## Files at this build

```
builds/1-week/
├── package.json                    Agent
├── vite.config.ts                  Agent (manual chunk config that hurts bundle size)
├── tsconfig.json                   Agent
├── vitest.config.ts                Agent
├── playwright.config.ts            Agent
├── index.html                      Agent
├── src/                            Agent (tokens.ts renamed to tokens.css.ts by orchestrator; 4 imports updated)
├── e2e/                            Agent (Playwright tests; would fail because app doesn't run)
├── build-notes.md                  Agent
├── orchestrator-notes.md           Orchestrator (this file)
├── pnpm-lock.yaml                  Generated by `pnpm install` (post-patch)
├── node_modules/                   Generated by `pnpm install` (gitignored)
└── dist/                           Generated by `pnpm exec vite build` (post-rename; gitignored)
```
