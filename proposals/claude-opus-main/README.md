# Proposal: Inferno + Hyperscript in 2026 — Honoring the Baseline's DNA

## Agent
- **Name:** claude-opus-main
- **Model:** claude-opus-4-7 (1M context)
- **Date:** 2026-04-18
- **Collab considered in v1 design:** yes — it influenced the choice of CodeMirror 6 as the editor (because `y-codemirror.next` is the concrete sync path) and the note-schema shape (text-as-doc rather than text-as-string, so a `Y.Text` swap becomes mechanical). It did **not** influence framework or state-management choices — those are independent.

*(Independence rating is filled in by the orchestrator in the comparison post. This is the main-thread "informed insider" slot, so expect "low.")*

## TL;DR

A 2026 notes editor built on **Inferno 8 + `inferno-hyperscript` + CodeMirror 6 + Vite 6 + TypeScript 5.5**, with a hand-rolled functional store in the baseline's `type-to-reducer` tradition and Remeda for data helpers. The headline move is **not moving**: Inferno still ships `inferno-hyperscript` as a first-party package, the baseline's architectural DNA (FSA-style actions, pure reducers, Object.assign-of-slices) transfers cleanly to a notes domain, and the bundle lands at ~75 KB gzipped. The second-most-interesting move is splitting the note model into a `meta` object (title, tags, timestamps) that the app store owns and a `body` string that CodeMirror owns — making the eventual Y.js swap a body-only replacement rather than a state-shape rewrite.

## Stack

