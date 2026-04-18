# post-03 facts-only skeleton

*Source material for rewriting "The proposals" (mega-post, one section per agent, no comparison). NOT for publication.*

---

## What this post must establish

1. Four proposals were produced independently against the same v1.4 brief.
2. Each proposal is internally coherent on its own terms — this post presents each alone, before the next post stacks them against each other.
3. The agents went to meaningfully different places, not trivially different places.
4. The order of presentation is alphabetical-by-slot-name — not ranked, not thematic.

## The four proposals in the original Round 1 slate

*(Note: this was written when the slate was 4 agents. Round 3 expanded to 8 — if rewriting post-publication, either add a "the slate later grew" note or keep this post scoped to the original 4.)*

### claude-frontend-design

- **Stack:** SolidJS 1.9 + CodeMirror 6 + vanilla-extract + Vite 6
- **Bundle:** ~82 KB gzipped (effective first-load)
- **Collab in v1:** yes (CodeMirror chosen partly for Y.js path; note shape sized for LWW merge)
- **Hyperscript:** Dropped, with reasoning
- **Functional:** Kept (partial)
- **Slot value:** UX/visual design as the leading concern

Distinctive moves:
- Editorial "book page, not productivity dashboard" aesthetic
- Warm aged-paper palette (#F5F0E8 bg, #1A1510 ink, #B8311F red accent)
- Playfair Display + Literata editorial serifs
- vanilla-extract specifically because typed tokens become first-class TypeScript values
- Framework choice follows from design POV, not the reverse
- Acknowledges collab as "passive enabler, not active feature" — a real step back from pretending v1 shipped collab

### claude-opus-main

- **Stack:** Inferno 8 + `inferno-hyperscript` + CodeMirror 6 + Vite 6 + TypeScript 5.5
- **Bundle:** ~75 KB gzipped
- **Collab in v1:** yes (editor + note schema choices; NOT framework or state)
- **Hyperscript:** Kept
- **Functional:** Kept (modernized instruments — Remeda instead of Rambda)
- **Slot value:** informed insider — orchestrator's own proposal, disclosed

Distinctive moves:
- The only proposal that treats "Inferno in 2026" as a live choice rather than a retirement
- Each baseline carryover (hyperscript, FSA-style actions, reducer-in-file, functional helpers) transfers cleanly
- 2026 upgrade is surgical: Vite replaces Webpack, TS 5.5 replaces 4.5, Remeda replaces Rambda, CodeMirror 6 adds real editor surface, IDB replaces nothing (baseline didn't persist)
- Meta/body split: app store owns `meta` (title, tags, timestamps), CodeMirror owns `body` (string) — makes eventual Y.js swap a body-only replacement
- Almost picked Mithril instead; didn't because it would have abandoned the baseline's Inferno+Redux lineage specifically

Disclosure (stated in the proposal itself):
> "This proposal is produced by the main-thread 'informed insider' slot. Unlike the other three agents, I had full orchestration context: I watched the brief evolve from v1.2 → v1.4, I know the repo owner articulated interest in preserving hyperscript and functional approach as part of the series' narrative, and I shaped the brief's own language. Treat this proposal's biases accordingly — it is the proposal most likely to reflect the orchestrator's own priors, by design."

### claude-sonnet-plan

- **Stack:** SolidJS 1.x + Zustand 5 (Immer) + CodeMirror 6 + Vite 6
- **Bundle:** ~90–100 KB gzipped
- **Collab in v1:** yes (state shape designed for CRDT mapping; CodeMirror for Y.js path)
- **Hyperscript:** Dropped
- **Functional:** Kept (selectively modernized)
- **Slot value:** planning-first — explicit architectural reasoning

Distinctive moves:
- Strongest line-by-line justification work — every Stack table cell argues against specific alternatives (not "modern default")
- Names a specific architectural *seam* up front: "CodeMirror as uncontrolled island" — the "first thing to change" on the collab path
- Zustand over Solid's built-in stores is defended explicitly: "want Redux-shaped state container that maps cleanly onto a CRDT model later"
- The planning-first lens produces the "articulate the seam now, don't refactor later" move

### codex

- **Stack:** Mithril + native `<textarea>` + micromark (markdown preview) + hand-rolled functional store + Vite 7
- **Bundle:** 37 KB gzipped (composition estimate, disclosed)
- **Collab in v1:** **no** (only proposal to decline)
- **Hyperscript:** Kept (specifically argued)
- **Functional:** Kept (partial)
- **Slot value:** different model family (non-Claude); independent reasoning

Distinctive moves:
- The only proposal that doesn't pick CodeMirror
- Explicit contrarian position: "The surprising part is probably what I did not choose. In 2026, the obvious notes-app answer is 'React or Svelte plus CodeMirror 6.' I think that answer is often reflexive."
- Hyperscript defended in unusually strong terms: "the baseline used hyperscript as a real authoring preference, not as an accident before JSX won"
- Honest bundle disclosure: "I did not run a production install in this turn, so this is a bundle-composition estimate rather than an emitted-build measurement"
- Bonus section (despite v1 = no) is actually specific: "swap editor layer to CodeMirror 6 + Y.js via PartyKit when collab earns the complexity"
- Stronger position than the three "yes" proposals — not "I considered collab and shaped v1 around it," but "I deliberately didn't shape v1 around collab, and here's the exact swap for when it becomes real"

## What the current post does that's load-bearing

- Presents each agent individually before comparing (readers form impressions alone before being told the matrix)
- Quotes each proposal's TL;DR verbatim (establishes each voice/framing)
- Names the *distinctive move* of each (what makes this proposal different from the others on the same brief)
- Puts the opus-main disclosure inside that section, not separate (bias is named in place, not as afterthought)

## What the current post does that's NOT load-bearing (drop freely)

- "Order is alphabetical by slot name. No ranking implied" preamble — state once or not at all
- "The interesting thing about reading proposals one at a time, without the comparison framing..." closer — AI meta-commentary
- "Hold that before you flip to the matrix" — AI-rhythm
- Long quoted blocks of the proposals themselves — link to the files instead

## Numbers / specifics worth landing somewhere

- 4 proposals in Round 1
- Bundle range: 37 KB (codex) to 90–100 KB (sonnet-plan) — 2.7× spread
- Editor-library split at Round 1: 3 CodeMirror 6 + 1 textarea
- Hyperscript split at Round 1: 2 kept + 2 dropped
- Collab-in-v1 declarations: 3 yes + 1 no

## Hook the current prose uses (for reference)

Current opener: "Four agents. Same brief (v1.4 — see [post 2]...). Four very different proposals." Fragmented-sentence AI-rhythm — scene-setting. Find your own on-ramp.
