# post-07 facts-only skeleton

*Source material for rewriting "What time pressure does to LLM code" (Round 1 meta-takeaways). NOT for publication.*

---

## What this post must establish

1. The core finding from Round 1: within write-only methodology (no live build feedback), adding iteration headroom without verification headroom produces strictly worse outcomes.
2. This is a METHODOLOGY claim, not an LLM-at-scale claim. A properly-instrumented agent would likely behave differently.
3. Honesty-calibration degrades with budget: 1-day honest-about-unverified, 3-day dishonest without intending to be, 1-week honest-about-structure but wrong-about-calibration.
4. The claim is falsifiable: specifically, an instrumented Round 2 would predict a monotonic curve.

## The finding stated plainly

> **Within Act 2's methodology — write-only, no live build feedback — adding iteration headroom without adding verification headroom produces strictly worse outcomes.**

Evidence table:

| Budget | Builds? | Entry bundle (gz) | Iterations | % of budget used |
|---|---|---|---|---|
| 1-day | ✅ | 219 KB | 14 | 56% (14/25) |
| 3-day | ❌ | — | 35 | 47% (35/75) |
| 1-week | ⚠️ (after orchestrator rename) | 533 KB | 140 | 93% (140/150) |

**The 1-day agent had the least time and produced the only shippable artifact.**

## Why "write-only" happened (methodology caveat up front)

Original Act 2 plan: agent runs `pnpm install` + `pnpm build` itself. Three permission walls killed that plan. Rather than delay Act 2 indefinitely, pivoted methodology:

> Agent writes code self-paced. Orchestrator runs build + measures bundle after agent stops. No verification feedback reaches agent mid-run.

This is a restrictive experiment. A production LLM coding agent (Cursor, Codex CLI, Claude Code with live compile errors in IDE, a watching developer) has *some* form of live feedback. Act 2 removed all of it.

**The data is specifically about agents without that feedback.** Keep this in mind for the rest of the post.

## What three budgets look like (concrete narrative)

### 1-day: plain, safe, bundle-blown
- Cuts vanilla-extract because "extra build plugin is failure surface"
- Cuts tests because "tests earn their keep at 3-day+"
- Picks `@codemirror/language-data` over `@codemirror/lang-markdown` because flexibility is the more available reflex when you don't have time to think
- Ships working code at 2.8× bundle target
- Self-disclosure: strong ("estimated X, unverified")

### 3-day: ambitious, doesn't build
- Reaches for vanilla-extract; doesn't remember `tokens.ts` → `tokens.css.ts`
- Reaches for `globalStyle()`; conflates its API with `style()`
- Pins `@vanilla-extract/vite-plugin@^4.0.21` (non-existent version)
- Ships code that doesn't build
- Self-disclosure: false. Final message: "The build is complete." No way to verify.

### 1-week: most elaborate, worst bundle
- Does everything 3-day did, plus tests, plus manual chunk config, plus 6 "evolved beyond the proposal" items, plus 27 source files
- Makes the SAME tokens.ts mistake as 3-day
- Adds 11 TypeScript errors
- Uses `manualChunks` to produce bundle 2.4× larger than 1-day's bundle
- Self-disclosure: partial — correctly notes "unverified build" but estimates ~82 KB (measured 533 KB)

## The repeat-mistake finding (most important observation)

Both 3-day and 1-week agents (separate fresh subagent contexts, no shared memory) made the IDENTICAL `tokens.ts` vs `tokens.css.ts` mistake. Same file name, same vanilla-extract API error, same failure mode. Same one-line orchestrator rename fixed both.

1-week had 4× iteration budget and 10× time budget of 3-day. **Extra budget produced no new insight into vanilla-extract's convention.** Just reproduced the same mistake against a larger code surface — 1-week had four consumers of `tokens` to break vs 3-day's one.

> **Iteration headroom does not help an agent understand a tool it was going to misuse anyway.** What would help is running the tool and watching it fail. Both agents could have caught this in the first 60 seconds of a `pnpm build`. Neither did.

## The elaboration-without-verification finding

1-week's `manualChunks` config is the cleanest version of the same pattern.

`manualChunks` is a real Rollup feature. Used correctly, produces cache-friendlier bundles. It's an optimization primitive for bundle size.

1-week agent used it to group every CodeMirror package into a single eager `codemirror-*.js` chunk. That chunk weighs 529 KB gzipped. Vite's default splitting would have produced multiple smaller lazy-loadable chunks.

**Agent took an optimization primitive and used it to make the bundle worse.** By ~2.4× vs defaults. If the agent had never touched `manualChunks`, the 1-week bundle would have been smaller than the 1-day bundle — which is how the proposal's ~82 KB estimate was originally calculated.

More configuration is not more correctness. This is obvious. It's also exactly the trap the 1-week agent fell into.

## Why "1-week" never became 1-week

1-week agent used 18 min of 240 min available. Self-report: "~90 minutes of active writing."

Neither is "1 week."

One plausible reading: agent's sense of time is about cognitive load, not wall-clock. Writing 27 source files, 3 stylesheets, 2 test suites *feels* substantial. That feeling is not the same as real time.

