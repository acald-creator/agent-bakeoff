# The Proposals

Same brief, four independent runs. This post takes each proposal on its own terms. The matrix is post 4.

Order alphabetical by slot name.

## claude-frontend-design

Stack: SolidJS 1.9 + CodeMirror 6 + vanilla-extract + Vite 6. Bundle ~82 KB gzipped. Collab in v1: yes. Hyperscript dropped. Functional kept (partial).

The UX-first slot. Where the other three argue framework, state, and editor library, this one argues typography, motion, and the deliberate withholding of features. "A book page, not a productivity dashboard." Warm aged-paper palette (`#F5F0E8` background, `#1A1510` ink, `#B8311F` red accent), Playfair Display and Literata editorial serifs, a refusal to add any feature that doesn't directly serve writing.

Framework (SolidJS) and editor (CodeMirror 6) follow from the design POV rather than driving it. SolidJS for fine-grained reactivity so serif type at scale doesn't jank. CodeMirror for theming primitives flexible enough to honor the editorial aesthetic without fighting the framework.

vanilla-extract is the distinctive technical pick. Typed CSS-in-JS that compiles to static stylesheets at build time. Design tokens become first-class TypeScript values. Type-checkable, autocompletable, refactorable.

Collab is named as a passive enabler, not an active feature. No collab infrastructure wired in v1. An honest step back from pretending v1 ships collab.

Full proposal: [proposals/claude-frontend-design/](https://github.com/acald-creator/agent-bakeoff/tree/main/proposals/claude-frontend-design).

## claude-opus-main

Stack: Inferno 8 + `inferno-hyperscript` + CodeMirror 6 + Vite 6 + TypeScript 5.5. Bundle ~75 KB gzipped. Collab in v1: yes. Hyperscript kept. Functional kept (modernized, Remeda instead of Rambda).

The only proposal that treats "Inferno in 2026" as a live choice rather than a retirement. "The headline move is not moving."

Every baseline carryover transfers cleanly. Hyperscript, FSA-style actions, reducer-in-file, functional helpers. The 2026 upgrade is surgical. Vite replaces Webpack, TS 5.5 replaces 4.5, Remeda replaces Rambda, CodeMirror 6 adds a real editor surface.

The most decision-revealing move is the meta/body split. The app store owns `meta` (title, tags, timestamps). CodeMirror owns `body` (a string). Makes the eventual Y.js swap a body-only replacement rather than a state-shape rewrite.

Mithril almost got picked instead. It didn't because that would have abandoned the baseline's Inferno + Redux lineage specifically. Codex picked Mithril for adjacent reasons, which is post 4 material.

The bias gets disclosed in the proposal directly. Full orchestration context, watched the brief evolve from v1.2 to v1.4, knew the repo owner was interested in preserving hyperscript and the functional approach, shaped the brief's language. The proposal most likely to reflect the orchestrator's priors, by design.

Full proposal: [proposals/claude-opus-main/](https://github.com/acald-creator/agent-bakeoff/tree/main/proposals/claude-opus-main).

## claude-sonnet-plan

Stack: SolidJS 1.x + Zustand 5 with Immer + CodeMirror 6 + Vite 6. Bundle ~90–100 KB gzipped. Collab in v1: yes. Hyperscript dropped. Functional kept (selectively modernized).

The planning-first slot. The proposal with the strongest line-by-line justification work. Every cell in the Stack table reads as a comparison against an alternative, not a description of the choice.

The distinctive architectural move is naming a specific seam up front. "CodeMirror as an uncontrolled island," the first thing to change on the collab path. A pure implementation-first approach might have wired that seam away. Naming it upfront gives the build phase a concrete migration target rather than a surprise refactor.

Zustand over Solid's built-in stores gets defended explicitly. Solid has capable state primitives via `createStore` and `createSignal`. Zustand gets picked because the collab-in-v1 reasoning wants a Redux-shaped container that maps cleanly onto a CRDT model later. Solid's signals would work for single-user but require more migration surgery for multi-user.

The "I picked this because of collab" honesty is what the brief's collab declaration was designed to surface.

Full proposal: [proposals/claude-sonnet-plan/](https://github.com/acald-creator/agent-bakeoff/tree/main/proposals/claude-sonnet-plan).

## codex

Stack: Mithril + native `<textarea>` + micromark for preview + hand-rolled functional store + Vite 7. Bundle 37 KB gzipped (composition estimate, disclosed). Collab in v1: no. Hyperscript kept. Functional kept (partial).

The only proposal that doesn't pick CodeMirror. The only contrarian position in the slate.

The argument against CodeMirror is specific. The obvious 2026 answer (React or Svelte plus CodeMirror 6) is often reflexive. The required editor isn't an IDE. Collab is explicitly optional. So "a plain textarea is the right editor library choice for v1."

Hyperscript gets defended in unusually strong terms. The baseline used hyperscript as a real authoring preference, not an accident before JSX won. For a small stateful SPA, JSX doesn't buy enough to justify abandoning the baseline's most distinctive idea.

Bundle math: `mithril 9 KB + micromark 14 KB + app/state/persistence 11 KB + CSS 3 KB = 37 KB gzipped`. Disclosed as a composition estimate, not a measurement. No production install was run in the turn. Exactly what the brief's bundle methodology section allows.

The collab section, despite the v1 "no," is the most architecturally specific of the four. When collab becomes real, swap the editor to CodeMirror 6, add Y.js as the shared text model, host through PartyKit or Cloudflare Durable Objects.

Stronger than the three "yes" proposals. Not "I considered collab and it shaped v1," but "I deliberately didn't shape v1 around collab, and here's exactly the swap for when collab earns the complexity."

Full proposal: [proposals/codex/](https://github.com/acald-creator/agent-bakeoff/tree/main/proposals/codex).

Next: [The Verdict](post-04-the-verdict.md).
