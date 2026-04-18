# Act 2 — The Build-Off Rules

*The operational document for Act 2. Posts 5, 6, and 7 will reference this. The blog audience reads it as background; the agents reference it as ground truth.*

## Setup

- **Same proposal across all three runs:** [claude-frontend-design](../proposals/claude-frontend-design/README.md), selected in [post 4 — the verdict](post-04-the-verdict.md).
- **Same agent configuration across all three runs:** Claude Sonnet via subagent + the `frontend-design` skill. Identical lens to the proposal author.
- **Three time budgets:** 1-day, 3-day, 1-week.
- **Three independent runs:** each agent starts with a fresh subagent context, no conversation history, no access to the other builds' outputs.
- **Output directory layout:**
  ```
  builds/
    1-day/    Working app + build-notes.md
    3-day/    Working app + build-notes.md
    1-week/   Working app + build-notes.md
  ```

## Budget definitions

The budgets are framed against an autonomous LLM loop, not human days. The labels carry the *spirit* of "more time means more polish"; the concrete caps are what the agent self-paces against.

| Budget | Wall-clock cap | Iteration cap | Expected ceiling |
|---|---|---|---|
| **1-day** | ~30 min | ~25 turns | Working app, design polish cut |
| **3-day** | ~90 min | ~75 turns | Design system wired, most polish |
| **1-week** | ~4 hr | ~150 turns (effectively unlimited) | Proposal as designed |

**On enforcement.** Budgets are self-paced. The agent is given the cap upfront and instructed to stop when it runs out. The orchestrator measures compliance after the fact — wall-clock cuts are backstops, not the primary mechanism. The interesting signal is *how the agent chooses to spend the budget*, not whether it overshoots by a few minutes.

## What the agent gets

- The chosen proposal: [proposals/claude-frontend-design/README.md](../proposals/claude-frontend-design/README.md)
- The brief, for spec reference: [blog/the-brief.md](the-brief.md)
- A clean output directory: `builds/<budget>/`
- Standard tools (Bash, Read, Write, Edit, Grep, Glob)

## What the agent does not get

- **Build-infrastructure responsibility.** The agent writes code; the orchestrator runs `pnpm install` + `pnpm build` and measures the bundle (see "Methodology note" below). The agent does not need to verify its own build, and *should not* burn iterations doing so. This isolates the time-pressure variable from build-infra friction.
- Other builds' outputs (no peeking; the orchestrator enforces by running each agent in isolation, no shared dir access during the run)
- Help mid-loop (no orchestrator interventions; the agent is on its own)
- Budget extensions (no overtime)

### Methodology note: install + build are out-of-band

The first three 1-day attempts were blocked by Bash permission walls in the orchestration environment, none of the agent's fault. Rather than continue iterating on the permission setup (which would have delayed Act 2 indefinitely), the methodology was adjusted: the agent self-paces on **code-writing only**, and the orchestrator handles `pnpm install` + `pnpm build` + bundle measurement after the agent stops.

This is actually a cleaner experiment design: it isolates the variable we care about (LLM coding behavior under time pressure) from infrastructure friction we don't. The bundle-size lens is preserved — the orchestrator measures it from the actual `dist/` output, the way the brief defined.

The orchestrator also writes `orchestrator-notes.md` per build, recording what was observable from outside the agent's perspective. Together with the agent's `build-notes.md`, that's the source for posts 5–7.

## What "done" looks like at each budget

The proposal lists what the finished app should be; each budget compresses that target.

### 1-day target
- App boots, deploys to a static host
- All five functional verbs work: create note, edit body, toggle persistence (auto-save), switch notes, search
- Some attempt at the proposal's design POV (typography, color, layout)
- A `build-notes.md` listing what was done, what was cut, and rough iteration count

### 3-day target
- 1-day target, plus:
- Design tokens wired (the proposal's `tokens.ts` style)
- Typography sized correctly (Playfair + Literata or chosen substitutes)
- Most polish: focus states, basic motion, accessibility
- `build-notes.md` lists remaining gaps vs. the proposal

### 1-week target
- 3-day target, plus:
- The full editorial aesthetic (warm aged-paper background, red-ink accent, considered states)
- Accessibility considered: keyboard navigation, screen reader, contrast
- Tests where they earn their keep
- `build-notes.md` describes anything that evolved beyond the proposal — and why

## What gets measured

Post-5 / 6 / 7 will apply five lenses to each build:

1. **Functional completeness** — do the spec'd features actually work?
2. **Design fidelity** — does it look like the proposal promised?
3. **Code quality** — readable, idiomatic, testable, minimal
4. **Bundle size** — does it meet the proposal's ~82 KB target? Above? Below?
5. **Honesty** — does `build-notes.md` accurately disclose what was cut and what was left rough?

No single lens dominates. A 1-day build that ships a working app with an honest "cut the typography" note can win against a 1-week build that quietly hand-waved features.

## Anti-cheating rules

- Each agent receives a fresh subagent context with no conversation history.
- The agent's prompt does not include other budgets' outputs.
- The orchestrator does not interrupt or course-correct the agent during the run.
- The orchestrator commits build outputs only after all three runs complete, so no agent can see prior commits.
- The agent is instructed not to read `builds/` siblings during its run; this is honor-system but a violation would be visible in the agent's tool calls.

## What this is *not*

- It is not a hyperparameter sweep. We are not running each budget multiple times; one run per budget. The variance is part of the data.
- It is not a benchmark. There is no scoring rubric the agent can train against; the lenses are read after the fact and reported in prose.
- It is not a controlled experiment. The orchestrator's prompt-writing for each budget is itself a confound; we will disclose the prompt for each run alongside the build.

## How the runs are recorded

For each build, the orchestrator commits:

- The agent's prompt (in `builds/<budget>/agent-prompt.md`, or in the rules doc + post 5)
- The agent's full file output
- A `build-notes.md` written by the agent (the agent's reported iteration count, wall-clock duration, what was cut, and self-assessment)
- An `orchestrator-notes.md` recording what the orchestrator did out-of-band (install + build + bundle measurement) and anything observable from outside the agent's perspective
- The actual `dist/` output is gitignored; bundle measurements are recorded in the notes files

That entire bundle becomes the source for posts 5–7.

---

*Series companion: this rules doc is referenced from [post 5](post-05-build-off-day-1.md) and [post 6](post-06-build-off-3-day-vs-1-week.md). The lenses are revisited in [post 7](post-07-what-time-pressure-does.md).*
