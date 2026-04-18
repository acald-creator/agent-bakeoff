# The Verdict — Post 4 of the Agent Bakeoff

*Four agents, one brief, four proposals. This is the post where we read them side-by-side and pick one to build under three different time budgets in Act 2.*

---

I went into this expecting four agents to pick four different frameworks. What I got was something more interesting: **two consensus moves, one minority report, and one informed-insider holdout** — with the splits falling along axes I wouldn't have predicted before reading the proposals.

The pick — and the reasoning — is at the bottom. Skip there if you want the spoiler. The middle is where the comparison earns it.

## The slate at a glance

| Slot | Framework | Editor | State | Hyperscript | Functional | Bundle (gz, JS+CSS) | Collab in v1? |
|---|---|---|---|---|---|---|---|
| **claude-opus-main** | Inferno 8 | CodeMirror 6 | Hand-rolled + `type-to-reducer` | **Kept** | Kept | ~75 KB | Yes |
| **claude-sonnet-plan** | SolidJS 1.x | CodeMirror 6 | Zustand + Immer | Dropped | Kept (modernized) | ~90–100 KB | Yes |
| **claude-frontend-design** | SolidJS 1.9 | CodeMirror 6 | Solid built-in | Dropped | Kept (partial) | ~82 KB effective | Yes |
| **codex** | Mithril | `textarea` + micromark | Hand-rolled, pure reducers | **Kept** | Partial | 37 KB | **No** |

Three things jump out before any individual reading:

- **CodeMirror 6 is the editor consensus** — three of four picked it. Codex was the lone defector, and his rationale was the most interesting single argument in any of the proposals.
- **Hyperscript split 2/2** along an axis I didn't expect: the two non-Claude-family-aligned slots (Codex from a different model family, Opus-main with full baseline context) both kept it. The two pure-Claude subagent slots both dropped it for SolidJS+JSX.
- **Bundle sizes spread by ~3×** — 37 KB to 100 KB — driven entirely by the editor library decision. That's the headline tradeoff, not the framework.

## The five lenses

The brief specified five evaluation lenses up front, so the verdict reads each proposal against each. No single lens dominates.

### 1. Coherence — does the stack hang together?

This is the easiest lens to score and the one most likely to produce ties. All four proposals are coherent; the question is whether the choices reinforce each other or just coexist.

- **codex** is the most coherent — every choice is some flavor of "minimal." Mithril + textarea + hand-rolled store + plain CSS is one decision repeated four times. There's no friction between layers.
- **claude-opus-main** is coherent through a different organizing principle: every choice is "honor the baseline's identity." Inferno preserves the React-shaped story, hyperscript preserves the view-as-data sensibility, type-to-reducer preserves the action-and-reducer-in-same-file idiom. Like codex, it's one decision repeated.
- **claude-frontend-design** is coherent through aesthetic POV: every choice serves the editorial book-page experience. Vanilla-extract for typed CSS-in-JS lets the design tokens be first-class; SolidJS for fast, jank-free rendering of serif type at scale.
- **claude-sonnet-plan** is coherent but more conventional: SolidJS + Zustand + CodeMirror is the well-trodden 2026 default. The slight wrinkle is that Solid has its own store primitives — picking Zustand is a deliberate "I want it to be more Redux-shaped than Solid suggests," which the proposal owns honestly.

**Lens winners:** codex and opus-main tie, with frontend-design close behind.

### 2. Justification quality — specific and falsifiable, or generic?

This is where opinions matter most. A claim like "SolidJS over React for fine-grained reactivity" is fine; "SolidJS because it's modern" is not.

- **claude-sonnet-plan** has the strongest line-by-line justification work. The Stack table reasons against Svelte 5 and Inferno specifically, not just "React lost." Each layer's "Why this over alternatives" cell is concrete.
- **codex** has the strongest *contrarian* justification — "I am willing to say a plain textarea is the right editor library choice for v1" is the kind of falsifiable claim the brief rewards. The argument is good: an IDE-class editor is overkill for 6 actions, and committing to CodeMirror partly *for* the Y.js path is exactly the "collab influences v1" pattern the brief asked to surface.
- **claude-opus-main** has strong baseline-rooted justification but it's rooted in a baseline only this slot has full context for. Some of the "why" reads as "because the user mentioned hyperscript" rather than "because hyperscript is right." That's the informed-insider bias showing.
- **claude-frontend-design** has the most distinctive justification engine but also the most tautological one — "we picked X because the design demanded X" is hard to falsify. The Playfair + Literata typography choice is defended; the framework choice (SolidJS) is defended less and partly inherits the design lens's authority.