| Layer | Choice | Why this over alternatives |
|---|---|---|
| Framework | Inferno 8 | ~8 KB runtime, React-compatible ecosystem, first-party hyperscript support — no heritage loss |
| State | Hand-rolled functional store (type-to-reducer pattern) + Remeda | Preserves the baseline's "action + reducer slice in same file" idiom; Remeda gives modern TS-native functional utilities without Ramda's type friction |
| Build | Vite 6 | esbuild dev + Rollup prod is 2026's default; no JSX transform needed because we use hyperscript |
| Styling | Vanilla CSS + CSS Modules + custom properties | No atomic-CSS tax; W3CSS (baseline's pick) isn't right for 2026 but neither is Tailwind for a 4-view app |
| Language | TypeScript 5.5 (strict) | Non-negotiable; strict mode keeps reducer purity honest |
| Testing | Vitest + Playwright (light) | Vitest for reducers (where most value lives); 3 Playwright smoke flows (create / edit / switch) |
| Deploy target | Cloudflare Pages | Free, edge-native, preview URL per branch |

## Architecture sketch

Three tiers, small.

**Tier 1 — View (inferno-hyperscript).** Components are pure functions `(props, state) => vdom`. Hyperscript helpers from `inferno-hyperscript` render as direct tree construction:

```ts
const Sidebar = ({ notes, activeId, onSelect }: SidebarProps) =>
  div('.sidebar', [
    div('.sidebar-header', [input('.search', { oninput: onSearch })]),
    ul('.note-list', notes.map(n =>
      li({ className: n.id === activeId ? 'active' : '', onclick: () => onSelect(n.id) }, [
        span('.note-title', n.meta.title || 'Untitled'),
        span('.note-updated', formatRelative(n.meta.updated))
      ])))
  ]);
```

**Tier 2 — Store (functional, assembled from per-action files).** Each action file exports its FSA action creator(s) and its reducer slice. `reducer.ts` gathers them via `Object.assign` into one map passed to `typeToReducer` — the exact pattern the baseline used. The store itself is a 40-line `createStore(reducer, initialState)` with no Redux dependency and no middleware framework; a tiny `runEffects` helper handles async side-effects.

**Tier 3 — Editor (CodeMirror 6, owned).** CodeMirror is its own state container for note bodies. The app store **never mirrors editor text**. On note-switch, we swap CodeMirror's `EditorState`. On edit, a debounced change listener writes the body back through the persistence pipeline, not into app state. This split is the single most important design decision; it's also what makes collab a swap rather than a rewrite.

### Trace 1 — "Save an edit to a note"

1. User types in CodeMirror. Its internal `EditorState` updates synchronously; no app-level re-render.
2. A `debouncedChangeListener` (300 ms) fires with the settled text.
3. The listener dispatches `editPersist({ id, body })`.
4. The `editPersist` effect writes `{ meta: state.meta[id], body }` to IndexedDB via `idb-keyval`, then dispatches `editPersisted({ id, savedAt })`.
5. The `editPersisted` reducer updates `meta[id].updated` only. The sidebar re-renders (title + "2s ago"); the editor stays untouched.

IndexedDB (not localStorage) because notes grow: localStorage's 5 MB sync-string limit is the wrong shape. `idb-keyval` is ~1 KB.

### Trace 2 — "Switch to a different note"

1. User clicks a sidebar item. `onclick` dispatches `selectNote(id)`.
2. Reducer sets `activeId` in state.
3. Inferno re-renders. The `Editor` component's `useEffect` notices `activeId` change.
4. Effect: (a) fetches the new note's body from IDB, (b) dispatches a CodeMirror `transaction` that replaces the entire doc (`changes: { from: 0, to: state.doc.length, insert: body }`).
5. CodeMirror paints. No remount, no tree teardown — only the editor's internal state swaps.

No routing. URL unchanged. (Optional v1.1: `#<noteId>` hash for deep links.)

## File tree

```
src/
  app.ts                       // root component
  index.ts                     // bootstrap
  components/
    sidebar.ts
    editor.ts                  // wraps CodeMirror; owns the view instance
    header.ts
    search-input.ts
  store/
    create-store.ts            // ~40 lines, no Redux dep
    reducer.ts                 // Object.assign of per-action reducer slices
    constants.ts               // action type constants, deduped in one file
    run-effects.ts             // minimal effect dispatcher
    actions/
      add-note.ts              // action creator + reducer slice + effect
      delete-note.ts
      rename-note.ts
      select-note.ts
      edit-persist.ts
      search-set.ts
  persistence/
    idb.ts                     // idb-keyval wrapper
  util/
    format-relative.ts
    types.ts
styles/
  tokens.css                   // CSS custom properties
  layout.css
  components/*.module.css
```

## Key code sketches

### `src/store/create-store.ts`

```ts
type Listener = () => void;

export const createStore = <S, A>(reducer: (s: S, a: A) => S, initial: S) => {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    getState: () => state,
    dispatch: (action: A) => {
      state = reducer(state, action);
      listeners.forEach(l => l());
    },
    subscribe: (l: Listener) => { listeners.add(l); return () => listeners.delete(l); },
  };
};
```

### `src/store/actions/edit-persist.ts`

```ts
import { EDIT_PERSIST, EDIT_PERSISTED } from '../constants';
import { idb } from '../../persistence/idb';

export const editPersist = (payload: { id: string; body: string }) =>
  ({ type: EDIT_PERSIST, payload }) as const;
export const editPersisted = (payload: { id: string; savedAt: number }) =>
  ({ type: EDIT_PERSISTED, payload }) as const;

export const editPersistEffect = async (action, dispatch, getState) => {
  if (action.type !== EDIT_PERSIST) return;
  const meta = getState().meta[action.payload.id];
  await idb.set(action.payload.id, { meta, body: action.payload.body });
  dispatch(editPersisted({ id: action.payload.id, savedAt: Date.now() }));
};

export const editPersistReducerObj = {
  [EDIT_PERSISTED]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
      [payload.id]: { ...state.meta[payload.id], updated: payload.savedAt },
    },
  }),
};
```

### `src/components/editor.ts`

```ts
import { h } from 'inferno-hyperscript';
import { EditorView, basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { useEffect, useRef } from 'inferno';
import { idb } from '../persistence/idb';

export const Editor = ({ noteId, onChange }: { noteId: string; onChange: (body: string) => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    viewRef.current = new EditorView({
      parent: ref.current,
      extensions: [
        basicSetup,
        markdown(),
        EditorView.updateListener.of(u => { if (u.docChanged) onChange(u.state.doc.toString()); }),
      ],
    });
    return () => viewRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (!viewRef.current) return;
    idb.get(noteId).then(n => {
      const view = viewRef.current!;
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: n?.body ?? '' } });
    });
  }, [noteId]);

  return h('div.editor-host', { ref });
};
```

### `src/store/reducer.ts`

```ts
import typeToReducer from 'type-to-reducer';
import { addNoteReducerObj } from './actions/add-note';
import { deleteNoteReducerObj } from './actions/delete-note';
import { renameNoteReducerObj } from './actions/rename-note';
import { selectNoteReducerObj } from './actions/select-note';
import { editPersistReducerObj } from './actions/edit-persist';
import { searchSetReducerObj } from './actions/search-set';

const reducerObj = Object.assign(
  {},
  addNoteReducerObj,
  deleteNoteReducerObj,
  renameNoteReducerObj,
  selectNoteReducerObj,
  editPersistReducerObj,
  searchSetReducerObj,
);

export const initialState = { meta: {}, activeId: null, search: '' };
export const reducer = typeToReducer(reducerObj, initialState);
```

## Tradeoffs

- **Niche-framework tax.** Inferno's ecosystem is a shadow of React's. If you need a picker / drag lib / complex component, you're either using a React-compat shim (which mostly works via `inferno-compat`) or writing it yourself. For *this* app — 4 components — that's fine. For a larger app, Solid or Svelte 5 would serve better.
- **"Hand-rolled" is a double-edged word.** A 40-line store is readable and right-sized for 6 actions. It's also yours to maintain. Redux Toolkit would be more code at rest but less code you personally have to understand.
- **No signals.** We get virtual-DOM diffing, not fine-grained reactivity. For a text editor where the body is owned by CodeMirror, this is *correct* — the one high-frequency update path bypasses the framework entirely. For apps with many small frequently-updating leaves across the tree, Solid would win.
- **Bundle is good, not smallest possible.** ~75 KB gzipped lands between "vanilla + textarea" (~15 KB) and "React + TipTap" (~250 KB). CodeMirror 6 is the biggest single contributor (~45 KB including basic-setup + markdown-lang) and that's the right place to spend the budget — text editing is the app's one job.

## Carryovers from the baseline

**Required:**

- **Hyperscript over JSX:** **Kept.** Inferno 8 still publishes `inferno-hyperscript` as a first-party package. The API is compositional (functions, not macros), searchable with ordinary language tooling, and renders the view as data in a way JSX can't quite match. The cost is ~0 in 2026 — hyperscript's tooling isn't worse than JSX's (both need TS types; neither needs a source transform when using function calls). Dropping hyperscript here would be a generic "JSX is the default" reflex; keeping it is a live 2026 choice with concrete benefits.
- **Functional approach:** **Kept in spirit, modernized in instruments.** The baseline's reducers are pure functions; this proposal keeps that. The baseline's point-free helpers via Rambda swap to **Remeda** (modern TS-native functional utility lib — better types, tree-shakable, actively maintained). The baseline's immutable list operations via `funkia/list` are **dropped** — for a notes app the list is small (hundreds at worst) and native-array spread-based updates are plenty. `funkia/list` shines at 10k+ items, which isn't this app.

**Optional carryovers:**

- **Redux pattern (action + reducer slice in same file):** **Kept.** This is the baseline's most distinctive organizational idea and it's aged well. Each `actions/<name>.ts` file exports the action creator(s), reducer slice object, and effect (if any). The `Object.assign`-of-slices trick at reducer-assembly time stays small and delightful. The only change is that we skip the Redux library in favor of a 40-line store, because we don't need middleware pluralism.
- **Reselect memoized selectors:** **Dropped.** Not needed at this scale — Inferno's VDOM diffing plus pure components handles it.

## What's surprising about this proposal

The other three agents will almost certainly pick Svelte 5, SolidJS, or React. This proposal is likely the only one that treats "Inferno in 2026" as a *live* choice rather than a retirement. The surprising part isn't Inferno itself — it's that the decision falls out of **honoring the baseline's identity** rather than defaulting to whatever tops the 2026 JavaScript Rising Stars list. Every baseline carryover (hyperscript, FSA-style actions, reducer-in-file, functional helpers) transfers cleanly. The 2026 upgrade is real but surgical: Vite replaces Webpack, TypeScript 5.5 replaces 4.5, CodeMirror 6 adds a real editor surface, IDB replaces nothing (baseline didn't persist), Remeda replaces Rambda.

