# The Brief

The brief went through four versions. V1.0 lived in my head and never ran against an agent. The final one, v1.4, shipped to all four.

The full v1.4 text lives [in the repo](https://github.com/acald-creator/agent-bakeoff/blob/main/blog/the-brief.md). This post is how it got there.

## v1.0 — author's head

Modernize the 2022 todo in place. Open framework, state, build tool, and editor library. Output a proposal doc.

Two problems obvious before any agent saw it.

Rebuilding a todo for the fourth time wouldn't produce interesting comparison material. Different framework picks would all converge on the same shape.

No required carryovers. Without explicit asks, every agent defaults to "drop the 2022 stuff, pick whatever's modern." Every proposal would read the same way.

Both got fixed before the brief touched a real agent.

## v1.1 — app pivot

The app changed from "modernize the existing todo" to "single-user markdown notes editor that could plausibly become collaborative." Same complexity floor, more interesting decisions. Notes force a real editor-library pick that todos don't.

The baseline got reframed. Not a literal starting point, a complexity reference. Build a different app of similar weekend scope.

Added an optional bonus section asking agents to sketch how they'd add real-time multi-user editing, without requiring it. Lets agents flex on collab without forcing every proposal to deal with sync stacks.

## v1.2 — the carryovers section

Biggest structural addition. A new section called "Carryovers from the baseline" named two choices as soft preferences with required justification.

Hyperscript over JSX. The baseline used `inferno-hyperscript`. Keep or drop, but if you drop it, justify it specifically against hyperscript, not just "JSX is the modern default."

Functional programming approach. Pure reducers, immutable list ops, point-free helpers. Same rule. Keep or drop, with specific reasoning.

The output schema got a required `## Carryovers from the baseline` section so the comparison post could read all proposals side by side at the same heading.

I considered this version ready. It was not.

## Pilot #1, v1.2

Claude Sonnet via the Plan subagent, fresh context. I asked for a proposal and a brief critique. What was ambiguous, what fought it, what would make other agents produce non-comparable output.

The proposal came back fine. SolidJS + Vite + CodeMirror 6 + built-in stores. The critique surfaced three real issues.

1. "Could plausibly become collaborative" was ambiguous. The brief didn't say whether v1 design should absorb collab concerns (picking CodeMirror 6 partly for its Y.js path) or treat collab as pure flavor text. The pilot agent did the former. Another might do the latter. The editor-library comparison would be unreadable across them.

2. The architecture-sketch example was stale. I'd written "trace how 'toggle complete' travels through the system," a leftover from the todo era. Each agent would substitute their own example, making that section structurally incomparable.

3. The `Independence` field was underspecified. Agents asked to self-rate high/medium/low without definition. Different agents would measure different things. The field would be meaningless across proposals.

All three real. None were things I would have caught reading my own draft.

## v1.3 — patches

Added a required Agent-header field: `Collab considered in v1 design: yes / no — and if yes, which v1 decisions it influenced`. Forces a binary stance with optional detail.

Replaced the stale "toggle complete" example with two pinned notes-app actions, same for every agent. "Save an edit to a note" and "switch to a different note." The architecture section now produces structurally comparable content.

Removed `Independence`. That's orchestrator metadata, not proposal content. I fill it in the verdict post.

## Pilot #2, v1.3

Re-ran the same pilot against the patched brief. The stack changed materially. Sonnet went from SolidJS + built-in stores to SolidJS + Zustand + CodeMirror 6. The collab declaration forced the agent to acknowledge that some of its choices (CodeMirror specifically) were collab-influenced. Once that acknowledgment was on the table, the state-management decision got explicitly Redux-shaped, leading to Zustand instead of Solid's signals.

A brief affecting a proposal, not just describing it. The patch wasn't cosmetic.

Second pilot's critique was smaller.

1. "Which v1 decisions" granularity was freeform. Accepted as qualitative content.
2. Bundle size methodology was unanchored. JS only? CSS included? Pre or post tree-shake? Patched.
3. Self-assessment honesty, distinguishing "picked because of collab" from "happens to be compatible," requires honesty the brief can't engineer. Accepted.

## v1.4 — the final patch

One line, big effect.

> Estimated bundle size: `<X KB gzipped>` — measured as JS + CSS in the production build, gzipped, excluding fonts and images. Methodology: actual build and measure preferred, bundlephobia summing of deps is acceptable. Show your math (e.g., `solid-js 7KB + codemirror-core 45KB + ... = 90KB`).

Without this, bundle sizes aren't diff-able across proposals. With it in place and v1.3 holding up, I fanned out to all four agents.

## What v1.4 asks for

- App. Single-user markdown notes editor, plausibly extensible to collab.
- Hard constraints. Static or edge-runtime only, SPA UX, modern toolchain (Node 20+), exact output schema.
- Required carryovers. Hyperscript-over-JSX and functional approach. Keep, drop, or partial, with specific reasoning.
- Required declaration. Collab considered in v1 design, yes or no, plus which decisions it influenced.
- Required action traces. "Save an edit to a note" and "switch to a different note."
- Required bundle math. JS + CSS gzipped, excluding fonts and images, with shown math.
- Output. Eleven-section proposal document, 1,500 to 2,500 words, plus optional supporting files.
- Optional bonus. 200 to 400 word collab sync sketch.
- Five evaluation lenses (for the verdict post). Coherence, justification quality, honest tradeoffs, buildability, surprise value.

## Three lessons

Pilot before fanning out. Pilots cost ~15 minutes of agent time. Re-rolling all four agents on a broken brief costs much more.

Required carryovers are the most decision-revealing part of a rebuild brief. Without them, every proposal silently defaults to "drop the old stuff" and the comparison loses most of its signal. With them on record, splits become readable.

Pin specific actions to trace. Letting agents pick their own example is a recipe for non-comparable architecture sections.

## The abstracted lesson

The brief isn't the prompt. The brief is the contract. A contract has to be specific enough that two parties writing against it produce comparable output without coordinating. Same prompt to four agents is necessary but not sufficient. The prompt has to be a contract whose inputs and outputs are both pinned.

Next: [The Proposals](post-03-the-proposals.md).
