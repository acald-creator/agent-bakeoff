# The Brief

> **For:** the four agents in the bakeoff (Codex, Claude Sonnet via Plan, Claude Opus main-thread, Claude + frontend-design skill).
> **Goal:** propose how you would modernize the baseline app in 2026. Your proposal will be published alongside three others as a comparative blog post. **Differences from your peers are the point** — pick what you think is right, justify it, and call out what you're trading away.

---

## The ask

Read the baseline as a **complexity reference** (the kind of weekend-scope app we're targeting), then propose how you'd build a different, more interesting app in 2026: a **single-user markdown notes editor that could plausibly become collaborative**. Output a single proposal document and minimal supporting files at `proposals/<your-agent-name>/`. **Don't build the full app** — sketches are enough. We'll build only the chosen proposal in a later phase.

## The baseline (reference only)

This is *not* a modernize-in-place exercise. The baseline shows the rough complexity floor and the kind of code-shape we're modernizing away from — but the actual app we're proposing is different (see "What the app must do" below).

- **Repo (snapshot):** `agent-bakeoff/baseline/` (frozen copy of the original `functionalHyperscriptTodoList`, last touched Jan 2022)
- **Stack:** TypeScript 4.5, Inferno 7, Redux 4, Hyperscript + `inferno-hyperscript`, `type-to-reducer`, `rambda`, `list`, Webpack 5
- **Pinned to Node 9.11.1** — does not run on a modern toolchain without intervention
- **Code:** ~15 small TS files; classic Redux-style todo
- **Original author:** Leonardo Saracini

The baseline stays untouched. Its dated state is part of the framing story, not a problem to fix in place.

## What the app must do

A **single-user markdown notes editor**. Functional spec — don't pad it.

- **Notes:** create, rename, delete
- **Editor:** markdown text input with live preview (split-view, toggle, or your call)
- **Persistence:** auto-save to localStorage (debounced is fine)
- **Navigation:** list/sidebar of notes; click to switch
- **Search:** filter notes by title or content (substring is fine; fancier is your call)

That's the whole required surface. The editor library choice (CodeMirror / ProseMirror / TipTap / Monaco / Lexical / textarea / something else) is a key part of your proposal — name it and justify it.

### Optional bonus: collab sync sketch

The "could plausibly become collaborative" part is intentional. You may **optionally** include a short section sketching how you'd add real-time multi-user editing to your design — sync strategy (CRDT / OT / LWW), sync host (PartyKit / Liveblocks / Cloudflare Durable Objects / Y.js + y-webrtc / managed service), and what you'd change in your single-user architecture to make room for it. This is a sketch, not an implementation. It's bonus material, not required, and won't disqualify you if omitted.

**Important — declare your stance:** Whether or not you include the bonus sketch, your proposal **must** declare in the Agent header whether collab considerations influenced your **v1 single-user** architecture (e.g., picking CodeMirror 6 partly because it has a Y.js path is a yes; picking it purely on editor merits is a no). This makes the editor-library and state-shape choices comparable across agents — readers need to know which proposals are pure single-user designs vs. collab-influenced single-user designs.

## Carryovers from the baseline

The baseline made two opinionated choices that are worth engaging with explicitly rather than glossing over. These are **soft preferences with required justification**, not hard constraints — you may keep both, drop both, or split the difference, but your proposal **must** explicitly address each.

1. **Hyperscript over JSX** — the baseline used `inferno-hyperscript` for view templating. Some 2026 frameworks still support hyperscript-style APIs natively (Inferno itself, Mithril, hyperapp, snabbdom, and signals-friendly variants). Most have moved on to JSX, template strings, or compiler-driven syntax (Svelte, Vue SFCs). Whether to preserve hyperscript is your call — but if you depart from it, justify it **specifically against hyperscript**, not just "JSX is the modern default."

2. **Functional programming approach** — the baseline leaned functional: pure reducers via `type-to-reducer`, immutable list operations via `funkia/list`, point-free helpers via `rambda`. Modern equivalents exist (Effect, fp-ts, Ramda, Remeda, modern Rambda; or built-in patterns like immutable updates with the spread operator and structural-sharing libs like Immer). Whether to preserve a functional-first approach is your call — but if you depart, justify it **specifically**, not just "functional has fallen out of fashion."

The comparison post will read your "Carryovers" section side-by-side across all four agents — so write it tight and falsifiable.

## Hard constraints

These are non-negotiable. A proposal that violates any of these will be excluded from the comparison.

1. **Deployable as static or edge-runtime only.** No per-proposal backend, no long-running server, no database. Target free hosting: Cloudflare Pages, Vercel, or Netlify. Reader must be able to click through and use your build at a public URL.
2. **Single-page app or equivalent UX.** Page reload between actions is a regression vs. the baseline.
3. **Modern toolchain.** Assume Node 20+, current package manager of your choice. Do not pin to legacy Node.
4. **Output must follow the format below.** This is what makes the comparison post writable.

## Open choices

Everything else is yours. Pick deliberately and justify. Examples of what's open:

- Framework — React, Svelte 5, SolidJS, Vue, Qwik, Inferno (yes, you can stay), Lit, vanilla, anything
- State management — built-in primitives, Redux Toolkit, Zustand, Jotai, signals, none
- Build tool — Vite, Rolldown, esbuild, Bun, Webpack, Turbopack, none
- Styling — CSS, CSS modules, Tailwind, vanilla-extract, styled-components, plain `<style>`
- Language — TypeScript strongly preferred but not required; if you go JS, justify it
- Testing approach — Vitest, Playwright, none, your call
- Hyperscript heritage — the baseline used hyperscript over JSX. Preserving that is *interesting* but not required.

Pick what you'd actually use in 2026. "What's hot" is fine if you can defend it; "what's boring and proven" is also fine if you can defend that.

## Out of scope

Do not propose any of these as part of the **required** spec. They will be ignored in the comparison.

- Authentication, user accounts, multi-user
- Server-side persistence beyond localStorage
- Real-time collaboration *in the required spec* (but see "Optional bonus" above — a sketch is welcome)
- AI features, voice input, embeddings
- Analytics, telemetry, A/B infrastructure
- A full implementation — sketches are enough

## Required output

Place all of the following at `proposals/<your-agent-name>/`:

### 1. `README.md` — the proposal document

Use **exactly these section headers** so the comparison post can be assembled mechanically. Aim for 1,500–2,500 words total.

```markdown
# Proposal: <one-line title>

## Agent
- **Name:** <e.g., codex, claude-sonnet-plan, claude-opus-main, claude-frontend-design>
- **Model:** <model id and version>
- **Date:** <YYYY-MM-DD>
- **Collab considered in v1 design:** <yes / no — and if yes, which v1 decisions it influenced>

*(Independence rating is filled in by the orchestrator in the comparison post; you don't self-rate it.)*

## TL;DR
<3–5 sentences. The stack, the shape, the headline tradeoff.>

## Stack
| Layer | Choice | Why this over alternatives |
|---|---|---|
| Framework | | |
| State | | |
| Build | | |
| Styling | | |
| Language | | |
| Testing | | |
| Deploy target | | |

## Architecture sketch
<Prose. How the pieces fit. Where state lives. **Trace these two actions through the system** (pinned across all agents for comparability):
1. **"Save an edit to a note"** — keystroke → state → persistence → UI
2. **"Switch to a different note"** — sidebar click → state → editor reset → URL/route (if any)

Diagrams welcome but optional.>

## File tree
<Proposed file layout. Don't list every file — show the shape.>

## Key code sketches
<3–5 of the most decision-revealing files. Skeletal is fine. Pick the files where your choices show up most clearly (e.g., the state container, the main component, the persistence layer).>

## Tradeoffs
<What did you give up to pick this? Be specific. "Faster builds at the cost of ecosystem depth" beats "everything has tradeoffs.">

## Carryovers from the baseline
**Required.** Address each:
- **Hyperscript over JSX:** <kept / dropped / partial — and the specific reasoning>
- **Functional approach:** <kept / dropped / partial — and the specific reasoning>
- *(Optional)* Any other baseline choice you deliberately kept or dropped (Redux pattern, immutable list lib, point-free helpers, etc.)

## What's surprising about this proposal
<Your own self-reflection. What might a reader find unexpected? What did you almost pick instead, and why didn't you?>

## Build & deploy
- Install: `<command>`
- Dev: `<command>`
- Build: `<command>`
- Deploy: `<command or platform note>`
- Estimated bundle size: `<X KB gzipped>` — measured as **JS + CSS in the production build, gzipped, excluding fonts and images**. Methodology: actual build & measure preferred; bundlephobia summing of deps is acceptable. Show your math (e.g., `solid-js 7KB + codemirror-core 45KB + ... = 90KB`).

## Bonus: collab sync sketch (optional)
<Skip if not attempted. If included: sync strategy, sync host, and what changes in your single-user architecture to make room for it. ~200–400 words. Sketch, not implementation.>
```

### 2. Supporting files (optional but recommended)

- A working `package.json` (or equivalent) so the bundle-size estimate has teeth
- A `vite.config.ts` / equivalent if your build setup is non-obvious
- The 3–5 sketched code files referenced in your proposal

You do **not** need to produce a runnable app. The chosen proposal will be implemented in a later phase.

## How proposals will be evaluated

For transparency — these are the lenses the verdict post will apply:

1. **Coherence** — does the stack hang together, or is it a list of trendy parts?
2. **Justification quality** — are the "why" answers specific and falsifiable, or generic?
3. **Honest tradeoffs** — does the proposal name what it gives up, or pretend it has none?
4. **Buildability** — could a competent developer ship this in a weekend from the sketches?
5. **Surprise value** — does the proposal teach the reader something, or is it the obvious answer?

No single lens dominates. A "boring but airtight" proposal can win over a "clever but hand-wavy" one.

## A note on independence

You are one of four agents. We are deliberately not telling you what the others picked. Don't try to differentiate for its own sake — pick what you actually think is right. If three of you pick the same framework for the same reasons, that's a finding worth publishing.

---

*Brief version: v1.4 — 2026-04-18 — defined bundle size methodology (JS + CSS, gzipped, excluding fonts/images, show your math) so cross-agent numbers are diff-able. Prior changes: v1.3 added "Collab considered in v1 design: yes/no" agent-header declaration, pinned two architecture-trace actions ("save an edit," "switch to a different note"), and removed self-rated Independence field.*
