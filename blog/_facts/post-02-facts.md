# post-02 facts-only skeleton

*Source material for rewriting "The brief" (how the prompt evolved). NOT for publication.*

---

## What this post must establish

1. The brief went through four versions before it was stable enough to send to agents.
2. A brief that seems unambiguous to its author is almost certainly ambiguous to a fresh agent — pilot before fanning out.
3. Required per-section *reasoning* ("kept / dropped / partial with specific reasoning") is what makes a bakeoff brief produce comparison signal; schema alone isn't enough.
4. Two specific pilot critiques genuinely changed the brief (not just polished it).

## The four versions — what changed at each step

### v1.0 (author's head, never run against an agent)
- App: "modernize the 2022 todo in place"
- Open framework/state/build/editor choices
- No required carryovers

Problems obvious to author before pilot:
- Todo app rebuild = boring fourth-time-around comparison
- No required carryovers → every proposal defaults to "drop the 2022 stuff, pick modern"

### v1.1 — app pivot
- App changed from "modernize existing todo" to "single-user markdown notes editor that could plausibly become collaborative"
- Baseline reframed as complexity reference, not literal starting point
- Added optional bonus: "collab sync sketch" — agents may flex without being required to

### v1.2 — the carryovers section
Biggest structural addition:
- New section called "Carryovers from the baseline"
- Two choices named as soft preferences with required justification:
  - **Hyperscript over JSX** — keep or drop, justify specifically against hyperscript
  - **Functional programming approach** — keep or drop, justify specifically
- Output schema updated with a required `## Carryovers from the baseline` section

Author considered this version ready. It was not.

### Pilot #1 — Claude Sonnet via Plan subagent, run against v1.2

Produced a solid proposal (SolidJS + Vite + CodeMirror 6 + built-in stores). Brief critique surfaced three real issues:

1. **"Could plausibly become collaborative" was ambiguous.** Pilot agent let collab influence v1 choices (CodeMirror 6 partly for Y.js path); another agent might treat it as pure flavor text. Editor-library comparison would be unreadable across agents.
2. **Architecture-sketch example was stale.** Brief said "trace how 'toggle complete' travels through the system" — leftover from todo era. Each agent would substitute their own example; section would be structurally incomparable.
3. **`Independence` field underspecified.** Agents asked to self-rate high/medium/low without definition. Different agents would measure different things; field would be meaningless across proposals.

### v1.3 — patches
- Added required field to Agent header: `Collab considered in v1 design: yes / no — and if yes, which v1 decisions it influenced`. Forces binary stance.
- Replaced stale "toggle complete" example with **two pinned notes-app actions** every agent traces: `"save an edit to a note"` and `"switch to a different note"`.
- Removed `Independence` field (it's orchestrator metadata, not proposal content).

### Pilot #2 — same Sonnet subagent, v1.3 brief

Notable: **stack changed materially** between v1.2 and v1.3 pilots. Sonnet went from SolidJS + built-in stores to **SolidJS + Zustand + CodeMirror 6**. The collab declaration forced honest acknowledgment that choices were collab-influenced; once on the table, the state-management decision became explicitly Redux-shaped.

**This is evidence a brief change affected a proposal, not just described it.**

Remaining critiques:
1. Collab "which v1 decisions" granularity is freeform (accepted — qualitative content)
2. Bundle size methodology is unanchored (patched)
3. Self-assessment honesty ("picked because of collab" vs "happens to be compatible") — accepted as unfixable at prompt level

### v1.4 — the final patch
One line, big effect:

> **Estimated bundle size:** `<X KB gzipped>` — measured as **JS + CSS in the production build, gzipped, excluding fonts and images**. Methodology: actual build & measure preferred; bundlephobia summing of deps acceptable. Show your math.

Without this, bundle sizes across proposals aren't diff-able. With it, they are.

## What the final brief (v1.4) asks for

- App: single-user markdown notes editor, plausibly extensible to collab
- Hard constraints: static or edge-runtime only, SPA UX, modern toolchain (Node 20+), exact output schema
- Required carryovers (with specific reasoning if dropped): hyperscript-over-JSX, functional approach
- Required declaration: Collab considered in v1 design — yes/no
- Required action traces: "save an edit to a note", "switch to a different note"
- Required bundle math: JS+CSS gzipped, excluded fonts/images, show math
- Output: 11-section proposal document, 1,500–2,500 words
- Optional bonus: 200–400 word collab sync sketch
- Five evaluation lenses (for verdict post): coherence, justification quality, honest tradeoffs, buildability, surprise value

## Three lessons for anyone writing a similar brief

1. **Pilot before fanning out.** Pilots are ~15 min of agent time. Re-rolling all agents on a broken brief is not.
2. **Required carryovers are the most decision-revealing part.** Without them, every proposal silently defaults to "drop the old stuff." With them on record, splits become readable.
3. **Pin specific actions to trace.** Letting agents pick their own example = non-comparable architecture sections.

## The practical lesson (abstracted)

> The brief isn't the prompt. The brief is the *contract*, and a contract has to be specific enough that two parties writing against it produce comparable output without coordinating. "Send the same prompt to four agents" is necessary but not sufficient. The prompt has to be a contract whose inputs *and* outputs are both pinned.

## What the current post does that's load-bearing

- Walks through each version in sequence (the evolution IS the story)
- Quotes the specific critiques the pilot agent returned (evidence, not assertion)
- Names the "stack changed between pilots" observation specifically (evidence that briefs affect proposals)
- Ends with transferable lessons, not just series-specific recap

## What the current post does that's NOT load-bearing (drop freely)

- The "single most underrated lesson" opener — AI-rhythm
- Repeated "this is not enough" framings
- "If you take one thing away from this post" — AI-rhythm
- The full brief appendix at the end (already linked from the repo README; don't re-quote)

## Numbers / specifics worth landing somewhere

- 4 brief versions: v1.0 (never run) → v1.1 (app pivot) → v1.2 (carryovers added) → v1.3 (pilot patches) → v1.4 (bundle methodology)
- 2 pilot runs against same Sonnet subagent
- Pilot #1 critiques: 3 real issues
- Pilot #2 critiques: 1 real + 2 accepted
- 11 required section headers in final output schema
- Target: 1,500–2,500 words per proposal
- Optional bonus: 200–400 word collab sketch
- 5 evaluation lenses

## Hook the current prose uses (for reference)

Current opener: "The single most underrated lesson from this whole series..." Leads with declaration. AI-rhythm. Find your own on-ramp — probably something concrete about a specific pilot critique or the moment of realizing v1 was broken.
