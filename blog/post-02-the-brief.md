# The Brief — Post 2

*The prompt every agent in the bakeoff received. And the four iterations it took before that prompt survived contact with an actual agent.*

---

The single most underrated lesson from this whole series: **a brief that seems unambiguous to its author is almost certainly ambiguous to a fresh agent.**

I drafted what I thought was a clean v1.0. By the time the bakeoff actually fanned out to all four agents, the brief was on v1.4. Four versions, three rounds of edits, two pilot runs against a single agent. This post is the story of how each version broke and what got patched.

If you skipped the brief itself, it's published in full at [the-brief.md](the-brief.md). This post is about how it got there.

## v1.0 — the optimistic draft

The first draft was straightforward in its own author's head. It said something like: "Here's a 2022 baseline; propose how you'd modernize it in 2026." Open framework choice, open state choice, open build tool, open editor library. Output a proposal doc.

Two problems were obvious before any agent saw it:

- **The app was still a todo.** Modernizing a todo app for the fourth time wasn't going to produce interesting comparison material. Different framework picks would all converge on essentially the same shape.
- **There were no required carryovers.** Without explicit asks, every agent would default to "drop the 2022 stuff, pick whatever's modern." That would make every proposal read the same way: "we picked SolidJS / Svelte / React, dropped Inferno, dropped hyperscript, here's why."

Both got fixed before the brief touched a real agent.

## v1.1 — the markdown editor pivot

The app changed from "modernize the existing todo" to "build a single-user markdown notes editor that could plausibly become collaborative." Same complexity floor, much more interesting decisions:

- **Editor library decision.** A todo doesn't need an editor library; a notes app does. Suddenly CodeMirror vs. ProseMirror vs. TipTap vs. Monaco vs. plain `<textarea>` is a real choice every proposal has to make.
- **The "could plausibly become collaborative" hook.** I added an optional bonus section asking agents to sketch how they'd add real-time multi-user editing — without requiring it. This let agents flex on collab without forcing every proposal to deal with sync stacks.

The baseline got reframed too: not as a literal starting point, but as a complexity reference. "Build a different app of similar weekend scope, using the baseline as a vibe-check, not a template."

## v1.2 — the carryovers section

The biggest structural addition. A new section called "Carryovers from the baseline" that named two specific choices as **soft preferences with required justification**:

1. **Hyperscript over JSX.** The baseline used `inferno-hyperscript`. Some 2026 frameworks still support hyperscript natively (Inferno, Mithril, hyperapp, snabbdom). Most have moved on to JSX. The brief said: keep it or drop it, but if you drop it, justify it specifically against hyperscript — not just "JSX is the modern default."

2. **Functional programming approach.** The baseline leaned functional: pure reducers via `type-to-reducer`, immutable list operations via `funkia/list`, point-free helpers via `rambda`. Same rule: keep or drop, with specific reasoning.

These ended up being the most decision-revealing parts of the eventual proposals. Without them, every proposal would have silently dropped both and never explained why. With them, the four proposals divide cleanly into "kept hyperscript" (Inferno, Mithril) vs. "dropped hyperscript" (SolidJS x2), and the reasoning in each case is on-record.

The output schema also got a required `## Carryovers from the baseline` section so the comparison post could read all four side-by-side at the same heading.

This is the version I considered "ready." It was not.

## Pilot run #1 — Sonnet on v1.2

Before sending the brief to all four agents, I ran one pilot. Claude Sonnet via the Plan subagent, fresh context, full v1.2 brief. I asked it to produce a proposal *and* a brief critique — what was ambiguous, what fought it, what would make other agents produce non-comparable output.

It picked SolidJS + Vite + CodeMirror 6 + TypeScript with built-in stores. Solid proposal. The critique was the interesting part:

1. **"Could plausibly become collaborative" influences architecture ambiguously.** The brief didn't say whether v1 design should *absorb* collab concerns (e.g., picking CodeMirror 6 partly for its Y.js path) or treat collab as pure flavor text. The pilot agent did the former; another agent might do the latter; the editor-library comparison would be unreadable across them.

2. **The architecture-sketch example was stale.** I'd written "trace how a 'toggle complete' travels through the system" — a leftover from the original todo brief. Each agent would substitute their own action for the trace, making that section structurally incomparable.

3. **The "Independence" field in the agent header was underspecified.** I'd asked agents to self-rate their independence as high/medium/low, without defining what that meant. Different agents would measure different things; the field would be meaningless across proposals.

All three were real. None were things I would have caught reading my own brief.

## v1.3 — the patches

- **(a)** Added a required field to the Agent header: `Collab considered in v1 design: yes / no — and if yes, which v1 decisions it influenced`. Forces every proposal to declare a binary stance with optional supporting detail. Makes the editor-library comparison readable.
- **(b)** Replaced the stale "toggle complete" trace with two pinned notes-app actions: `"save an edit to a note"` and `"switch to a different note"`. Same two actions, every agent, every proposal. The Architecture sketch section now produces structurally comparable content.
- **(c)** Removed the self-rated `Independence` field. Independence is metadata about the orchestration setup, not the proposal. The orchestrator (me) fills it in the verdict post.

