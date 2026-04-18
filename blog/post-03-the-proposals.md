# The Proposals — Post 3

*All four agent proposals, one section each, on their own terms. The comparison post (post 4) reads them side-by-side. This post lets each one breathe alone first.*

---

Four agents. Same brief (v1.4 — see [post 2](post-02-the-brief.md) for how it got there). Four very different proposals.

This post presents each one without comparison. The point is to read each agent's reasoning *on its own terms* before squashing them into a matrix. The matrix is post 4. Save your judgments until then.

Order is alphabetical by slot name. No ranking implied.

The full proposal documents — including code sketches, package.json files, and supporting files — live in the repo at [proposals/](../proposals/). Section quotes here are excerpts; click through for the full text.

---

## claude-frontend-design — "Like a Book Page, Not a Productivity Dashboard"

**Stack:** SolidJS 1.9 + CodeMirror 6 + vanilla-extract + Vite 6
**Bundle:** ~82 KB gzipped (effective first-load)
**Collab in v1:** yes (CodeMirror chosen partly for Y.js path; note shape sized for LWW merge)
**Hyperscript carryover:** dropped (specific reasoning)
**Functional carryover:** kept (partial)
**Slot value:** UX/visual design as the leading concern, not the trailing one

The proposal that doesn't sound like the others. Where the other three argue framework, state, and editor library, this one argues typography, motion, and the deliberate withholding of features.

> This notes editor feels like a book page, not a productivity dashboard — warm aged-paper background, Playfair Display + Literata editorial serifs, a single red-ink accent color, and a deliberate refusal to add any feature that doesn't directly serve the act of writing; the experience is distinguished from every other 2026 notes app by what it withholds.

The framework choice (SolidJS) and editor choice (CodeMirror 6) follow from the design POV rather than driving it. SolidJS is picked because fine-grained reactivity means no jank when rendering serif type at scale; CodeMirror is picked because its theming primitives are flexible enough to honor the editorial aesthetic without fighting the framework.

vanilla-extract is the most distinctive technical pick: typed CSS-in-JS that compiles to static stylesheets at build time. The proposal uses it specifically because design tokens become first-class TypeScript values, type-checkable, autocompletable, and refactorable like any other code.

The collab consideration is honest about being a *passive enabler* rather than an active feature: "no collaborative infrastructure is wired in v1; those decisions are passive enablers, not active features."

The full proposal is at [proposals/claude-frontend-design/](../proposals/claude-frontend-design/), including a `tokens.ts` design system file, `theme.css.ts`, and three component sketches.

---

## claude-opus-main — "Inferno + Hyperscript in 2026 — Honoring the Baseline's DNA"

**Stack:** Inferno 8 + `inferno-hyperscript` + CodeMirror 6 + Vite 6 + TypeScript 5.5
**Bundle:** ~75 KB gzipped
**Collab in v1:** yes (influenced editor choice + note schema; did *not* influence framework or state)
**Hyperscript carryover:** kept
**Functional carryover:** kept (modernized instruments — Remeda instead of Rambda)
**Slot value:** informed insider — the orchestrator's own proposal, full baseline context, disclosed bias

The only proposal that treats "Inferno in 2026" as a live choice rather than a retirement.

> The headline move is **not moving** — Inferno still ships `inferno-hyperscript` as a first-party package, the baseline's architectural DNA (FSA-style actions, pure reducers, Object.assign-of-slices) transfers cleanly to a notes domain, and the bundle lands at ~75 KB gzipped.

The state layer reads almost like the baseline's: each action lives in its own file at `src/store/actions/<name>.ts`, exporting an action creator, a reducer slice, and (optionally) an effect. The reducer slices are gathered via `Object.assign({}, ...slices)` and passed to `type-to-reducer`. The store itself is a 40-line `createStore(reducer, initialState)` — no Redux library, no middleware framework, just a closure-based pub/sub.

The proposal's most decision-revealing move is the split between `meta` and `body`:

> The note model splits into a `meta` object (title, tags, timestamps) that the app store owns and a `body` string that CodeMirror owns — making the eventual Y.js swap a body-only replacement rather than a state-shape rewrite.

The disclosure is direct:

> This proposal comes from the main-thread "informed insider" slot. Unlike the other three agents, I had full orchestration context: I watched the brief evolve from v1.2 → v1.4, I know the repo owner articulated interest in preserving hyperscript and functional approach as part of the series' narrative, and I shaped the brief's own language. Treat this proposal's biases accordingly — it is the proposal most likely to reflect the orchestrator's own priors, by design.

The "what's surprising" section names what almost got picked instead: Mithril.

> Mithril was designed around hyperscript as its primary API (not an alternative), ships with built-in routing and HTTP, and runs ~10 KB. I didn't pick it because it would have required abandoning the baseline's *specific* lineage — the baseline is Inferno + Redux, and Mithril would have replaced both.

(Spoiler from post 4: the codex slot did pick Mithril, on adjacent reasoning.)

The full proposal is at [proposals/claude-opus-main/](../proposals/claude-opus-main/), including a `package.json` and a `vite.config.ts` with the Inferno plugin wired in.

---

## claude-sonnet-plan — "SolidJS + Zustand + CodeMirror, Built for Migration"

**Stack:** SolidJS 1.x + Zustand 5 (with Immer) + CodeMirror 6 + Vite 6
**Bundle:** ~90–100 KB gzipped (math shown to ~87–95 KB)
**Collab in v1:** yes (state shape designed for CRDT mapping; CodeMirror chosen for Y.js path)
**Hyperscript carryover:** dropped (specific reasoning)
**Functional carryover:** kept (selectively modernized)
**Slot value:** planning-first — explicit architectural reasoning, named tradeoffs, deliberate seams

