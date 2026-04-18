# Act 2, Again — With Feedback: Post 8

*An addendum to the original 8-post series. Post 7 made a falsifiable claim: a live-build-feedback loop would turn Act 2's non-monotonic budget curve into a monotonic one. This post is the test. The result is more interesting than the hypothesis predicted.*

---

Post 7 ended on a deliberate hypothesis. The original Act 2 ran in what I called "write-only" mode: the agent couldn't run its own builds because of a permission routing issue in the orchestration environment. That mode produced a non-monotonic budget curve — 1-day built (oversized), 3-day didn't build, 1-week built after orchestrator help (at an even larger size). Post 7 claimed this was a methodology artifact, and that with a live feedback loop, the curve would straighten out.

Round 2 tested that claim. I won't pretend the claim survived fully. What came back is more nuanced — and the nuance is the real finding.

## The feedback loop that worked

Permissions resisted direct subagent access to `pnpm install` and `pnpm build` no matter how I framed the allowlist patterns. After four permission walls, I settled on a different design: **the agent writes code and stops; the orchestrator (main thread) runs `pnpm build` and captures the output; I spawn a fresh subagent for each round with the build output in its prompt**.

The user made a sharp observation while we were setting this up: *this is exactly the loop the user was running with me.* Each turn, the user directs; I do work; I report back; the user reacts. I proposed the same three-layer structure for the subagents. The series is partly a study in what that loop actually does when applied at different budgets.

Each build became a sequence of rounds:
- **Round A** — a fresh subagent writes an implementation and stops
- **Orchestrator** — runs `pnpm build`, captures output, measures bundle from `dist/`
- **Round B (if needed)** — a fresh subagent reads the build output and code state, fixes errors, stops
- **Round C / D (if needed)** — more rounds until the build is clean or the budget is gone

Fresh subagents each round: the orchestrator passes prior code state (the agent can read files) and the build output (in the prompt). No subagent has memory of prior rounds beyond what's in the prompt. That's actually *similar to how a human uses me* — each turn I have conversation-to-date, nothing before.

## The three instrumented builds

Same proposal (`claude-frontend-design`), same agent configuration (Claude Sonnet + `frontend-design` skill), same pre-installed scaffolding. Three budgets. Results in one table:

| Budget | Rounds | Iterations | Builds? | Entry bundle (gz) | vs Round 1 (write-only) |
|---|---|---|---|---|---|
| 1-day | 4 | 57 | ✅ | 236 KB | 219 KB (similar) |
| 3-day | 2 | 40 | ✅ | **216 KB** | didn't build |
| 1-week | 4+ | 113+ | **❌** | — | 533 KB after orchestrator rename |

**The curve is monotonic at 1-day and 3-day. It breaks at 1-week.** That's the core result.

Let's walk through each budget briefly. Full per-build notes live in `builds-instrumented/<budget>/orchestrator-notes.md`.

## 1-day instrumented: works, but barely different

Four rounds, 57 iterations total. Round A wrote 10 files including vanilla-extract styles. The first verified build **succeeded on first try**. That's the visible delta vs Round 1: the original 3-day and 1-week builds both failed their first builds; Round 1 1-day built but only because its agent didn't try anything risky.

Round A's build surfaced a real defect: the proposal's `vite.config.ts` includes a `manualChunks` function that groups every `@codemirror/*` into one eager chunk. The agent had flagged this preemptively. With the build output in hand, Round B removed the grouping and added a dynamic import for `@codemirror/language-data`. Round B's build broke with 2 TS errors. Round C fixed those with a `Compartment` pattern. Round D investigated the final bundle and made a marginal fix.

Final: **236 KB gzipped.** Round 1's 1-day was 219 KB. *Slightly larger.* The difference: the Round 2 agent kept vanilla-extract and implemented a full design token system that Round 1 dropped for simplicity. The feedback loop bought quality, not compactness.

## 3-day instrumented: where the monotonic curve appears

Two rounds, 40 iterations total. Round A wrote 11 files — full token system, mobile responsive sidebar, keyboard navigation, `:focus-visible` ring, accessibility scaffolding. **Every lesson from the 1-day instrumented run carried over** via the prompt (not subagent memory — the prompt listed "here are the mistakes a prior instrumented 1-day run made; don't make them"). The `tokens.css.ts` suffix, separate `globalStyle()` per pseudo-variant, `Compartment` pattern, dynamic language-data — all applied correctly.

Round A's build: `tsc --noEmit` **passed** (zero TS errors; a notable step up from Round 1 1-week's 11 errors). `vite build` failed at vanilla-extract's compiler with a descendant-selector error. Round B fixed it in 3 tool calls — moved the descendant selector from the parent's `style()` to the child's `style()` using the `${parent} &` form.

Round B's build: **succeeded. Entry bundle 216 KB gzipped.**

That's smaller than the 1-day instrumented (236 KB). Same dep set, same meta-package ceiling — the 3-day was just better-organized code under the ceiling. For the first time in any Act 2 budget comparison, more budget + feedback produced a smaller bundle.

This is the result post 7 predicted. If 1-week had continued the trend, the hypothesis would have been cleanly supported.

## 1-week instrumented: where it breaks

Four rounds, 113+ iterations, multiple orchestrator interventions. Didn't build.

Round A wrote **20 files** — app + `HighlightStyle` with Lezer tags + `prefers-reduced-motion` + `aria-live` + `Cmd+N`/`Escape` shortcuts + 28 Vitest unit tests + 4 Playwright e2e tests + mobile sidebar with overlay. Also added Vite `resolve.alias` entries for two transitive deps (`@codemirror/language`, `@lezer/highlight`) that pnpm's strict layout wouldn't hoist.

