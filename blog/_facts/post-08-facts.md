# post-08 facts-only skeleton

*Source material for rewriting "Act 2, Again — With Feedback" (Round 2 instrumented results). NOT for publication.*

---

## What this post must establish

1. Round 2 tested post 7's hypothesis (live feedback → monotonic curve).
2. **The hypothesis is partially confirmed, partially refuted.** Monotonic at 1-day → 3-day; breaks at 3-day → 1-week.
3. The refined finding is a **sweet spot** at middle budgets, not a linear relationship.
4. The user-as-orchestrator loop is the live feedback model (this was the user's observation, credited).
5. Four secondary findings the series didn't predict going in.

## The setup

Permissions resisted direct subagent access to `pnpm install` + `pnpm build` no matter how the allowlist was framed. After four permission walls, settled on:

**Subagent → orchestrator → subagent feedback loop.** The agent writes code and stops; orchestrator runs `pnpm build` and captures output; spawns a fresh subagent for each round with the build output in its prompt.

User observation (credit in post): this is exactly the loop the user was running with the orchestrator throughout the whole series — each turn, user directs, I work, I report, user reacts. The instrumented Round 2 applies the same three-layer structure to subagents.

Fresh subagents each round: orchestrator passes prior code state + build output. No subagent has memory of prior rounds beyond what's in the prompt. **Similar to how a human uses an LLM via chat: context-to-date in context, nothing before.**

## The three instrumented builds (grid)

| Budget | Rounds | Iterations | Builds? | Entry bundle (gz) | vs Round 1 (write-only) |
|---|---|---|---|---|---|
| 1-day | 4 | 57 | ✅ | 236 KB | 219 KB (similar) |
| 3-day | 2 | 40 | ✅ | **216 KB** | didn't build |
| **1-week** | **4+** | **113+** | **❌** | — | 533 KB after orchestrator rename |

**Core result: monotonic at 1-day and 3-day. Breaks at 1-week.**

## 1-day instrumented (works, barely different from Round 1)

Four rounds, 57 iterations total.

- Round A (43 iter): wrote 10 files including vanilla-extract. **First verified build succeeded on first try.** Agent preemptively flagged `manualChunks` as potential defect.
- Round B (6 iter): removed `manualChunks`; converted `@codemirror/language-data` from static to dynamic import; used `StateEffect.reconfigure` ... which triggered 2 TS errors.
- Round C (4 iter): fixed TS errors with `Compartment` pattern + `any`-typed `LanguageDescription`.
- Round D (4 iter): investigated final bundle, made marginal fix.

**Final: 236 KB gzipped entry.** Round 1's 1-day was 219 KB. *Slightly larger.*

Why slightly larger? The Round 2 agent **kept vanilla-extract and implemented a full design token system** that Round 1's 1-day dropped for simplicity. **The feedback loop bought quality, not compactness.**

## 3-day instrumented (where monotonic curve appears)

Two rounds, 40 iterations total.

- Round A (37 iter): wrote 11 files — full token system, mobile responsive sidebar, keyboard nav, `:focus-visible` ring, accessibility scaffolding. **Every lesson from the 1-day instrumented run carried over via the prompt** (not subagent memory — the prompt listed "here are the mistakes a prior instrumented 1-day run made; don't make them"). `tokens.css.ts` suffix, separate `globalStyle()` per pseudo-variant, `Compartment` pattern, dynamic language-data — all applied correctly.
- Round A build: **`tsc --noEmit` passed (zero TS errors — step up from Round 1 1-week's 11).** `vite build` failed at vanilla-extract's compiler with a descendant-selector error.
- Round B (3 iter): fixed it. Moved descendant selector from parent's `style()` to child's `style()` using `${parent} &` form.

Round B's build: **succeeded. Entry bundle 216 KB gzipped.**

Smaller than 1-day instrumented (236 KB). **First time in ANY Act 2 budget comparison, more budget + feedback produced a smaller bundle.**

## 1-week instrumented (where it breaks)

Four rounds, 113+ iterations, multiple orchestrator interventions. Doesn't build.

- Round A (106 iter; agent reported "~38"): wrote 20 files — app + `HighlightStyle` with Lezer tags + `prefers-reduced-motion` + `aria-live` + `Cmd+N`/`Escape` shortcuts + 28 Vitest unit tests + 4 Playwright e2e tests + mobile sidebar with overlay. Also added Vite `resolve.alias` for `@codemirror/language` and `@lezer/highlight` (pnpm's strict layout wouldn't hoist these).
- First build: 2 TS errors. Aliases satisfied Vite runtime but TypeScript doesn't read Vite aliases.
- Round B (4 iter): added tsconfig `paths` matching the aliases.
- Round C (3 iter): fixed a Lezer tag typo (`tags.code` doesn't exist).
- Then vanilla-extract started failing with *"Styles were unable to be assigned to a file"* at `tokens.css.ts:7:59`.
- Round D (5 iter): SUPPOSED to fix that. **Worked in the wrong directory.** Despite prompt naming `1-week` repeatedly, tool calls went to `3-day/`. Edited wrong `package.json`. Orchestrator had to revert 3-day's changes.
- At this point orchestrator did investigation directly: removed Vite aliases, added two transitive deps as direct deps, ran `pnpm install`, removed tsconfig paths, cleared Vite pre-bundle cache. Vanilla-extract error persisted.

3-day build uses same compiler, same vite-plugin, same patterns. Works. **1-week's 20-file implementation introduces some cross-cutting interaction the compiler can't scope.** Diagnosis would require several more rounds or deeper tooling than the methodology provides.

**1-week final: build fails. Bundle not measurable.**

## What the result means for the hypothesis

Post 7 hypothesis: *"with live feedback, the budget curve becomes monotonic."*

Round 2 shows:
- **Monotonic at 1-day → 3-day.** ✓ (236 KB → 216 KB, both built; Round 1 3-day didn't build at all)
- **Breaks at 3-day → 1-week.** Hypothesis fails. More code + more configuration + more cross-cutting pieces → new failure classes that round-by-round feedback doesn't resolve in the available rounds.

**This is a sweet-spot finding.** Feedback loop produces biggest gains at middle budget — enough room for real polish, not so much that code surface produces emergent build issues the loop can't chase.

## Four findings the series didn't predict

1. **Repeat mistakes carry across fresh subagent contexts via the PROMPT, not memory.** Every 3-day instrumented lesson from the 1-day instrumented run landed because I wrote them into the 3-day prompt. Agents' fresh contexts don't help — the orchestrator's note-keeping does. Generalizable orchestration pattern.

2. **Subagents can mis-target directories under ambiguous prompts.** Round D of 1-week edited `3-day/package.json` despite prompt saying `1-week` repeatedly. Agent's path tokenization is fallible enough that directory operations need per-run sandboxing, not just prompt-level pinning. Future bakeoffs should use per-build permission scopes or isolated worktrees.

3. **"Self-pacing" iteration budgets get stretched at ambitious budgets.** 1-week Round A reported "~38 tool calls"; actual count was 106. Over-report wasn't dishonesty; agent lost track. **Budget enforcement via agent's self-count is unreliable at scale.**

4. **The bundle floor is set by the dep set, not the feedback loop.** All three instrumented builds converge around 215–240 KB because the `codemirror` meta-package barrel dominates the entry chunk at that size. To get under ~100 KB requires adding `@codemirror/basic-setup` or sub-packages as direct deps — which methodology forbids. **Loop improves code quality within a dep envelope; can't shrink the envelope.**

## Methodology caveats (front-of-mind)

This round, like post 7's write-only round, is bounded by specific choices:

- **One model, one skill combo.** Claude Sonnet + `frontend-design` skill.
- **One proposal.** `claude-frontend-design` is feature-rich (vanilla-extract, editorial typography, motion curves). A minimal proposal might show cleaner monotonic behavior OR cleaner failure.
- **Pre-installed scaffolding.** Template gave agent a buildable starting point with specific dep set. Different deps = different ceilings.
- **Orchestrator-driven loop specifically.** A truly autonomous loop with direct `pnpm build` access in the Bash scope might converge differently. The round-by-round structure is one implementation of feedback, not the only one.

**The shape of the feedback loop matters, not just its existence.** A loop that requires new subagent contexts between rounds will have limits a loop with continuous state wouldn't.

## Where this leaves the series (for this post's ending)

- Original claim from post 7 — "iteration headroom without verification headroom produces strictly worse outcomes" — stands, confirmed by Round 1's evidence.
- Refinement from Round 2: **adding verification headroom helps MOST at a middle budget**, not linearly across all budgets.
- This post refines the format itself into something reproducible.

## Practical working assumptions for anyone running an LLM coding comparison

- 4–6 agents in slate
- 1 proposal per agent, same brief, schema with required-specific carryovers
- Prefer first-party CLIs; Ollama for open-weight with cleanup filter
- **Grade on schema + depth, not schema alone**
- **Pin model IDs explicitly; expect them to drift within months**

## What the current post does that's load-bearing

- Names the user's observation about the orchestrator loop being what the user was already doing (credit where due)
- Gives the three-build grid before walking through each (scan-then-read)
- States the hypothesis result as partial-confirmation-partial-refutation explicitly
- Names the sweet-spot finding as the honest refinement
- Keeps methodology caveats front-of-mind throughout

## What the current post does that's NOT load-bearing (drop freely)

- Long 1-day round-by-round walkthrough (can be summarized; details are in orchestrator-notes)
- "This is not the clean 'hypothesis confirmed' result the post-7 prediction wanted" — AI-narrator-honesty voice
- "None of that is Round 2. That would be Round 2-redux with a different methodology" — unnecessary
- Repeated "methodology caveat" flags — name once

## Numbers / specifics worth landing somewhere

- 1-day instrumented: 57 iter, 4 rounds, 236 KB, vanilla-extract kept
- 3-day instrumented: 40 iter, 2 rounds, **216 KB (smaller than 1-day)**, all polish features
- 1-week instrumented: 113+ iter, 4+ rounds, **doesn't build**, vanilla-extract scoping error resistant to feedback
- Round 1 vs Round 2 comparison at each budget is the core table
- Round A of 1-week under-reported iterations by ~3× (38 vs 106)
- Bundle floor across instrumented builds: ~215 KB (dep-set driven)

## Hook the current prose uses (for reference)

Current opener: "Post 7 ended on a deliberate hypothesis..." Test-your-own-prediction AI-rhythm. Find your own on-ramp — maybe start from the user's observation about the three-layer loop, or the moment 3-day came back at 216 KB (smaller than 1-day, monotonic for the first time), or the 1-week breaking despite 113 iterations of feedback.