What I almost picked instead: **Mithril**. Mithril was designed around hyperscript as its primary API (not an alternative), ships with built-in routing and HTTP, and runs ~10 KB. I didn't pick it because it would have required abandoning the baseline's *specific* lineage — the baseline is Inferno + Redux, and Mithril would have replaced both. Inferno preserves the Redux-shaped story; Mithril would have asked us to tell a different story.

## Build & deploy

- Install: `pnpm install`
- Dev: `pnpm dev` (Vite dev server)
- Build: `pnpm build` (Vite production build)
- Deploy: `wrangler pages deploy dist` (Cloudflare Pages) — or commit to `main` with Pages auto-deploy enabled
- Estimated bundle size: **~75 KB gzipped** — measured as JS + CSS in the production build, gzipped, excluding fonts and images.
  - Math (bundlephobia minzipped estimates + local projection):
    - `inferno` ~8 KB
    - `inferno-hyperscript` ~2 KB
    - `type-to-reducer` ~1 KB
    - `remeda` (tree-shaken to ~8 used funcs) ~5 KB
    - `codemirror` core ~25 KB
    - `@codemirror/lang-markdown` ~8 KB
    - `@codemirror/basic-setup` ~12 KB
    - `idb-keyval` ~1 KB
    - app code ~12 KB
    - CSS ~3 KB
  - Sum ≈ **77 KB** → rounded to **75 KB**.

