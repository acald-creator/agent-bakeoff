# Act 2, Again — With Feedback

Round 2 ran the same three budgets with a feedback loop wired in. 1-day built. 3-day built smaller than 1-day. 1-week didn't build.

Post 7 predicted that with live feedback, the budget curve would straighten. Partially right, partially wrong. A sweet-spot finding.

## The setup

Permissions resisted direct subagent access to `pnpm install` + `pnpm build` no matter how the allowlist was framed. After four permission walls, I settled on a different design. The agent writes code and stops. The orchestrator runs `pnpm build` and captures the output. I spawn a fresh subagent for each round with the build output in the prompt.

The user made a sharp observation while we were setting this up. This is exactly the loop the user was running with me. Each turn, user directs, I work, I report, user reacts. The instrumented Round 2 applies the same three-layer structure to subagents.

Fresh subagents each round. The orchestrator passes prior code state (agent can read files) and build output (in the prompt). No subagent has memory of prior rounds beyond what's in the prompt. Similar to how a human uses an LLM in chat. Context-to-date in context, nothing before.

## The three instrumented builds

| Budget | Rounds | Iterations | Builds? | Entry bundle (gz) | vs Round 1 (write-only) |
|---|---|---|---|---|---|
| 1-day | 4 | 57 | yes | 236 KB | 219 KB (similar) |
| 3-day | 2 | 40 | yes | 216 KB | didn't build |
| 1-week | 4+ | 113+ | no | — | 533 KB after orchestrator rename |

The curve is monotonic at 1-day and 3-day. It breaks at 1-week.

## 1-day instrumented

Four rounds, 57 iterations total.

Round A wrote 10 files, including vanilla-extract. First verified build succeeded on the first try. The agent preemptively flagged `manualChunks` as a potential defect.

Round B removed `manualChunks`, converted `@codemirror/language-data` from static to dynamic import, and used `StateEffect.reconfigure`. That triggered 2 TS errors.

Round C fixed them with a `Compartment` pattern and an `any`-typed `LanguageDescription`.

Round D investigated the final bundle and made a marginal fix.

Final: 236 KB gzipped entry. Round 1's 1-day was 219 KB. Slightly larger.

Why larger? The Round 2 agent kept vanilla-extract and implemented a full design token system that Round 1's 1-day dropped for simplicity. The feedback loop bought quality, not compactness.

## 3-day instrumented

Two rounds, 40 iterations total.

Round A wrote 11 files. Full token system, mobile responsive sidebar, keyboard nav, `:focus-visible` ring, accessibility scaffolding. Every lesson from the 1-day instrumented run carried over via the prompt, not subagent memory. The prompt listed "here are the mistakes a prior instrumented 1-day run made; don't make them." `tokens.css.ts` suffix, separate `globalStyle()` per pseudo-variant, `Compartment` pattern, dynamic language-data. All applied correctly.

Round A build: `tsc --noEmit` passed. Zero TS errors, a step up from Round 1's 1-week at 11. `vite build` failed at vanilla-extract's compiler with a descendant-selector error.

Round B fixed it in three tool calls. Moved the descendant selector from the parent's `style()` to the child's `style()` using the `${parent} &` form.

Round B build succeeded. Entry bundle 216 KB gzipped.

Smaller than 1-day instrumented (236 KB). First time in any Act 2 budget comparison, more budget + feedback produced a smaller bundle.

## 1-week instrumented

Four rounds, 113+ iterations, multiple orchestrator interventions. Doesn't build.

Round A wrote 20 files. App + `HighlightStyle` with Lezer tags + `prefers-reduced-motion` + `aria-live` + `Cmd+N`/`Escape` shortcuts + 28 Vitest unit tests + 4 Playwright e2e tests + mobile sidebar with overlay. Also added Vite `resolve.alias` for `@codemirror/language` and `@lezer/highlight` because pnpm's strict layout wouldn't hoist these.

First build: 2 TS errors. Aliases satisfied Vite at runtime but TypeScript doesn't read Vite aliases.

Round B added tsconfig `paths` to match.

