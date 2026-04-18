# orchestrator-notes.md — instrumented 1-week build (PARTIAL)

*Round 2 of Act 2. Feedback loop: subagent → orchestrator → subagent. This build did **not** reach a clean build within the iteration budget. The partial result is itself a finding.*

## Headline

**Build fails at vanilla-extract compilation.** After 4 rounds (~113 agent iterations, multiple orchestrator interventions including adding 2 direct dependencies), the delivered code still doesn't produce `dist/`. The agent's 20-file implementation is substantial — full design token system, custom Lezer HighlightStyle, `Compartment` pattern for reconfiguration, mobile sidebar, keyboard shortcuts, `prefers-reduced-motion` guards, 28 Vitest unit tests, 4 Playwright e2e tests — but a cross-cutting vanilla-extract scoping error proved resistant to the orchestrator-driven feedback loop at this budget.

## Three-build summary (instrumented Round 2)

| Budget | Iterations | Builds? | Bundle (gz) | vs Round 1 (write-only) |
|---|---|---|---|---|
| 1-day | 57 | ✅ | 236 KB | 219 KB (similar) |
| 3-day | 40 | ✅ | **216 KB** | didn't build |
| **1-week** | **113+** | **❌** | — | 533 KB after orchestrator rename |

**The instrumented curve is monotonically better than the write-only curve at 1-day and 3-day.** At 1-week, Round 1 built (after a fix) at 533 KB; Round 2 didn't build at all in the rounds available. This is not the clean monotonic result the post-7 hypothesis predicted — the hypothesis holds at the middle budget and breaks at the extremes.

## Rounds

### Round A (106 iterations — under-reported as "~38" by the agent)

Wrote 20 files across app, design, editor, lib, sidebar, tests, e2e. Applied all 4 major lessons from 1-day/3-day instrumented runs (tokens.css.ts naming, per-pseudo globalStyle, Compartment pattern, dynamic language-data). Added ambitious 1-week features: `HighlightStyle` with Lezer tags, Vite `resolve.alias` for transitive deps, 32 test assertions across unit + e2e.

Round A's `pnpm build`: failed with 2 TS errors (`@codemirror/language` and `@lezer/highlight` not found — transitive deps not declared).

### Round B (4 iterations)

Added tsconfig `paths` matching the Vite aliases to satisfy TypeScript. `tsc --noEmit` then passed. New error: `Property 'code' does not exist on type ... tags` — the same Lezer tags typo Round 1 1-week made.

### Round C (3 iterations)

Removed the `tags.code` rule (redundant with `tags.monospace`). Build still failed, this time at vanilla-extract compilation stage: `[vanilla-extract] Styles were unable to be assigned to a file` at `tokens.css.ts:7:59` / `global.css.ts:6:692`.

### Round D (5 iterations, BUT WORKED IN WRONG DIRECTORY)

Agent attempted to diagnose the vanilla-extract error. Claimed (incorrectly) that `vite.config.ts` had no `resolve.alias` block — in fact, 1-week's vite.config DOES have aliases, but the agent was reading files from the wrong directory (`3-day/`) and edited **3-day**'s `package.json`, not 1-week's. Orchestrator reverted 3-day's changes.

This is a real agent failure mode the series should note: **fresh-context subagents can mis-target directories when the prompt references multiple paths**. The prompt repeatedly said `1-week` but the agent's tool calls went to `3-day` — likely a path-tokenization slip in the agent's own process.

### Orchestrator intervention (without a new round)

Given Round D's failure to diagnose, the orchestrator did the investigation directly:

1. **Removed Vite aliases** from `vite.config.ts` (hypothesis: aliases confusing vanilla-extract's file-scope detection). Build failed — Rollup couldn't resolve `@codemirror/language` at all.
2. **Added `@codemirror/language` and `@lezer/highlight` as direct deps** in `package.json` (the principled fix — they're transitive but imported directly). Ran `pnpm install`.
3. **Re-removed tsconfig paths** (no longer needed with direct deps).
4. **Cleared Vite's pre-bundle cache**.
5. Rebuilt. **Still** failed at vanilla-extract: "Styles were unable to be assigned to a file."

The vanilla-extract error is NOT caused by the transitive deps or the Vite aliases. It's caused by something structural in the 1-week codebase that 3-day's codebase doesn't have. The orchestrator ran out of targeted diagnostic time.

## What we know about the vanilla-extract failure

- Error is at `tokens.css.ts:7:59` during `createGlobalTheme` evaluation
- Same `@vanilla-extract/compiler@0.1.3` as 3-day (which works)
- Same `@vanilla-extract/vite-plugin@4.0.20` as 3-day
- Same Vite 6
- `tokens.css.ts` content is structurally similar to 3-day's (diff shows mostly comment/naming changes)

The most likely remaining cause is something subtle about the module graph — maybe `global.css.ts` imports `tokens.css.ts` in a way that evaluates the file outside vanilla-extract's compiler context. Maybe one of the other new files (`extensions.ts`, `editor/theme.css.ts`) imports tokens.css.ts in a cycle. Diagnosing that would require several more rounds of instrumented iteration.

## Findings from a partial result

This is not the clean "hypothesis confirmed" result the post-7 prediction wanted. It's more nuanced:

1. **The feedback loop clearly helped at 3-day.** Round 1 3-day didn't build at all. Round 2 3-day built in 2 rounds at a smaller bundle size than either Round 1 or Round 2 1-day. That's a real monotonic improvement.

2. **The feedback loop ALSO produced real qualitative improvements at 1-day.** Round 2 1-day kept vanilla-extract (Round 1 1-day dropped it), shipped a full token system, and knew its actual bundle size.

3. **The feedback loop did NOT scale linearly to 1-week.** More budget + more ambition produced more code and more opportunities for cross-cutting config mistakes. The agent's 20-file implementation (more than 2× 3-day's 11 files) introduced new interaction patterns that the feedback loop's per-round structure couldn't resolve quickly.

4. **The orchestrator's willingness to modify deps matters.** Adding `@codemirror/language` and `@lezer/highlight` as direct deps unblocked one class of error. But the orchestrator couldn't unblock the vanilla-extract issue with similar glue — it would have required rewriting the agent's CSS architecture.

## What this means for post 8 (if written)

The honest post would be:

- **Instrumented mode helps** most clearly at the middle budget. 3-day benefited most visibly.
- **Instrumented mode's benefits are polish and build-reliability**, not bundle size. The bundle ceiling is set by the dep choices (meta-package barrel), which the methodology's "don't modify deps" rule keeps fixed.
- **At the largest budget, the failure modes change.** With enough code, individual errors compose into cross-cutting compiler issues that single-round fixes can't resolve. The feedback loop needs more rounds or deeper diagnostic tools (like stack-trace analysis) to work at scale.
- **Fresh-context subagents can mis-target directories.** Round D edited the wrong build dir despite the prompt saying `1-week` repeatedly. This is a real orchestration risk that warrants structural prevention (e.g., per-build settings scopes).

## Files

```
builds-instrumented/1-week/
├── package.json                Template + orchestrator added @codemirror/language and @lezer/highlight as direct deps
├── vite.config.ts              Template, currently with manualChunks removed, aliases removed
├── tsconfig.json               Template (paths entries for transitive deps were added and removed)
├── index.html                  Agent (Google Fonts preload)
├── playwright.config.ts        Agent
├── vitest.config.ts            Agent
├── node_modules/               Re-installed by orchestrator after adding deps (gitignored)
├── pnpm-lock.yaml              Updated (gitignored)
├── src/                        Agent (20 files across Rounds A–C)
│   ├── main.tsx, app/, design/, editor/, lib/, sidebar/, tests/
├── e2e/                        Agent (Playwright specs — not run because build failed)
├── dist/                       Does not exist (build never succeeded)
└── orchestrator-notes.md       This file
```

## Iteration accounting

- Round A: 106 (reported as "~38" by the agent — substantial under-reporting)
- Round B: 4
- Round C: 3
- Round D: 5 (wrong directory, no useful work)
- Orchestrator: ~10 file operations (revert, alias removal, dep add, cache clear, rebuild)
- **Total agent iterations: ~118** (vs. 150 budget; used 79%)
- **Final state: build fails**

Round 1's 1-week used 140 iterations and also did not build cleanly on first try (required orchestrator rename). Round 2 used fewer iterations but also did not reach a clean build — unlike Round 1 where a simple rename fixed it, Round 2's blocker is genuinely harder to diagnose.
