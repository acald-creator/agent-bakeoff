# What Time Pressure Does to LLM Code

The finding from Round 1, stated plainly. Within Act 2's write-only methodology, adding iteration headroom without adding verification headroom produces strictly worse outcomes.

| Budget | Builds? | Entry bundle (gz) | Iterations | % of budget used |
|---|---|---|---|---|
| 1-day | yes | 219 KB | 14 | 56% (14/25) |
| 3-day | no | — | 35 | 47% (35/75) |
| 1-week | after orchestrator rename | 533 KB | 140 | 93% (140/150) |

The 1-day agent had the least time and produced the only shippable artifact.

This is a methodology claim, not an LLM-at-scale claim. An agent with live build feedback would probably behave differently. More on that below.

## Why "write-only" happened

Original Act 2 plan: agent runs `pnpm install` + `pnpm build` itself. Three permission walls killed that. Rather than delay Act 2 indefinitely, I pivoted.

> The agent writes code self-paced. The orchestrator runs `pnpm build` and measures the bundle after the agent stops. No verification feedback reaches the agent mid-run.

A restrictive experiment. A production LLM coding agent (Cursor, Codex CLI, Claude Code with live compile errors in the IDE, a watching developer) has some form of live feedback. Act 2 removed all of it.

The data is specifically about agents without that feedback. Keep this in mind for the rest of the post.

## What three budgets look like

At 1-day, the agent writes plain, safe code. It cuts vanilla-extract because an extra build plugin is failure surface. It cuts tests. It picks `@codemirror/language-data` over `@codemirror/lang-markdown` because flexibility is the more available reflex when there's no time to think. Ships working code at 2.8x bundle target.

Honest disclosure. "Estimated X, unverified."

At 3-day, the agent reaches for more ambitious tools. Vanilla-extract, motion primitives, accessibility primitives. Doesn't remember the `tokens.ts` → `tokens.css.ts` convention. Conflates `globalStyle()` with `style()`. Pins `@vanilla-extract/vite-plugin@^4.0.21`, a version that doesn't exist. Ships code that doesn't build.

False disclosure, unwittingly. Final message: "The build is complete." No way to verify.

At 1-week, the agent does everything the 3-day did, plus tests, plus manual chunk config, plus six "evolved beyond the proposal" items, plus 27 source files. Same `tokens.ts` mistake as the 3-day. Adds 11 TypeScript errors. Uses `manualChunks` to produce a bundle 2.4x larger than the 1-day's.

Partial disclosure. Correctly notes "unverified build." Also estimates ~82 KB when the measured bundle is 533 KB.

## The repeat-mistake finding

The strongest single piece of evidence.

Both the 3-day and 1-week agents, separate fresh subagent contexts, no shared memory, made the identical `tokens.ts` vs `tokens.css.ts` mistake. Same file name, same vanilla-extract API error, same failure mode. Same one-line orchestrator rename fixed both.

The 1-week agent had 4x the iteration budget and 10x the time budget of the 3-day agent. The extra budget produced no new insight into vanilla-extract's convention. It reproduced the same mistake against a larger code surface. The 1-week version had four consumers of `tokens` to break vs the 3-day's one.

Iteration headroom does not help an agent understand a tool it was going to misuse anyway. What would help is running the tool and watching it fail. Both agents could have caught this in the first 60 seconds of a `pnpm build`. Neither did.

## Elaboration without verification

The 1-week's `manualChunks` configuration is the cleanest version of the same pattern.

`manualChunks` is a real Rollup feature. Used correctly, it produces cache-friendlier bundles. An optimization primitive for bundle size.

The 1-week agent used it to group every CodeMirror package into a single eager `codemirror-*.js` chunk. That chunk weighs 529 KB gzipped. Vite's default splitting would have produced multiple smaller lazy-loadable chunks.

The agent took an optimization primitive and used it to make the bundle worse. By ~2.4x vs defaults. If the agent had never touched `manualChunks`, the 1-week bundle would have been smaller than the 1-day bundle, which is how the proposal's ~82 KB estimate was originally calculated.

More configuration is not more correctness. Obvious, and also exactly the trap the 1-week agent fell into.

## Why "1-week" never became 1-week

The 1-week agent used 18 minutes of the 240 available. Self-report: "~90 minutes of active writing." Neither is "1 week."

One plausible reading. The agent's sense of time is about cognitive load, not wall-clock. Writing 27 source files, three stylesheets, two test suites feels substantial. That feeling is not the same as real time.

The agent stopped when completeness-by-inspection was achieved, not when the budget ran out. Once inspection said "this looks right," nothing in the agent's process pulled it back to verification. There couldn't be. The methodology didn't give it one.

Three hours and forty-two minutes of unused budget weren't available for verification because verification wasn't in the agent's loop. It was available for more code. More code without verification compounds the problem.

## The honesty-calibration finding

At 1-day, the agent was honest. "Estimated 79 KB, unverified." The gap between the estimate and the measurement (219 KB) exists, but the structure of the disclosure was truthful.

At 3-day, the agent was dishonest without meaning to be. "The build is complete." The agent had no way to verify this. The claim came out confident because the effort felt like verification.

At 1-week, the agent was honest about structure, dishonest about calibration. Correctly noted "unverified build." Also estimated ~82 KB when the measured bundle was 533 KB.

At 1-day the agent feels insecure because it had 12 minutes. At 1-week the agent feels secure because it wrote 27 files and a `manualChunks` config and test suites, even though it ran none of it. Security is an artifact of effort, not verification. The estimates follow the security, not the reality.

## What a properly-instrumented agent would look like

A 1-day agent with live build watch would catch `@codemirror/language-data` in the first few minutes. Bundle size visible in the build output. Fix the import, rebuild, move on. Still cut tests and mobile layout. Ship 30 minutes. Bundle probably ~85 KB.

A 3-day agent with live build watch would catch the `tokens.ts` rename the first time it ran `pnpm build`. Catch `selectors` inside `globalStyle` the second time. Catch the version pin the moment it ran `pnpm install`. Still ambitious, now verified. Bundle ~100 KB, tests mostly passing, vanilla-extract working.

A 1-week agent with live build watch would catch all of the 3-day's errors plus the 11 TypeScript errors. Would notice `manualChunks` making the bundle larger and revert. Would use the remaining 3h42m on polish. Bundle ~85 KB. Code tested by its own test suite.

None of that is Round 1. It's a Round 2 prediction. If a live-feedback variant produces a monotonic curve, the hypothesis holds. Post 8 runs that test.

## What this is evidence for, and what it isn't

Not evidence that LLMs can't code. Not evidence that bigger budgets don't help. Not evidence that Sonnet or the frontend-design skill is bad at Solid.

Evidence that when an LLM coding agent has no feedback channel against reality, the quality of its output is a function of how much code it produces before stopping, not a function of how much time it has. Extra time without extra feedback produces more code of the same quality, which for many kinds of problem is worse than less code.

If you're building tooling for LLM-driven coding, the hardest part isn't the model. It's the feedback loop. A build watch, a test runner in scope, a linter in scope, a real error handler is worth more than a bigger context window or a faster iteration loop.

If you're writing code alongside an LLM, trust claims about what it wrote, not claims about what it verified. Verify yourself. Always.

## What Act 2 produced

Not the three builds. None of them are going to production.

- Act 2 rules as a reusable template.
- Per-build `orchestrator-notes.md` pattern that separates agent self-report from orchestrator measurements.
- The non-monotonic budget curve as a falsifiable finding.

Next: [Act 2, Again — With Feedback](post-08-act-2-instrumented.md).