Round C fixed a Lezer tag typo (`tags.code` doesn't exist).

Then vanilla-extract started failing with "Styles were unable to be assigned to a file" at `tokens.css.ts:7:59`.

Round D was supposed to fix that. It worked in the wrong directory. Despite the prompt naming `1-week` repeatedly, the agent's tool calls went to `3-day/`. It edited the wrong `package.json`. The orchestrator had to revert 3-day's changes before any further progress.

At that point I stopped spawning rounds and did the investigation directly. Removed the Vite aliases, added `@codemirror/language` and `@lezer/highlight` as direct deps, ran `pnpm install`, removed the tsconfig paths, cleared Vite's pre-bundle cache. The vanilla-extract error persisted.

3-day uses the same compiler, same vite-plugin, same structural patterns. It works. 1-week's 20-file implementation introduces some cross-cutting interaction the compiler can't scope. Diagnosis would require several more rounds or deeper tooling than the methodology provides.

1-week final state: build fails. Bundle not measurable.

## What this means for the hypothesis

Post 7 hypothesis: with live feedback, the budget curve becomes monotonic.

Round 2 result.

- Monotonic at 1-day → 3-day. Confirmed. 236 KB → 216 KB, both built. Round 1's 3-day didn't build at all.
- Breaks at 3-day → 1-week. Hypothesis fails. More code, more configuration, more cross-cutting pieces produces new failure classes that round-by-round feedback doesn't resolve in the available rounds.

A sweet-spot finding. The feedback loop produces its biggest gains at a middle budget. Enough room for real polish, not so much that the code surface produces emergent build issues the loop can't chase down.

## Four findings the series didn't predict

1. Repeat mistakes carry across fresh subagent contexts via the prompt, not memory. Every 3-day instrumented lesson from the 1-day instrumented run landed because I wrote them into the 3-day prompt. Agents' fresh contexts don't help. The orchestrator's note-keeping does. A generalizable orchestration pattern.

2. Subagents can mis-target directories under ambiguous prompts. Round D of 1-week edited `3-day/package.json` despite the prompt saying `1-week` repeatedly. The agent's path tokenization is fallible enough that directory operations need per-run sandboxing, not just prompt-level pinning. Future bakeoffs should use per-build permission scopes or isolated worktrees.

3. Self-pacing iteration budgets get stretched at ambitious budgets. 1-week Round A reported "~38 tool calls." Actual count was 106. The over-report wasn't dishonesty, the agent lost track. Budget enforcement via the agent's self-count is unreliable at scale.

4. The bundle floor is set by the dep set, not the feedback loop. All three instrumented builds converge around 215–240 KB because the `codemirror` meta-package barrel dominates the entry chunk at that size. Getting under ~100 KB requires adding `@codemirror/basic-setup` or sub-packages as direct deps, which the methodology forbids. The loop improves code quality within a dep envelope. It can't shrink the envelope.

## Methodology caveats

This round is bounded by specific choices.

- One model, one skill combo (Claude Sonnet + `frontend-design` skill).
- One proposal (`claude-frontend-design`), feature-rich. A minimal proposal might show cleaner monotonic behavior or cleaner failure.
- Pre-installed scaffolding. The template gave the agent a buildable starting point with a specific dep set. Different deps mean different ceilings.
- Orchestrator-driven loop specifically. A truly autonomous loop with direct `pnpm build` access in the Bash scope might converge differently.

The shape of the feedback loop matters, not just its existence. A loop that requires new subagent contexts between rounds will have limits a loop with continuous state wouldn't.

## Where this leaves the series

The post-7 claim stands. Iteration headroom without verification headroom produces strictly worse outcomes. Round 1's evidence confirmed that.

Round 2 refines it. Verification headroom helps most at a middle budget, not linearly across all budgets.

Post 9 tests the slate-expansion dimension. Does the sweet-spot budget move when the model changes? Do Codex, Gemini, Qwen, Devstral produce different failure modes? That's the next experiment.

Full artifacts: [builds-instrumented/1-day/](https://github.com/acald-creator/agent-bakeoff/tree/main/builds-instrumented/1-day), [builds-instrumented/3-day/](https://github.com/acald-creator/agent-bakeoff/tree/main/builds-instrumented/3-day), [builds-instrumented/1-week/](https://github.com/acald-creator/agent-bakeoff/tree/main/builds-instrumented/1-week).

Next: [Slate Expansion — Round 3](post-09-slate-expansion-round-3.md).