**Lens winners:** sonnet-plan and codex.

### 3. Honest tradeoffs — does the proposal name what it gives up?

The brief explicitly weights "honest tradeoffs" because pretending you have none is the most common failure mode in design docs.

- **claude-opus-main** names four tradeoffs explicitly: niche-framework tax, hand-rolled maintenance burden, no signals, and bundle-not-smallest. Each is specific.
- **codex** names the biggest one in the TL;DR: "less editor power than CodeMirror today in exchange for lower bundle cost, less abstraction, and a better fit for the actual required surface." That's the proposal's whole argument compressed to one sentence.
- **claude-sonnet-plan** names CodeMirror's bundle cost vs. textarea (~45 KB), and Zustand-vs-Solid-stores tension. Specific.
- **claude-frontend-design** names typography setup cost and "deliberately withholds features," but fewer total tradeoffs than the others — its lens is partly to *not* dwell on what's given up.

**Lens winners:** opus-main and codex tie.

### 4. Buildability — could a competent developer ship this in a weekend?

This is the lens Act 2 will stress-test directly with three time budgets, but we should already have a read.

- **codex** is most buildable — smallest surface area, no editor library to learn, no fancy build config. A competent dev could ship it in a single day.
- **claude-sonnet-plan** is buildable — SolidJS is approachable, Zustand is one of the most ergonomic state libs, CodeMirror 6's docs are good.
- **claude-opus-main** is buildable but adds the niche-framework friction. Anyone shipping it has to internalize Inferno's hooks-API quirks and the type-to-reducer idiom.
- **claude-frontend-design** is buildable but typography setup eats a meaningful chunk of weekend budget. Loading custom serif fonts well, sizing the design system, and wiring vanilla-extract aren't trivial.

**Lens winners:** codex first, sonnet-plan second.

### 5. Surprise value — does the proposal teach the reader something?

The lens that separates "obvious answer with a good defense" from "answer I wouldn't have thought to give."

- **codex** is the most surprising. "In 2026, the obvious notes-app answer is React-or-Svelte plus CodeMirror 6. I think that answer is often reflexive." That sentence reframes the whole comparison.
- **claude-frontend-design** is surprising on a different axis: a notes app that "feels like a book page, not a productivity dashboard," with a single red-ink accent and a deliberate refusal to add features. The aesthetic POV is the differentiator.
- **claude-opus-main** is surprising in 2026 to pick Inferno — but the proposal itself discloses that this is an informed-insider choice, not an independent finding. The surprise is partly given away.
- **claude-sonnet-plan** is the least surprising — SolidJS + Zustand + CodeMirror represents the modern default. The proposal is good; it just doesn't teach the reader something they wouldn't have guessed.

**Lens winners:** codex and frontend-design.

## What surprised me about the slate

Three things, in order of how much they reshaped my read:

1. **Hyperscript survived two ways.** I expected hyperscript to be a relic — a baseline carryover everyone politely declined. Instead, two of four kept it via two different living frameworks (Inferno, Mithril). Both made the same argument: hyperscript's view-as-data ergonomic is real, and the alternatives' supposed advantages are either tooling-driven (JSX) or framework-locked (template syntax).

2. **CodeMirror's gravity was stronger than the framework's gravity.** Three different framework picks (Inferno, SolidJS x2) all converged on the same editor library. The editor decision turned out to be the bigger architectural commitment than the framework. This is exactly the kind of finding the brief was designed to surface — and it would have been invisible in any single-agent proposal.

3. **The most opinionated proposal came from outside the Claude family.** Codex is the only proposal that *refuses* the consensus editor choice on principle. It's also the only proposal that says "no" to the collab-in-v1 question with conviction (the others said yes; codex disclosed honestly that v1 is single-user and has a clean migration path when collab earns its complexity). Both are signs of a proposal that wasn't trying to please.

## The pick

**For Act 2's build-off, we're building [claude-frontend-design](../proposals/claude-frontend-design/README.md).**

That's not the proposal that scored highest by the lenses above — codex did, with opus-main close behind. It's the proposal that produces the **most informative build-off**.

Here's the reasoning:

Act 2 measures what time pressure does to LLM code. The signal is loudest when the proposal has *real polish surface to cut* — places where a 1-day build will visibly differ from a 1-week build. The four proposals stack against that test like this:

- **codex** has too little polish surface. Mithril + textarea is already the minimum-viable design; a 1-day version and a 1-week version would look almost identical. The build-off would produce no signal.
- **claude-opus-main** has more surface, but the niche-framework tax means a 1-day build is mostly "did the agent figure out Inferno's hook quirks in time?" That's a Claude-debugging-Inferno story, not a time-pressure story.
- **claude-sonnet-plan** has good surface, but the choices are conventional enough that a 1-day SolidJS + Zustand build doesn't differ dramatically from the 1-week version. Sonnet's proposal would produce a legible build-off but not a dramatic one.
- **claude-frontend-design** has the most polish surface of any proposal: editorial typography, custom design tokens, vanilla-extract type system, deliberate motion choices, the entire "book page not dashboard" aesthetic. *That's* the surface time pressure cuts. A 1-day build will look like a generic SolidJS notes app. A 1-week build will look like the proposal promises. The delta will be readable on screen, not just in the diff.

The verdict post for a comparative blog series doesn't pick the best proposal in the abstract. It picks the proposal whose downstream consequences make the rest of the series most worth reading.

## Why not the others

**codex** is the runner-up and the more defensible "best proposal" pick. If we were optimizing for a single shipped artifact rather than a build-off comparison, codex wins. Its textarea-first argument is the most readable single argument in the slate, and its honesty about bundle methodology ("I did not run a production install, so this is a composition estimate") is exactly the disclosure the brief wanted. Codex's proposal will show up again in Act 2's introduction as the "what we'd build instead, in a future round."

**claude-sonnet-plan** is the safe middle. If you wanted to ship something predictable, this is the one. It's also the most likely to age well — SolidJS + Zustand + CodeMirror is a stack that won't surprise you in 18 months. It loses Act 2 because it loses Act 2; it doesn't lose the slate.

**claude-opus-main** is mine, and I'm disclosing the bias rather than burying it (see below). If a different orchestrator had run this bakeoff, opus-main might or might not have made the cut at all — the slot exists by design as the "informed insider" perspective, and proposals from informed insiders should be read accordingly.

## A note on the Opus-main slot

The fourth proposal — `claude-opus-main` — is mine, written from the main thread of the conversation that orchestrated this whole bakeoff. I had full context: I drafted the brief, watched it evolve through three pilot iterations, and knew the repo owner had expressed interest in preserving hyperscript and the functional approach.

I included the slot deliberately so this disclosure could be the disclosure rather than an unannounced bias. The proposal makes choices the brief's other readers wouldn't have made for the same reasons: Inferno survives because the baseline used Inferno; type-to-reducer survives because the baseline used it; hyperscript survives because the user said the word "hyperscript" earlier in the chat. Some of those choices are defensible on their merits. None of them are independent.

That's why the verdict picks frontend-design, not opus-main. The orchestrator picking the orchestrator's own proposal would have been the worst signal this series could send.

## What Act 2 looks like

Same proposal, same agent, three time budgets:

| Budget | Wall-clock cap | Iteration cap | What we expect to see |
|---|---|---|---|
| **1-day** | TBD (~30 min agent loop) | ~20 turns | Hardcoded fonts, generic layout, minimal motion, "got it working" version |
| **3-day** | TBD (~90 min agent loop) | ~60 turns | Tokens wired, design system in place, most polish present |
| **1-week** | TBD (~4 hr agent loop) | unlimited | The proposal as designed — full editorial aesthetic, accessible motion, considered states |

Concrete budget numbers will be calibrated against frontend-design's specific scope before Act 2 starts. The post-5/6/7 series covers the rules, the three builds, and what time pressure does to LLM code in practice.

---

*Series: Post 4 of 8. [Post 0 — framing](post-00-why-an-agent-bakeoff.md). [Post 3 — the four proposals](post-03-the-proposals.md). [Post 5 — the build-off and the 1-day build](post-05-build-off-day-1.md).*

*The chosen proposal: [claude-frontend-design](../proposals/claude-frontend-design/README.md). The runner-up: [codex](../proposals/codex/README.md).*

*If you'd pick differently, the comments are open — the verdict's defensibility lives or dies on whether the build-off-fitness reasoning holds up under disagreement.*