The proposal with the strongest line-by-line justification work. Every cell in the Stack table reads as a comparison against an alternative, not just a description of the choice.

The most distinctive architectural move is naming a specific *seam* up front:

> The explicit decision to treat CodeMirror as an *uncontrolled island* — named as the "first thing to change" on the collab path — is an architectural seam a pure implementation-first approach might have wired away; articulating it upfront gives the build phase a concrete migration target rather than a surprise refactor.

That's the planning-first lens at work. Where the implementation-first proposals optimize for working code, this one optimizes for *future maintainability*: if the eventual collab swap is going to require treating CodeMirror differently, name that boundary now and design around it from day one.

The Zustand pick is also explicitly defended against SolidJS's built-in stores:

The proposal acknowledges SolidJS has perfectly capable state primitives via `createStore` and `createSignal`, but picks Zustand specifically because the proposal's collab-in-v1 reasoning wants a Redux-shaped state container that maps cleanly onto a CRDT model later. Solid's signals would work for the single-user case but would require more migration surgery for the multi-user case.

That kind of "I picked this *because* of collab" honesty is exactly what the brief's collab declaration was added to surface.

The full proposal is at [proposals/claude-sonnet-plan/](../proposals/claude-sonnet-plan/), including a `package.json`, a `vite.config.ts`, a `notes-store.test.ts` showing how the state is testable, and a `Sidebar.tsx` component sketch.

---

## codex — "Small Hyperscript Notes"

**Stack:** Mithril + native `<textarea>` + micromark for preview + hand-rolled functional store + Vite 7
**Bundle:** 37 KB gzipped (composition estimate, disclosed)
**Collab in v1:** **no** (the only proposal to declare no)
**Hyperscript carryover:** kept (specifically argued)
**Functional carryover:** kept (partial)
**Slot value:** different model family (non-Claude); independent reasoning from outside the Claude consensus

The proposal that doesn't pick CodeMirror. The only one.

> I would build this as a small Mithril SPA with a native `textarea`, `micromark` for preview, and a tiny application store made of pure update functions plus a debounced localStorage effect. The point is to keep the baseline's hyperscript sensibility, keep the state model legible, and avoid importing an editor framework whose main advantages only matter once syntax services or collaboration become real requirements.

The argument is the cleanest contrarian position in any of the four proposals:

> The surprising part is probably what I did not choose. In 2026, the obvious notes-app answer is "React or Svelte plus CodeMirror 6." I think that answer is often reflexive. The required editor here is not an IDE, and the collaboration story is explicitly optional. So I am willing to say a plain textarea is the right editor library choice for v1.

The hyperscript carryover is defended in unusually strong terms:

> This is the carryover I would preserve most strongly. The baseline used hyperscript as a real authoring preference, not as an accident before JSX won. For this app, Mithril's hyperscript is still a good fit in 2026 because the UI is mostly layout composition and event handlers, not heavy component metaprogramming. Keeping hyperscript avoids a compiler step for templates, keeps components as ordinary functions, and makes the "view is data" shape explicit. I am not anti-JSX; I am saying that for a small, stateful SPA, JSX does not buy enough to justify abandoning the baseline's most distinctive idea.

The bundle math is honestly disclosed as an estimate, not a measurement:

> `mithril 9 KB + micromark 14 KB + app/state/persistence code 11 KB + CSS 3 KB = 37 KB gzipped`. I did not run a production install in this turn, so this is a bundle-composition estimate rather than an emitted-build measurement.

That disclosure is exactly what the brief's bundle methodology section allows ("bundlephobia summing of deps is acceptable"). Naming it as a composition estimate is the kind of small honesty that earns trust.

The collab section, despite the declared "no" in v1, is actually the most architecturally specific of the four:

> If collaboration becomes real, I would not stretch the textarea design too far. I would swap the editor layer to CodeMirror 6 and add Y.js as the shared text model, hosted through PartyKit or Cloudflare Durable Objects. The rest of the application state can stay largely intact if I treat note metadata and note bodies differently.

That's a stronger position than the three "yes" proposals: not "I considered collab and it shaped my design," but "I deliberately *didn't* shape my v1 design around collab, and here's exactly the swap I'd make when collab earns the complexity."

The full proposal is at [proposals/codex/](../proposals/codex/), including a `package.json`, a `vite.config.ts`, and seven small source files showing the proposed app shape.

---

## What's missing from this post

Comparison. Cross-proposal patterns. The verdict.

That's all post 4. Read each proposal's full README in `proposals/` first if you want the complete picture; come to [post 4](post-04-the-verdict.md) when you're ready to read them as a slate.

The interesting thing about reading proposals one at a time, without the comparison framing, is that *each one is internally coherent on its own terms*. Codex's textarea argument doesn't need the SolidJS proposals to be wrong for it to be right. Frontend-design's editorial aesthetic doesn't need the others to lack design POV. Opus-main's Inferno preservation doesn't need the others to have ignored the baseline. The proposals are competing in the verdict post, but they're not refutations of each other in this one.

That's worth holding before you flip to the matrix.

---

*Series: Post 3 of 8. Previous: [The Brief](post-02-the-brief.md). Next: [The Verdict](post-04-the-verdict.md).*

*Full proposals (with code sketches and supporting files):*
- *[proposals/claude-frontend-design/](../proposals/claude-frontend-design/)*
- *[proposals/claude-opus-main/](../proposals/claude-opus-main/)*
- *[proposals/claude-sonnet-plan/](../proposals/claude-sonnet-plan/)*
- *[proposals/codex/](../proposals/codex/)*