## Bonus: collab sync sketch (optional)

The architecture is designed so that collab becomes a **body swap**, not a rewrite.

**Sync host:** PartyKit — cheaper and less lock-in than Liveblocks, built on Cloudflare Durable Objects, composes with Pages as our existing deploy target. One room per note (`roomId = noteId`).

**Sync strategy:** Y.js CRDT via `y-codemirror.next`. CodeMirror 6 has first-class Y.js support as a binding. The note body switches from `string` (owned by CodeMirror) to `Y.Text` (owned by CodeMirror *and* synced through Y.js). The app store is unchanged — it never held the body anyway.

**What changes in the v1 architecture to make room:**

1. `edit-persist.ts`'s effect flips from "write full body to IDB" to "let the `y-indexeddb` provider handle durability." The reducer slice stays (we still want to stamp `updated`).
2. `editor.ts` wires a `Y.Doc` + `WebsocketProvider` alongside CodeMirror on mount; the `updateListener`-based change pipe goes away (Y.js syncs on its own tick).
3. `meta` stays app-store-owned but gets replicated through a shared `Y.Map`. Rename / delete flow through Y-ops and dispatch on Y-observe.
4. Presence (cursors, names) is new: `y-codemirror.next`'s awareness layer is ~15 lines of glue.

**What stays:** the entire `type-to-reducer` store, the sidebar, the save-notification pipeline, the routing shape, the deploy target. Collab does not force a framework change. That's the design win.

---

*This proposal comes from the main-thread "informed insider" slot. Unlike the other three agents, I had full orchestration context: I watched the brief evolve from v1.2 → v1.4, I know the repo owner articulated interest in preserving hyperscript and functional approach as part of the series' narrative, and I shaped the brief's own language. Treat this proposal's biases accordingly — it is the proposal most likely to reflect the orchestrator's own priors, by design.*