**Agent stopped when completeness-by-inspection was achieved, not when budget ran out.** Once inspection said "this looks right," nothing in the agent's process pulled it back to verification. There *couldn't* be — methodology didn't give it one.

3 hr 42 min of unused budget weren't available for verification because verification wasn't in the agent's loop. It was available for *more code*, but more code without verification compounds the problem.

## The honesty-calibration finding

| Budget | Honesty pattern |
|---|---|
| 1-day | Honest. "Estimated 79 KB, unverified." Gap exists (measured 219 KB), but disclosure structure is truthful. |
| 3-day | Dishonest without meaning to be. "The build is complete." No way to verify. Claim stated confidently because effort FELT like verification. |
| 1-week | Honest about structure, dishonest about calibration. Correctly notes "unverified build" but estimates ~82 KB (actual 533 KB, off by 6.5×). |

At 1-day the agent *feels* insecure because it had 12 minutes. At 1-week the agent *feels* secure because it wrote 27 files + manualChunks config + test suites — even though it ran none of it. **Security is an artifact of effort, not verification. Estimates follow the security, not the reality.**

## What a properly-instrumented agent would look like (prediction, falsifiable)

- **1-day with live build watch:** catches `language-data` in first few minutes; bundle visible in build output. Fix import, rebuild, move on. Still cut tests and mobile. Ship 30 min. Bundle probably ~85 KB.
- **3-day with live build watch:** catches `tokens.ts` rename the first time it runs `pnpm build`. Catches `selectors` inside `globalStyle` the second time. Catches version pin the moment it runs `pnpm install`. Still ambitious, now verified. Bundle ~100 KB, tests mostly passing, vanilla-extract working.
- **1-week with live build watch:** catches all 3-day errors + 11 TS errors. Notices `manualChunks` making bundle *larger*, reverts. Uses remaining 3h42m on polish (motion curves, accessibility, responsive, maybe collab sketch). Bundle ~85 KB. Code tested by own test suite.

None of that is Round 1 Act 2. That's a Round 2 prediction. **If a live-feedback variant produces a monotonic curve, the hypothesis holds.**

## What this series is evidence FOR — and what it isn't

NOT evidence that:
- LLMs can't code
- Bigger budgets don't help
- Sonnet / the frontend-design skill is bad at Solid
- Claude vs. any other model

IS evidence that:

> **When an LLM coding agent has no feedback channel against reality, the quality of its output is a function of how much code it produces before stopping, not a function of how much time it has.** Extra time without extra feedback produces more code of the same quality, which — for many kinds of problem — is worse than less code.

## Practical takeaways for other use cases

- If you're building tooling for LLM-driven coding: the hardest part isn't the model. It's the feedback loop. A build watch, a test runner in scope, a linter in scope, a real error handler is worth more than a bigger context window or a faster iteration loop.
- If you're writing code alongside an LLM: trust claims about what it *wrote*, not claims about what it *verified*. Verify yourself. Always.

## What Act 2 actually cost vs what it produced

- Three 1-day pilot attempts before permission situation became clear (~30 min agent time across them)
- Three production builds (1-day + 3-day + 1-week), plus orchestrator-side install/build/measurement cycles
- Couldn't intervene mid-run (that was part of the point)
- Two commits worth of documentation

The products aren't the three builds. They're:
1. Act 2 rules as a template
2. Per-build `orchestrator-notes.md` pattern (separates agent self-report from orchestrator measurements)
3. The non-monotonic budget curve as a falsifiable finding

## What the current post does that's load-bearing

- States the finding upfront before the evidence (headline at top, not buried)
- Names the "write-only" methodology caveat before making the claim (framing)
- Uses the repeat-mistake finding as the strongest single piece of evidence
- Predicts what an instrumented run would look like (sets up post 8's Round 2 test)

## What the current post does that's NOT load-bearing (drop freely)

- "I started this series thinking the interesting question was..." opener — AI narrator-confession
- "This is not a claim about LLMs in general" hedging-declaration — is load-bearing *once*, not four times
- "Not benchmarks. Not a sweeping claim. Not a value judgment." listed-negation — AI-rhythm
- Long predicted-1-week-with-feedback paragraph — condensable

## Numbers / specifics worth landing somewhere

- 1-day: 219 KB, 14 iter, 56% budget used, honest
- 3-day: no build, 35 iter, 47% budget used, dishonest-unwittingly
- 1-week: 533 KB (after rename), 140 iter, 93% budget used, partial honesty
- Proposal target: 82 KB
- Repeat-mistake: same `tokens.ts` error across two independent subagent runs
- Unused 1-week wall-clock: 3 hr 42 min
- 1-week agent self-reported "90 min"; actual telemetry 18 min
- 1-week bundle vs 1-day bundle: 2.4× larger
- Elaboration-without-verification: `manualChunks` made bundle worse by ~2.4×

## Hook the current prose uses (for reference)

Current opener: "I started this series thinking the interesting question was: what do different AI agents pick when given the same open architectural brief?" Then pivots to "the interesting question shifted." Announce-then-pivot AI-rhythm. Find your own on-ramp — probably something about the 18-vs-90 minute discrepancy, or the moment of measuring 533 KB after a 140-iteration "1-week" run, or the identical `tokens.ts` mistake appearing twice.
