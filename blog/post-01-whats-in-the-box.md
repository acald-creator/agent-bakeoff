# What's in the Box — Post 1

*A walking tour of the 2022 baseline that anchors the bakeoff. The agents are not modernizing this codebase in place — but understanding it explains the brief.*

---

Before asking four AI agents to design a 2026 rebuild, walk back. Here's the codebase the bakeoff is anchored to.

The repo is `functionalHyperscriptTodoList`, originally by Leonardo Saracini, last touched in January 2022. Twenty-six commits, most of them maintenance: dependency bumps, comment additions, the occasional Webpack config tweak. It's not a polished open-source library; it's a learning artifact. Someone built a Redux-style todo app in Inferno using hyperscript because they wanted to see what that combination felt like, then froze it.

That's exactly why it's useful as a baseline. Polished projects hide the choices. This one wears them on the sleeve.

## The stack, layer by layer

```
TypeScript 4.5
  Inferno 7                       — the React-alternative view layer
    inferno-hyperscript           — hyperscript syntax over JSX
    inferno-redux                 — Redux bindings for Inferno
  Redux 4                         — predictable state container
    type-to-reducer               — action+reducer-in-same-file pattern
  Reselect                        — memoized selector library
  rambda                          — small functional helpers (Ramda-alike)
  funkia/list                     — immutable list operations for big data
  classnames                      — the usual conditional-class joiner
  Webpack 5                       — bundler
    awesome-typescript-loader
    html-webpack-plugin
    mini-css-extract-plugin
  Node 9.11.1                     — pinned in package.json
```

A few of these choices were already unusual in 2022, and several are quietly distinctive even now:

- **Inferno over React.** Inferno is a React-API-compatible framework with a much smaller runtime (~8 KB gzipped vs. React's ~42 KB) and faster benchmark numbers. It's been actively maintained since 2016. Picking it in 2022 was a deliberate "I want React-shaped code without React's mass" call.
- **Hyperscript over JSX.** Hyperscript is JavaScript-as-template syntax: `div('.sidebar', [span('hello')])` instead of `<div className="sidebar"><span>hello</span></div>`. The `inferno-hyperscript` package exists specifically to give Inferno users this option. Picking it means rejecting JSX's conventional path on purpose.
- **type-to-reducer for action organization.** Most Redux codebases organize actions in one file, reducers in another. The baseline reverses that: each action lives in its own file alongside the reducer slice that handles it. The slices are then `Object.assign`'d together at reducer-assembly time. It's a small idea with real organizational benefits.
- **funkia/list for immutability.** Native arrays with spread-based updates work fine for hundreds of items. `funkia/list` is a finger-tree-backed immutable list lib that scales to tens of thousands without the spread-copy cost. For a todo app, it's overkill — but its presence here signals the author was thinking about *which* immutability story applies when.
- **rambda over Ramda.** Rambda is a smaller, faster, more tree-shakable alternative to Ramda. Same point-free functional style, less weight. Picking it again signals deliberate sizing.
- **Pinned to Node 9.11.1.** This is the one choice that didn't age well. Node 9 was already past EOL by 2022's mid-year; running this codebase today requires either an older nvm-managed Node or some patching. (The bakeoff brief explicitly requires Node 20+ from all proposals.)

## The app surface

```
Add a todo
Edit a todo's text inline
Toggle complete / incomplete
Delete a todo
Filter view: all / active / completed
```

That's it. The full feature set. Five verbs.

The interesting part isn't the surface — it's how the surface maps to the architectural choices. Each verb is a Redux action. Each action lives in its own file at `src/todos/todo/redux/actions/<verb>.ts`. Each file exports an action creator (FSA-shaped: `{ type, payload }`) and a reducer slice object. The reducer slices are gathered in `src/redux/reducer.ts`:

```ts
const reducerObj = Object.assign({},
  addTodoReducerObj,
  todoCompleteToggleReducerObj,
  todoDeleteReducerObj,
  todoEditReducerObj,
  todoEnableToggleReducerObj,
  todoSaveEditReducerObj,
);
```

Then `type-to-reducer(reducerObj, initialState)` produces the final reducer. Adding a new action means: write one file, add one line to the `Object.assign`, done. Removing one is the same in reverse. There's no central registry to manually keep in sync.

This is the most distinctive *organizational* idea in the baseline, and it's the one most likely to survive into 2026 untouched.

## The view layer in practice

A representative component, slightly simplified:

```ts
// src/footer.ts
import { p } from 'inferno-hyperscript';

const footer = () => p('.w3-padding-large.w3-center', 'Functional style');

export default footer;
```

That `p('.w3-padding-large.w3-center', 'Functional style')` is hyperscript at its smallest: function-call syntax that returns a virtual DOM node. The `.class.class` shorthand mirrors CSS selectors. Children can be a string, an array, or another hyperscript call.

Compare to JSX:

```jsx
<p className="w3-padding-large w3-center">Functional style</p>
```

The information content is identical. The reading experience differs in two ways. Hyperscript looks like ordinary JavaScript and reads with ordinary JavaScript tools (jump-to-definition, refactor, find-references). JSX looks like HTML inside JavaScript and reads with JSX-aware tools. Some people prefer one; some people prefer the other; both work.

The baseline picked hyperscript on purpose. The bakeoff brief asks the four agents to engage with that choice rather than glossing over it.

## Styling: W3CSS

The baseline uses W3CSS — a small, classless-ish CSS framework from W3Schools — for layout and visual tokens. It's lightweight (~25 KB minified, no JS dependency) and was a reasonable choice in the early 2010s when "we need *some* CSS framework" was the question. By 2022 it was already an unusual pick; by 2026 it's clearly not the right answer for a fresh build.

The brief doesn't ask agents to preserve the styling choice. Styling is open. Predictably, the four proposals split across vanilla CSS, CSS Modules, and vanilla-extract. None picked W3CSS. None picked Tailwind, either, which is the more interesting datapoint.

## What's worth carrying forward

Reading the baseline now, three things stand out as worth preserving — not because they're irreplaceable, but because they're real architectural ideas that age well:

1. **Hyperscript.** The framework support didn't disappear. Inferno still ships `inferno-hyperscript`. Mithril uses hyperscript as its primary API. Hyperapp, snabbdom, and several signals-friendly variants exist. Hyperscript in 2026 is not a relic; it's a live design choice that requires a specific framework pick.

2. **The functional approach.** Pure reducers, point-free helpers, immutable updates — the entire style transfers cleanly to any 2026 stack. The libraries change (Rambda became Remeda, funkia/list is replaceable with native arrays at this scale), but the discipline is portable.

3. **Action+reducer-in-same-file via `type-to-reducer`.** The single most distinctive organizational idea in the baseline. It costs nothing to keep, and it ages better than most 2022 patterns. The bakeoff brief flags it as an *optional* carryover (not required), and two of the four proposals chose to keep some version of it.

## What's not worth carrying forward

- W3CSS. Not because it's bad — because there are better-fitted choices for a markdown notes app in 2026.
- Webpack 5 config. Vite is the obvious successor. None of the four agents picked Webpack.
- The pinned Node 9. Self-explanatory.
- The original todo surface. The bakeoff pivots to a markdown notes editor, not because the todo is too simple, but because notes editors surface the editor-library decision as a real architectural choice and todos don't.

## Why this is the baseline, not the starting point

The brief doesn't ask agents to modernize this code in place. It asks them to build a different app of similar scope, using the baseline as a *complexity reference*. There are two reasons:

The first is honest: rebuilding a todo app for the fourth time in a year would have been boring blog content. A markdown editor with optional collab gives the agents more interesting decisions to make.

The second is methodological: a "modernize-in-place" exercise rewards the agent that most cleverly preserves the existing structure, which mostly tests fidelity to the baseline. A "rebuild fresh, but engage with these specific carryovers" exercise rewards the agent that most thoughtfully picks what to keep and what to drop, which tests judgment.

The baseline's job is to make "what to keep" a question worth asking. Hyperscript and the functional approach are surfaced explicitly in the brief as *required* carryovers — every proposal has to declare kept/dropped/partial with specific reasoning. The other baseline choices (Redux pattern, immutable list lib, point-free helpers) are surfaced as *optional* carryovers that agents can address if they want.

That's how a 2022 todo app becomes the anchor for a 2026 multi-agent comparison: not by being rebuilt, but by being the source of the carryover questions.

The next post — [The Brief](post-02-the-brief.md) — walks through the prompt every agent received, and the four iterations it took before that prompt was unambiguous enough to be worth sending.

---

*Series: Post 1 of 8. Previous: [Why an Agent Bakeoff](post-00-why-an-agent-bakeoff.md). Next: [The Brief](post-02-the-brief.md).*