## Pilot run #2 — Sonnet on v1.3

Re-ran the same pilot against the patched brief. The first thing to notice: the stack changed materially. Sonnet went from SolidJS + built-in stores to **SolidJS + Zustand + CodeMirror 6**. The collab-in-v1 declaration forced the agent to acknowledge that some of its choices (CodeMirror specifically) were collab-influenced — and once that acknowledgment was on the table, the state-management decision got explicitly Redux-shaped, leading to Zustand instead of Solid's signals.

That's a real example of a brief affecting a proposal, not just describing it. The patch wasn't cosmetic.

The second pilot's critique was much smaller:

1. **The "which v1 decisions" granularity** in the collab declaration was freeform. Agents would draw the line differently between "I picked this *because* of collab" and "this happens to be compatible with collab."
2. **Bundle size methodology was unanchored.** Was it JS only? CSS included? Pre or post tree-shake? Different agents would measure different things; the numbers wouldn't diff cleanly.
3. **Self-assessment honesty.** Distinguishing "picked because of collab" from "happens to be compatible" requires honesty the brief can't engineer.

I patched #2 (a real defect) and accepted #1 and #3 as freeform/qualitative content the verdict post would handle.

## v1.4 — the final patch

One line, big effect:

> **Estimated bundle size:** `<X KB gzipped>` — measured as **JS + CSS in the production build, gzipped, excluding fonts and images**. Methodology: actual build & measure preferred; bundlephobia summing of deps is acceptable. Show your math (e.g., `solid-js 7KB + codemirror-core 45KB + ... = 90KB`).

That's the diff between a brief where bundle sizes are diff-able across proposals and a brief where they aren't. With that in place and the rest of v1.3 holding up, I fanned out to all four agents.

## What the final brief asks for

A summary, since the source is a few hundred lines:

- **The app:** a single-user markdown notes editor (notes CRUD, markdown editor with preview, localStorage persistence, sidebar navigation, search). Plausibly extensible to collab later.
- **Hard constraints:** deployable as static or edge-runtime only (no per-proposal backend), SPA UX, modern toolchain (Node 20+), exact output schema.
- **Required carryovers:** hyperscript-over-JSX and functional programming approach. Keep, drop, or partial — with specific reasoning either way.
- **Required declaration:** Collab considered in v1 design — yes or no, plus which decisions it influenced if yes.
- **Required action traces:** "save an edit to a note" and "switch to a different note." Same two actions for every agent.
- **Required bundle math:** JS + CSS gzipped, excluding fonts and images, with shown math.
- **Required output:** a proposal document with eleven specific section headers in a specific order, 1,500–2,500 words, plus optional supporting files.
- **Optional bonus:** a 200–400 word collab sync sketch.
- **Five evaluation lenses** (for the verdict post): coherence, justification quality, honest tradeoffs, buildability, surprise value.

The full brief is at [the-brief.md](the-brief.md).

## What I'd tell my v1.0 self

Three things, in order of how much they changed the eventual outcome:

1. **Pilot before fanning out.** Pilots are cheap (~15 minutes of agent time per run). Re-rolling all four agents on a broken brief is not. The two pilot rounds caught issues I couldn't see by reading my own draft.

2. **Required carryovers are the most decision-revealing part of any rebuild brief.** Without them, every proposal silently defaults to "drop the old stuff" and the comparison loses most of its signal. With them on-record, the splits become readable.

3. **Pin specific actions to trace.** Letting agents pick their own example to illustrate is a recipe for non-comparable architecture sections. Two pinned actions, same two for every agent, traced through each proposal — that's where the architectural diff becomes legible.

The brief that survived contact is the one in front of you. The brief that didn't — the v1.0 that lived in my head and seemed obvious — would have produced a bakeoff where every proposal looked roughly the same and the comparison post would have been ten paragraphs of "they all picked SolidJS, here's why that's reasonable."

## What this post is also about

There's a practical lesson here for anyone doing multi-agent orchestration work: the brief isn't the prompt. The brief is the *contract*, and a contract has to be specific enough that two parties writing against it produce comparable output without coordinating. "Send the same prompt to four agents" is necessary but not sufficient. The prompt has to be a contract whose inputs and outputs are *both* pinned.

If you take one thing away from this post, take that.

The next post — [The Proposals](post-03-the-proposals.md) — presents all four agents' actual outputs, on their own terms, before [The Verdict](post-04-the-verdict.md) compares them.

---

*Series: Post 2 of 8. Previous: [What's in the Box](post-01-whats-in-the-box.md). Next: [The Proposals](post-03-the-proposals.md).*

*Source: [the-brief.md (v1.4)](the-brief.md).*
