# post-01 facts-only skeleton

*Source material for rewriting "What's in the box" (baseline tour). NOT for publication.*

---

## What this post must establish

1. The 2022 baseline exists, runs (or ran), and has identifiable architectural DNA worth understanding before the bakeoff.
2. Some baseline choices were already unusual *in 2022* and are still live options in 2026 — this is what makes the carryover question non-trivial.
3. The baseline is used as a *complexity reference*, not a literal starting point — agents are building a different app.
4. Three specific baseline choices (hyperscript, functional approach, action+reducer-in-same-file) are worth engaging with; the brief will require this engagement explicitly.

## Context facts — the baseline stack, layer by layer

```
TypeScript 4.5
  Inferno 7                  — React-alternative, ~8 KB runtime (vs React's ~42 KB)
    inferno-hyperscript      — hyperscript syntax over JSX
    inferno-redux            — Redux bindings
  Redux 4                    — state container
    type-to-reducer          — action + reducer slice in same file, Object.assign to assemble
  Reselect                   — memoized selectors
  rambda                     — smaller, tree-shakable alternative to Ramda
  funkia/list                — finger-tree-backed immutable list, scales to 10k+ items
  classnames
  Webpack 5
    awesome-typescript-loader
    html-webpack-plugin
    mini-css-extract-plugin
  Node 9.11.1                — PINNED; past EOL by 2022 mid-year
```

## Repo facts

- ~26 commits total, most are maintenance (dependency bumps, comment additions, Webpack tweaks)
- Last commit: January 2022
- ~15 small TypeScript source files in `src/`
- Original author: Leonardo Saracini
- License: MIT
- Not polished open-source — wears its choices on its sleeve (this is why it's useful as a baseline)

## The app surface (all of it)

Five functional verbs:
- Add a todo
- Edit a todo's text inline
- Toggle complete / incomplete
- Delete a todo
- Filter view: all / active / completed

## Distinctive architectural choices (worth naming specifically)

1. **Inferno over React** — deliberate size/speed choice; React-API-compatible
2. **Hyperscript over JSX** — `inferno-hyperscript` gives `div('.sidebar', [...])` instead of `<div className="sidebar">...`. Not a typo or accident.
3. **type-to-reducer for action organization** — each action gets its own file co-located with its reducer slice; slices assembled via `Object.assign({}, ...slices)` then passed to `typeToReducer`. Adding an action = write one file + add one line.
4. **funkia/list for immutability** — overkill for a todo app, right for a codebase that was thinking about larger lists. Signals the author was considering which immutability story applies when.
5. **rambda over Ramda** — smaller + tree-shakable. Signals deliberate sizing.
6. **Pinned to Node 9.11.1** — the one choice that didn't age well.

## What's worth carrying forward into 2026

- Hyperscript — still has framework support (Inferno, Mithril, hyperapp, snabbdom). Live design choice.
- The functional approach (pure reducers, point-free, immutable updates) — transfers cleanly to any 2026 stack.
- type-to-reducer pattern — most distinctive organizational idea in the baseline; ages well; two of eight eventual proposals keep some version of it.

## What's not worth carrying forward

- W3CSS (styling framework) — not wrong, just wrong-fitted for a markdown notes editor
- Webpack 5 — Vite is the obvious 2026 successor; none of the 8 proposals picked Webpack
- Pinned Node 9 — self-explanatory
- The todo surface itself — bakeoff pivots to a markdown notes editor

## Why complexity reference, not starting point

Two reasons:

1. **Honesty:** rebuilding a todo app for the Nth time is boring blog content. Markdown editor gives agents more interesting decisions.
2. **Methodology:** a "modernize-in-place" exercise rewards the agent that most cleverly preserves existing structure — tests fidelity. A "rebuild fresh but engage with these carryovers" exercise rewards thoughtful picking — tests judgment.

The baseline's job is to make "what to keep" a question worth asking. The brief surfaces hyperscript and functional approach as *required* carryovers; the others are *optional* carryovers.

## What the current post does that's load-bearing

- Names the six distinctive architectural choices specifically (so reader can track them across the bakeoff)
- Shows a representative hyperscript code snippet (concrete, not abstract) — side-by-side with JSX
- Explicitly flags "this is a complexity reference, not a starting point" (prevents wrong expectation)
- Separates "worth carrying forward" vs "not" (sets up the carryover section of the brief)

## What the current post does that's NOT load-bearing (drop freely)

- "Someone built a Redux-style todo app in Inferno using hyperscript because they wanted to see what that combination felt like" — characterization of the original author, AI-narrator voice
- The "it wears its choices on its sleeve" line — poetic, AI-rhythm
- "Reading the baseline now, three things stand out" — filler transition
- Hedged "some of these choices were already unusual in 2022" framings — speak more directly or drop

## Numbers / specifics worth landing somewhere

- Inferno bundle: ~8 KB gzipped
- React bundle for comparison: ~42 KB gzipped
- Baseline total commits: ~26
- Baseline source files: ~15
- App surface: 5 verbs
- Node pinning: 9.11.1 (2017-era, past EOL by mid-2022)

## Hook the current prose uses (for reference)

Current first paragraph: "Before asking four AI agents to design a 2026 rebuild, walk back. Here's the codebase the bakeoff is anchored to." Then leads with commit count, author name, last-touched date as setup. Standard AI "let me establish context first" opener. Replace with whatever framing actually fits your narrative flow from post 0.
