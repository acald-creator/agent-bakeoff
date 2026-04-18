# post-04 facts-only skeleton

*Source material for rewriting "The verdict" (comparison matrix + chosen design). NOT for publication.*

---

## What this post must establish

1. The four proposals compared at once (the matrix post).
2. A specific proposal is chosen for Act 2 (the build-off) — with reasoning.
3. The reasoning is about *build-off fitness*, not raw proposal quality — this is a series design choice that could be argued against.
4. The orchestrator's own proposal (claude-opus-main) is NOT chosen — excluding it is part of the bias-disclosure that started in post 0.

## Three patterns visible once the proposals are stacked

### 1. CodeMirror 6 is the editor consensus (3/4)
Three different framework picks converged on the same editor. **Editor decision turned out to be a bigger architectural commitment than the framework.** This would have been invisible in any single-agent proposal.

### 2. Hyperscript split 2/2 — along an unexpected axis
The two non-default-Claude slots (Codex from outside the Claude family; Opus-main with full baseline context) both kept hyperscript. The two pure-Claude subagent slots both dropped it for SolidJS+JSX. **The split is not random; it tracks model-family/context, not framework.**

### 3. Bundle sizes spread 3× — editor library is the main driver
37 KB (codex, textarea) to 90–100 KB (sonnet-plan, Zustand + CodeMirror). Not framework-driven. Editor-library driven.

## The slate-at-a-glance table (Round 1)

| Slot | Framework | Editor | Bundle (gz) | State | Hyperscript | Functional | Collab v1? |
|---|---|---|---|---|---|---|---|
| claude-opus-main | Inferno 8 | CodeMirror 6 | ~75 KB | Hand-rolled type-to-reducer | Kept | Kept | Yes |
| claude-sonnet-plan | SolidJS 1.x | CodeMirror 6 | ~90–100 KB | Zustand + Immer | Dropped | Kept | Yes |
| claude-frontend-design | SolidJS 1.9 | CodeMirror 6 | ~82 KB | SolidJS built-in | Dropped | Partial | Yes |
| codex | Mithril | textarea + micromark | 37 KB | Hand-rolled reducers | Kept | Partial | No |

## The five evaluation lenses (from brief v1.4)

1. **Coherence** — does the stack hang together?
2. **Justification quality** — specific and falsifiable, or generic?
3. **Honest tradeoffs** — does the proposal name what it gives up?
4. **Buildability** — could a competent developer ship this in a weekend?
5. **Surprise value** — does the proposal teach something?

## Lens-by-lens winners (qualitative, no scoring)

### Coherence
- codex tied with claude-opus-main — every choice is a flavor of one organizing principle ("minimal" / "honor the baseline")
- frontend-design close behind (coherent through aesthetic POV)
- sonnet-plan coherent but most conventional

### Justification quality
- sonnet-plan has the strongest line-by-line work (every Stack cell argues against specific alternatives)
- codex has the strongest *contrarian* justification ("willing to say plain textarea is right for v1")
- opus-main has baseline-rooted justification but with informed-insider bias showing
- frontend-design's "design demanded X" is the most tautological

### Honest tradeoffs
- opus-main names 4 tradeoffs explicitly (niche-framework tax, hand-rolled maintenance, no signals, bundle-not-smallest)
- codex names the biggest one in TL;DR ("less editor power than CodeMirror in exchange for lower bundle, less abstraction, better fit for required surface")
- sonnet-plan names CodeMirror's ~45 KB cost + Zustand-vs-Solid-stores tension
- frontend-design names fewer tradeoffs; its lens is partly "don't dwell on what's given up"

### Buildability
- codex first — smallest surface, no editor library to learn
- sonnet-plan second — approachable stack, good docs
- opus-main buildable but niche-framework friction
- frontend-design buildable but typography setup eats weekend budget

### Surprise value
- codex most surprising ("the obvious answer is often reflexive")
- frontend-design surprising on a different axis (aesthetic POV)
- opus-main surprising to pick Inferno in 2026 — but disclosed as informed-insider, so partly given away
- sonnet-plan least surprising (SolidJS + Zustand + CodeMirror is the 2026 default)

## What surprised me about the slate (author's observations)

1. **Hyperscript survived two ways.** Expected to be a relic; instead 2 of 4 kept it, via two different living frameworks (Inferno, Mithril). Both made the same argument.
2. **CodeMirror's gravity was stronger than the framework's gravity.** Three different framework picks, one editor. The editor library is the bigger commitment.
3. **The most opinionated proposal came from outside the Claude family.** Codex is the only one to refuse the consensus editor on principle AND to say "no" to collab-in-v1 with conviction. Signs of a proposal not trying to please.

## The pick — claude-frontend-design

**Not the highest-scoring proposal by the brief's lenses** (codex is, with opus-main close behind). **The proposal that produces the most informative build-off in Act 2.**

Reasoning:
- Act 2 measures what time pressure does to LLM code
- The signal is loudest when the proposal has real polish surface to cut
- codex: too little polish surface — Mithril + textarea is already minimum-viable; 1-day and 1-week would look identical
- opus-main: niche-framework tax means 1-day build is mostly "did agent figure out Inferno's hook quirks?" — a Claude-debugging-Inferno story, not a time-pressure story
- sonnet-plan: conventional enough that 1-day vs 1-week don't differ dramatically; legible but not dramatic
- **frontend-design has the most polish surface of any proposal** — editorial typography, custom design tokens, vanilla-extract type system, motion choices, the entire "book page not dashboard" aesthetic. *That's* the surface time pressure cuts.

**The verdict post for a comparative blog series doesn't pick the best proposal in the abstract. It picks the proposal whose downstream consequences make the rest of the series most worth reading.**

## Runner-up: codex

More defensible as "best pure proposal." Its textarea-first argument is the most readable single argument in the slate. Its honesty about bundle methodology is the disclosure the brief wanted.

If optimizing for a single shipped artifact rather than a build-off comparison, codex wins.

## Not picked: opus-main (with disclosure)

The orchestrator picking the orchestrator's own proposal would have been the worst signal this series could send. The slot exists by design to disclose the bias, not to compete on merit.

## What the current post does that's load-bearing

- Runs through all 5 lenses (even if briefly) before picking — demonstrates the lenses aren't decorative
- Makes the pick on a *new* lens (build-off fitness) that wasn't in the brief — discloses this openly
- Names runner-up explicitly
- Names why opus-main is ineligible
- Ends with "if you'd pick differently, the verdict's defensibility lives or dies on whether the build-off-fitness reasoning holds up under disagreement" — invites disagreement

## What the current post does that's NOT load-bearing (drop freely)

- The full lens-by-lens walkthrough (can compress to a grid or paragraph if pacing needs it)
- "Three things jump out before any individual reading..." — AI-rhythm
- Repeated "my read" / "my pick" hedging
- Act 2 preview table at the end (goes in post 5 instead, which is the Act 2 rules post)

## Numbers / specifics worth landing somewhere

- 4 proposals compared
- CodeMirror 6 consensus: 3/4
- Hyperscript: 2 kept / 2 dropped
- Bundle spread: 37 → 100 KB (2.7×)
- Chosen for Act 2: claude-frontend-design
- Runner-up: codex
- Excluded from consideration: claude-opus-main (orchestrator's own)

## Hook the current prose uses (for reference)

Current opener: "I went into this expecting four agents to pick four different frameworks. What I got was something more interesting..." — prediction-vs-reality AI-rhythm. Replace with something that actually grounds your reaction to seeing all four proposals at once.
