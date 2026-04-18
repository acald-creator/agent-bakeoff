# What's in the Box

The baseline is `functionalHyperscriptTodoList` by Leonardo Saracini, MIT-licensed. Twenty-six commits, fifteen source files, last touched January 2022. The stack, layer by layer:

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
  Node 9.11.1                — pinned, past EOL by mid-2022
```

Five functional verbs, nothing more.

- Add a todo
- Edit inline
- Toggle complete
- Delete
- Filter (all / active / completed)

## Six choices worth naming

1. Inferno over React. Inferno ships a React-API-compatible runtime at about 8 KB gzipped, versus React's 42 KB. Picking it in 2022 was a deliberate "React-shaped code without React's mass" call.

2. Hyperscript over JSX. `inferno-hyperscript` gives you `div('.sidebar', [...])` instead of `<div className="sidebar">...</div>`. Not a typo, not an accident, an authorial preference.

3. `type-to-reducer` for action organization. Each action lives in its own file alongside its reducer slice. Slices get `Object.assign`'d at assembly time, then passed to `typeToReducer`. Adding an action means writing one file and adding one line. Removing one is the same in reverse.

4. funkia/list for immutability. A finger-tree-backed immutable list that scales to tens of thousands of items. Overkill for a todo app. Its presence signals the author was thinking about which immutability story applies when.

5. rambda over Ramda. Smaller, tree-shakable, same point-free style. Less weight.

6. Node 9.11.1, pinned. The one choice that didn't age well. Node 9 was past EOL by mid-2022. Running the repo today requires an older nvm-managed Node or some patching. The bakeoff brief requires Node 20+ from every proposal.

## Hyperscript, concretely

A representative component:

```ts
// src/footer.ts
import { p } from 'inferno-hyperscript';

const footer = () => p('.w3-padding-large.w3-center', 'Functional style');

export default footer;
```

Compare to JSX:

```jsx
<p className="w3-padding-large w3-center">Functional style</p>
```

Information content is identical. Reading experience differs. Hyperscript looks like ordinary JavaScript and reads with ordinary JavaScript tools. Jump-to-definition, refactor, find-references. JSX looks like HTML inside JavaScript and reads with JSX-aware tools. Both work.

The baseline picked hyperscript on purpose. The brief forces every agent to declare kept, dropped, or partial on that choice, with reasoning.

## Worth carrying forward

Hyperscript. Framework support didn't disappear. Inferno still ships `inferno-hyperscript`. Mithril uses hyperscript as its primary API. Hyperapp, snabbdom, and several signals-friendly variants exist. A live 2026 design choice that requires a specific framework pick.

The functional approach. Pure reducers, point-free helpers, immutable updates. The style transfers cleanly to any 2026 stack. Libraries change (Rambda → Remeda, funkia/list replaceable with native arrays at this scale) but the discipline is portable.

`type-to-reducer` pattern. The most distinctive organizational idea in the baseline. It costs nothing to keep and ages better than most 2022 patterns. The brief flags it as an optional carryover. Two of the eight eventual proposals kept a version of it.

## Not worth carrying forward

- W3CSS. Not bad, just wrong-fitted for a markdown notes app.
- Webpack 5. Vite is the obvious 2026 successor. None of the proposals picked Webpack.
- Pinned Node 9.
- The todo surface itself. The brief pivots to a markdown notes editor because notes force a real editor-library decision, and todo apps don't.

## Complexity reference, not starting point

The brief doesn't ask agents to modernize this code in place. It asks them to build a different app of similar scope, using the baseline as a complexity reference. Two reasons.

Rebuilding a todo app for the Nth time would have been boring blog content. A markdown editor with optional collab gives agents more interesting decisions.

Methodologically, a modernize-in-place exercise rewards the agent that most cleverly preserves existing structure. That tests fidelity. A rebuild-fresh-but-engage-with-these-carryovers exercise rewards thoughtful picking. That tests judgment.

The baseline's job is to make "what to keep" a question worth asking. Hyperscript and the functional approach get surfaced in the brief as required carryovers. Every proposal has to declare kept, dropped, or partial with reasoning. Redux pattern, immutable list lib, and point-free helpers are optional.

Next: [The Brief](post-02-the-brief.md).
