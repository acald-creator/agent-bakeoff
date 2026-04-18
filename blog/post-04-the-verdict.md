# The Verdict

Three of four picked CodeMirror 6 as the editor. Two of four kept hyperscript. Bundle sizes spread 2.7x, driven by editor-library choice rather than framework.

The pick is at the bottom. Skip there for the spoiler, or read the matrix first.

## The slate at a glance

| Slot | Framework | Editor | Bundle (gz) | State | Hyperscript | Functional | Collab v1? |
|---|---|---|---|---|---|---|---|
| claude-opus-main | Inferno 8 | CodeMirror 6 | ~75 KB | Hand-rolled `type-to-reducer` | Kept | Kept | Yes |
| claude-sonnet-plan | SolidJS 1.x | CodeMirror 6 | ~90–100 KB | Zustand + Immer | Dropped | Kept | Yes |
| claude-frontend-design | SolidJS 1.9 | CodeMirror 6 | ~82 KB | SolidJS built-in | Dropped | Partial | Yes |
| codex | Mithril | textarea + micromark | 37 KB | Hand-rolled reducers | Kept | Partial | No |

## The three patterns

CodeMirror 6 is the editor consensus. Three different framework picks, one editor. The editor decision turned out to be a bigger architectural commitment than the framework. Invisible in any single-agent proposal.

Hyperscript split 2/2 along an unexpected axis. The two slots outside the default Claude-subagent setup (Codex from a different model family, Opus-main with full baseline context) both kept hyperscript. The two pure-Claude subagent slots both dropped it for SolidJS + JSX. The split tracks model-family and context, not framework.

Bundle sizes spread 3x, 37 KB to 100 KB. Not framework-driven, editor-library driven. Codex (textarea + micromark) is 37 KB. Sonnet-plan (Zustand + CodeMirror) is 100 KB.

## The five lenses

The brief specified five evaluation lenses up front. Coherence, justification quality, honest tradeoffs, buildability, surprise value. No single lens dominates the verdict.

### Coherence

All four coherent. The question is whether choices reinforce each other or just coexist.

Codex and opus-main tie. Codex by "minimal" repeated four times (Mithril + textarea + hand-rolled store + plain CSS). Opus-main by "honor the baseline's identity" (Inferno, hyperscript, type-to-reducer, all carrying the baseline's DNA forward).

Frontend-design close behind, coherent through aesthetic POV. Every choice serves the book-page experience.

Sonnet-plan coherent but most conventional. SolidJS + Zustand + CodeMirror is the 2026 default. No friction, no signature either.

### Justification quality

Sonnet-plan has the strongest line-by-line work. Every Stack cell argues against a specific alternative, not just "modern default."

Codex has the strongest contrarian justification. "A plain textarea is the right editor library choice for v1" is falsifiable. The argument behind it (an IDE-class editor is overkill for 6 actions, and committing to CodeMirror partly for the Y.js path is exactly the "collab influences v1" pattern the brief asked to surface) is specific.

Opus-main has strong baseline-rooted justification, rooted in context only this slot had. Some of the "why" reads as "because the user mentioned hyperscript," which is the informed-insider bias showing.

Frontend-design has the most distinctive justification engine and the most tautological one. "We picked X because the design demanded X" is hard to falsify.

### Honest tradeoffs

Opus-main and codex tie.

Opus-main names four tradeoffs explicitly. Niche-framework tax, hand-rolled maintenance burden, no signals, bundle not smallest.

Codex names the biggest in the TL;DR. "Less editor power than CodeMirror today in exchange for lower bundle cost, less abstraction, and a better fit for the actual required surface." The whole argument compressed.

Sonnet-plan names CodeMirror's 45 KB cost and the Zustand-vs-Solid-stores tension.

Frontend-design names typography setup cost and deliberate feature withholding. Fewer tradeoffs total. The aesthetic lens is partly to not dwell on what's given up.

### Buildability

Codex first. Smallest surface, no editor library to learn, no fancy build config. Shippable in a day.

Sonnet-plan second. Approachable stack, good docs.

Opus-main buildable but with niche-framework friction. An engineer has to internalize Inferno's hooks-API quirks and the `type-to-reducer` idiom.

Frontend-design buildable but typography setup eats a meaningful chunk of weekend budget. Custom serif fonts, sizing the design system, wiring vanilla-extract aren't trivial.

### Surprise value

Codex most surprising. "The obvious 2026 notes-app answer is React or Svelte plus CodeMirror 6. I think that answer is often reflexive." That sentence reframes the whole comparison.

Frontend-design surprising on a different axis. A notes app that "feels like a book page, not a productivity dashboard." Aesthetic POV as the differentiator.

Opus-main surprising to pick Inferno in 2026, but the proposal itself discloses that this is an informed-insider choice, not an independent finding. The surprise is partly given away.

Sonnet-plan least surprising. SolidJS + Zustand + CodeMirror is the 2026 default. Good proposal, doesn't teach the reader something they wouldn't have guessed.

## The pick: claude-frontend-design

Not the highest-scoring by the lenses above. Codex is, with opus-main close behind. Frontend-design produces the most informative build-off.

Act 2 measures what time pressure does to LLM code. The signal is loudest when the proposal has real polish surface to cut. Places where 1-day and 1-week produce visibly different artifacts.

Codex has too little polish surface. Mithril + textarea is already minimum-viable. A 1-day and 1-week version would look nearly identical. No signal.

Opus-main has more surface, but the niche-framework tax means a 1-day build is mostly "did the agent figure out Inferno's hook quirks in time?" A Claude-debugging-Inferno story, not a time-pressure story.

Sonnet-plan has good surface but conventional choices. A 1-day SolidJS + Zustand build doesn't differ dramatically from a 1-week one. Legible but not dramatic.

Frontend-design has the most polish surface of any proposal. Editorial typography, custom design tokens, vanilla-extract type system, deliberate motion choices, the entire "book page not dashboard" aesthetic. A 1-day build will look like a generic SolidJS notes app. A 1-week build will look like the proposal promises. The delta will be readable on screen, not just in the diff.

The verdict for a comparative series doesn't pick the best proposal in the abstract. It picks the proposal whose downstream consequences make the rest of the series most worth reading.

## Runner-up: codex

More defensible as "best pure proposal." The textarea-first argument is the most readable single argument in the slate. The bundle-methodology honesty is exactly the disclosure the brief wanted.

Optimizing for a single shipped artifact rather than a build-off comparison, codex wins.

## Not considered: claude-opus-main

My own proposal. The orchestrator picking the orchestrator's own proposal would have been the worst signal this series could send. The slot exists by design to disclose the bias, not to compete on merit.

Next: [The Build-Off + 1-Day Build](post-05-build-off-day-1.md).
