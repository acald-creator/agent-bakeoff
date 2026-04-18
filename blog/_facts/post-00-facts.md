# post-00 facts-only skeleton

*Source material for rewriting "Why an agent bakeoff" in the author's voice. NOT for publication. Written as notes, claims, and data — no prose arguments.*

---

## What this post must establish

1. This is a series, not a one-off — a multi-agent comparison of how different AI agents approach the same open design question.
2. The comparison is the content. Not any one rebuild, not a "best agent" contest.
3. The series runs as two acts: design-off (Act 1) → build-off (Act 2).
4. There is a specific 4-agent slate with a stated rationale for each slot.
5. The author is transparent about orchestration biases — in particular, one of the 4 slots is the author's own proposal and is disclosed as such.

## Context facts (the reader needs to know these)

- **Starting point:** a 2022 Inferno + Redux + Hyperscript todo app called `functionalHyperscriptTodoList`. Originally by Leonardo Saracini. Last commit Jan 2022. Pinned to Node 9.11.1 (won't run on a modern toolchain without intervention).
- **The app is used as a *complexity reference*, not a starting point.** Agents are not asked to modernize it in place.
- **The actual app being proposed:** a single-user markdown notes editor that could plausibly become collaborative.
- **Why pivot from todo to notes:** notes forces a real editor-library decision (CodeMirror / ProseMirror / TipTap / textarea etc.) that a todo app doesn't. More interesting comparison fodder.

## The 4-agent slate (Round 1, the one this post introduces)

| Slot | Value |
|---|---|
| Codex (OpenAI, via Codex CLI) | Different model family from Claude — the cleanest "second opinion" signal |
| Claude Sonnet via Plan subagent | Planning-first, fresh context, no orchestration history |
| Claude Opus main-thread | Informed insider — the author's own proposal, disclosed |
| Claude + `frontend-design` skill | UX-first lens, fresh subagent + skill bias |

The slate mixes two axes: different *models* (Codex vs Claude family) and different *lenses* (planning-first vs UX-first vs informed-insider). **Disclosed as a design-space survey, not a controlled experiment.**

## Decisions the post discloses openly

- The slate includes the author's own slot. Excluding it would hide the bias; including it discloses the bias by name.
- A fifth candidate was considered and dropped: a "no-framework, vanilla-web-components-only" constrained brief. Reasoning: that's a brief variation, not a different agent. Queued as a potential future round.

## What this series is NOT

- Not benchmarks — no single-number scoring anywhere. Five evaluation lenses (coherence, justification quality, honest tradeoffs, buildability, surprise value) applied qualitatively.
- Not "Claude vs Codex" / "Anthropic vs OpenAI" — disagreeing with the eventual pick is a reasonable response.
- Not a prescription — the series doesn't claim to know which AI agent you should use.

## The series shape (as stated in this post)

Eight posts, two acts:

- Post 0: framing (this post)
- Post 1: tour the 2022 baseline
- Post 2: the brief and its four iterations
- Post 3: the four proposals side-by-side
- Post 4: the verdict
- Post 5: build-off rules + 1-day build
- Post 6: 3-day vs 1-week
- Post 7: meta — what time pressure does to LLM code

Order of publishing ≠ order of work. Posts 0–2 can ship while proposals are still being collected.

## What the author hopes the reader gets out of finishing the series

- Concrete side-by-side read on how four agents reason through the same open architectural question
- Sense of where consensus and disagreement actually fall across frontier models on this class of question
- Evidence about what time pressure does to LLM code in practice (Act 2)
- Honesty about the orchestration biases that shape the result

## Invitations to the reader (stated or implied)

- Disagree with the verdict — comments are open, the reasoning is transparent
- Re-run any slot yourself — the brief is public and the agents are reproducible (Codex CLI, Claude Sonnet via subagent, etc.)
- Treat the format as a template — not todo-specific, not notes-specific

## Hook the current prose uses (for reference; replace, don't copy)

The first paragraph pivots on this structure: "I had a 2022 todo app rotting in a repo. I could have just modernized it. Instead I did the other thing." Personal anecdote → pivot → thesis. The specific phrasing is AI-rhythm and should be replaced with the author's own on-ramp.

## Numbers / specifics worth landing somewhere in the rewrite

- 2022 baseline: ~15 small TypeScript files, ~26 commits total, most are maintenance
- Last commit: January 2022
- Runtime: Inferno 7, Redux 4, Webpack 5, pinned Node 9.11.1
- Hyperscript heritage: via `inferno-hyperscript`, not a typo or accident — deliberate authorial choice in the baseline
- Four agents for Round 1. Series eventually grows to 8 agents across Rounds 2 and 3 (not mentioned in post 0 as originally written).

## Things the current post does that are load-bearing structurally

- Names the 4 agents early (establishes concrete stakes, not abstract premise)
- Discloses the "author's own slot" bias before introducing it (framing matters)
- Lists what the series is NOT (avoids reader bringing the wrong expectations)
- Ends with reader invitations (positions the series as open-source-ish rather than definitive)

## Things the current post does that are NOT load-bearing (drop freely)

- The eight-post-table in markdown (posts have since extended to 10 — table is inaccurate now anyway)
- The "I could have just shipped a tweet" line (cute, AI-rhythm)
- The "two weekends, done" aside (padding)
- Most transitions ("Let's walk through each", "The short version is...")