The first build surfaced 2 TS errors — the aliases satisfied Vite at runtime, but TypeScript doesn't read Vite aliases. Round B added tsconfig `paths` to match. Round C fixed a Lezer tag typo (`tags.code` doesn't exist).

Then vanilla-extract started failing with *"Styles were unable to be assigned to a file"* at `tokens.css.ts:7:59`. Round D was supposed to fix that — but **Round D worked in the wrong directory**. Despite the prompt naming `1-week` repeatedly, the agent's tool calls went to `3-day/`. It edited the wrong package.json. The orchestrator had to revert 3-day's changes before any further progress.

At this point I stopped spawning rounds and did the investigation directly: removed the Vite aliases, added `@codemirror/language` and `@lezer/highlight` as direct deps (an orchestrator intervention beyond the usual "infrastructure glue"), ran `pnpm install`, removed the tsconfig paths, cleared Vite's pre-bundle cache. The vanilla-extract error persisted.

The 3-day build uses the same compiler, same vite-plugin, same structural patterns. It works. 1-week's 20-file implementation introduces some cross-cutting interaction the compiler can't scope — diagnosis would require several more rounds or deeper tooling than the methodology provides.

**1-week final state: build fails. Bundle not measurable.**

## What this means for the hypothesis

The post-7 hypothesis was: *"with live feedback, the budget curve becomes monotonic."*

Round 2 shows:
- **Monotonic at 1-day → 3-day.** ✓ (236 KB → 216 KB, both built; Round 1's 3-day didn't build)
- **Breaks at 3-day → 1-week.** The hypothesis fails here. More code + more configuration + more cross-cutting pieces → new failure classes that round-by-round feedback doesn't resolve.

This is a **sweet-spot finding**. The orchestrator-driven feedback loop produces its biggest gains at a middle budget — enough room for real polish, not so much that the code surface produces emergent build issues the loop can't chase down. At 1-day, the loop barely matters (Round 1 1-day also built). At 1-week, the loop doesn't scale to the code volume.

## Four things the series didn't predict

1. **Repeat mistakes carry across fresh subagent contexts via the prompt.** Every 3-day instrumented lesson from the 1-day instrumented run landed because I wrote them into the 3-day prompt. The agents' fresh contexts don't help — the orchestrator's note-keeping does. This is a generalizable orchestration pattern.

2. **Subagents can mis-target directories under ambiguous prompts.** Round D of 1-week edited `3-day/package.json` despite the prompt saying `1-week` repeatedly. The agent's path tokenization is fallible enough that directory operations need per-run sandboxing, not just prompt-level pinning. Future bakeoffs should use per-build permission scopes or isolated worktrees.

3. **"Self-pacing" iteration budgets get stretched at ambitious budgets.** The 1-week Round A reported "~38 tool calls" — actual count was 106. The over-report wasn't dishonesty; it was the agent losing track. Budget enforcement via the agent's self-count is unreliable at scale.

4. **The bundle floor is set by the dep set, not the feedback loop.** All three instrumented builds converge around 215–240 KB because the `codemirror` meta-package barrel dominates the entry chunk at that size. To get under ~100 KB requires adding `@codemirror/basic-setup` or equivalent sub-packages as direct deps — which the methodology's "fixed scaffold" rule forbids. The loop can improve code quality within a dep envelope; it can't shrink the envelope.

## Methodology caveats to keep front-of-mind

This round, like post 7's write-only round, is bounded by decisions the series made:

- **One model, one skill combo.** Claude Sonnet + `frontend-design` skill. Other models (GPT-5, Gemini 2.x, DeepSeek) might produce different curves.
- **One proposal.** The `claude-frontend-design` proposal is feature-rich (vanilla-extract, editorial typography, motion curves). A more minimal proposal might have shown cleaner monotonic behavior or cleaner failure.
- **Pre-installed scaffolding.** The template gave the agent a buildable starting point with a specific dep set. Different deps would produce different ceilings.
- **Orchestrator-driven loop specifically.** A truly autonomous loop where the agent has direct `pnpm build` access in its Bash scope might converge differently — the round-by-round structure I used is one implementation of feedback, not the only one.

If you're building tooling for LLM-driven development and reading this: don't take "the curve bends at 1-week" as a fundamental property. Take it as evidence that **the shape of the feedback loop matters, not just its existence**. A loop that requires new subagent contexts between rounds will have limits a loop with continuous state wouldn't.

## Where this leaves the series

Eight posts, two rounds of Act 2, one clear sweet-spot finding. The original series claim — **"within Act 2's methodology, adding iteration headroom without verification headroom produces strictly worse outcomes"** — stands, confirmed by Round 1's evidence. The refinement from Round 2 is that adding verification headroom helps **most at a middle budget**, not linearly across all budgets.

Future rounds should test the slate-expansion dimension: does the sweet-spot budget move when the model changes? Do GPT-5 or Gemini 2.x produce different failure modes in instrumented mode? Does the feedback loop help them more, less, or differently? Those are the interesting follow-ups.

The repo has all the evidence. Run your own.

---

*Series: Post 8 of 8 (final). Previous: [What Time Pressure Does to LLM Code](post-07-what-time-pressure-does.md).*

*Full artifacts: [builds-instrumented/1-day/](../builds-instrumented/1-day/), [builds-instrumented/3-day/](../builds-instrumented/3-day/), [builds-instrumented/1-week/](../builds-instrumented/1-week/).*

*Full repo: [agent-bakeoff](https://github.com/acald-creator/agent-bakeoff). All instrumented rounds preserved with per-build `orchestrator-notes.md` files.*
