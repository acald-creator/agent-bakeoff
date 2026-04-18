# Proposal: SolidJS + Zustand + CodeMirror 6 — deliberate, collab-ready structure at minimal overhead

## Agent
- **Name:** claude-sonnet-plan
- **Model:** claude-sonnet-4-6
- **Date:** 2026-04-18
- **Collab considered in v1 design:** yes — the state shape (notes keyed by ID, a separate `activeId` cursor, an atomic `updateContent` action) was designed to map cleanly onto a CRDT document model later. The choice of CodeMirror 6 was also influenced by its documented Y.js integration path, even though no sync code ships in v1.

---

## TL;DR

This proposal replaces the Inferno/Redux/Hyperscript baseline with **SolidJS 1.x + Zustand 5 + CodeMirror 6**, built with Vite 6, styled with CSS Modules, deployed as a static Cloudflare Pages site. SolidJS gives fine-grained reactivity without a VDOM diff step — keystroke latency is the headline UX metric for an editor, so this is the right place to make a framework bet. Zustand replaces Redux's ceremony with a flat, Immer-backed store that is still testable without mocking a provider tree. CodeMirror 6 is the only editor library that simultaneously fits the bundle budget, supports markdown natively, and has a first-class Y.js integration path for the eventual collab upgrade. The headline tradeoff is SolidJS's narrower ecosystem compared to React's orbit.

---

## Stack

| Layer | Choice | Why this over alternatives |
|---|---|---|
| Framework | SolidJS 1.x | Fine-grained signals avoid VDOM diffing on every keystroke; 7 KB runtime vs React's 42 KB gzipped; compiles JSX to direct DOM ops. Svelte 5 was the close second but its rune stabilization is recent and its CodeMirror integration story thinner. Inferno (the baseline) was considered for continuity, but its 2026 maintenance posture is uncertain and it gains nothing over SolidJS for this use case. |
| State | Zustand 5 + Immer | Flat store, no provider wrapping, zero boilerplate reducers. Immer middleware gives structural-sharing immutable updates without the `funkia/list` gymnastics the baseline required. Redux Toolkit was the other contender — strictly more capable, but `createSlice`/`createSelector` surface area is unjustified for five state actions. |
| Build | Vite 6 | Sub-second HMR for this app size, native ESM dev server, Rollup production output. esbuild alone was considered for raw speed but Vite's plugin ecosystem handles CodeMirror's ESM sub-package resolution without manual config. Webpack (the baseline tool) is dropped — its config overhead is not warranted here. |
| Styling | CSS Modules | Locally scoped class names, zero runtime overhead, Vite-native. Tailwind v4 was considered; the tradeoff is that Tailwind externalizes design intent into utility strings rather than named component files. For a collab-path design where component boundaries matter, CSS Modules make those boundaries explicit. |
| Language | TypeScript 5.4 strict | Strict mode catches the `undefined`-guard and mutable-state class of bugs that auto-save editors are prone to. JS-only was not seriously considered: the store schema and CodeMirror extension types earn their weight in IDE tooling. |
| Testing | Vitest + @solidjs/testing-library + Playwright | Vitest for unit and store tests (Vite-native, co-located); Playwright for two E2E smoke tests (create note, switch note). The baseline's Mocha + jsdom is replaced purely on ergonomics — same assertion API, no separate tsconfig. |
| Deploy target | Cloudflare Pages | Free tier, global CDN, `wrangler pages deploy dist/` is one command. Vercel and Netlify are equivalent for v1; Cloudflare wins for the collab path because Durable Objects are Cloudflare-native. |

---

## Architecture sketch

One Zustand store (`notesStore`) owns all application state: `notes: Record<string, Note>`, `activeId: string | null`, `searchQuery: string`. SolidJS `createMemo` signals are derived views over that store — not separate state. CodeMirror 6 lives as an **uncontrolled island**: the store pushes content in on note-switch; CodeMirror pushes content out via a debounced `updateListener` extension. There is no reactive binding in between — that is the deliberate design choice explained below.

```
SolidJS component tree
  <App>
    <Sidebar>           <EditorPane>
      <SearchInput>       <NoteTitle>
      <NoteList>          <CodeMirrorHost>   ← uncontrolled island
        <NoteItem>        <MarkdownPreview>
    </Sidebar>          </EditorPane>
  </App>
         │ reads / writes
         ▼
  Zustand notesStore { notes, activeId, searchQuery }
         │ subscriber (every change)
         ▼
  localStorage  "mnotes-v1"
```

### Trace 1: "Save an edit to a note"

1. User types. CodeMirror's `updateListener` fires; if `update.docChanged`, it queues a 500 ms debounced call to `notesStore.updateContent(activeId, doc.toString())`.
2. `updateContent` uses Immer to produce a new `notes` record with updated `content` and `updatedAt`. Store signals change.
3. A Zustand subscriber (registered in `main.tsx`, outside any component) serializes `{ notes, activeId }` to `localStorage["mnotes-v1"]`. Single write path, no separate persistence module.
4. `<MarkdownPreview>` reads via `createMemo(() => store.notes[activeId]?.content)`. SolidJS updates only that DOM node — the editor and sidebar are untouched.

### Trace 2: "Switch to a different note"

1. User clicks a `<NoteItem>`. Handler calls `notesStore.setActiveId(noteId)`.
2. Zustand updates `activeId`. Store signals change.
3. A `createEffect` in `<CodeMirrorHost>` watches the `activeId` signal. When it changes, it imperatively calls `editorView.dispatch({ changes: { from: 0, to: length, insert: newContent } })`. This is an intentional imperative push — it bypasses the reactive graph to avoid the scheduler round-trip that would add latency.
4. `<NoteTitle>` derives from the new note's `title`; SolidJS updates that node directly.
5. `history.pushState` writes `?note=<id>`. No router library — a 10-line `url-state.ts` reads `location.search` on cold load to restore the active note.

---

## File tree

```
src/
  main.tsx                   ← mount SolidJS; hydrate store; register localStorage subscriber
  store/
    notes-store.ts           ← Zustand + Immer store; all state and actions
    notes-store.test.ts      ← Vitest unit tests (no DOM needed)
  components/
    App.tsx
    Sidebar/
      Sidebar.tsx            ← note list + search; uses <For> from solid-js
      Sidebar.module.css
      NoteItem.tsx
    Editor/
      EditorPane.tsx
      CodeMirrorHost.tsx     ← imperative CM6 setup; uncontrolled island
      MarkdownPreview.tsx
  lib/
    debounce.ts              ← 10-line typed debounce; no lodash dep
    url-state.ts             ← pushState / read helpers
    markdown.ts              ← marked + DOMPurify; pure function
  styles/
    global.css               ← reset + CSS custom properties
index.html
vite.config.ts
tsconfig.json
package.json
```

---

## Key code sketches

### `src/store/notes-store.ts` (shape only)

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';

export interface Note {
  id: string; title: string; content: string;
  createdAt: number; updatedAt: number;
}

interface NotesState {
  notes: Record<string, Note>;
  activeId: string | null;
  searchQuery: string;
  createNote: () => string;
  deleteNote: (id: string) => void;
  renameNote: (id: string, title: string) => void;
  updateContent: (id: string, content: string) => void;
  setActiveId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
}

export const useNotesStore = create<NotesState>()(
  immer((set) => ({
    notes: {}, activeId: null, searchQuery: '',
    createNote: () => {
      const id = nanoid();
      set((s) => { s.notes[id] = { id, title: 'Untitled', content: '',
        createdAt: Date.now(), updatedAt: Date.now() }; s.activeId = id; });
      return id;
    },
    updateContent: (id, content) =>
      set((s) => { if (s.notes[id]) { s.notes[id].content = content;
        s.notes[id].updatedAt = Date.now(); } }),
    // deleteNote, renameNote, setActiveId, setSearchQuery follow the same pattern
  }))
);
```

### `src/components/Editor/CodeMirrorHost.tsx` (uncontrolled island)

```typescript
import { onMount, onCleanup, createEffect } from 'solid-js';
import { EditorView, basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { useNotesStore } from '../../store/notes-store';
import { debounce } from '../../lib/debounce';

export function CodeMirrorHost() {
  let container!: HTMLDivElement;
  let view: EditorView;
  const store = useNotesStore;

  onMount(() => {
    const save = debounce((content: string) => {
      const id = store.getState().activeId;
      if (id) store.getState().updateContent(id, content);
    }, 500);

    view = new EditorView({
      parent: container,
      extensions: [basicSetup, markdown(),
        EditorView.updateListener.of((u) => { if (u.docChanged) save(u.state.doc.toString()); })],
    });
    onCleanup(() => view.destroy());
  });

  createEffect(() => {
    const id = store((s) => s.activeId)();
    const note = id ? store((s) => s.notes[id])() : null;
    if (!view || !note) return;
    if (view.state.doc.toString() !== note.content)
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: note.content } });
  });

  return <div ref={container} class="cm-host" />;
}
```

### `src/lib/markdown.ts`

```typescript
import { marked } from 'marked';
import DOMPurify from 'dompurify';
marked.setOptions({ gfm: true, breaks: true });
export const renderMarkdown = (src: string): string =>
  DOMPurify.sanitize(marked.parse(src) as string);
```

Full `Sidebar.tsx` and `notes-store.test.ts` sketches are in `src-sketches/`.

---

## Tradeoffs

**SolidJS over React.** React's ecosystem has roughly 10x more third-party components. Any widget outside SolidJS's orbit requires a vanilla-JS wrapper or a skip. For a two-panel notes editor the required component surface is small enough that this does not bite. If the app grows toward rich-media document management, the calculus tips back toward React.

**Zustand over Redux Toolkit.** Zustand gives up the Redux DevTools action log that RTK provides. Debugging a save-race condition requires console-logging in the debounce callback rather than replaying a dispatched action — an honest ergonomic cost in development.

**CodeMirror 6 over a plain `<textarea>`.** A textarea costs 0 KB overhead. CodeMirror 6 adds ~45 KB gzipped. The payoff: markdown syntax highlighting, undo/redo history, mobile keyboard handling, and the Y.js integration path. The textarea alternative is right only if bundle size is the primary constraint.

**CodeMirror 6 over ProseMirror / TipTap.** TipTap models the document as a schema graph — correct for rich text, overhead for a markdown-source editor where the document is a text buffer. CodeMirror 6's text-buffer-plus-optional-AST model matches exactly.

**No router library.** `?note=<id>` with a 10-line helper costs zero bundle overhead. The tradeoff is non-RESTful URL shape and no nested-route support if the app grows views beyond the two-panel layout.

**CSS Modules over Tailwind v4.** For ~15 components the CSS Modules output is smaller. The real tradeoff is design iteration speed: Tailwind wins on rapid UI sketching; CSS Modules win on long-term explicitness and component isolation.

---

## Carryovers from the baseline

**Hyperscript over JSX: dropped.**
The baseline's `inferno-hyperscript` + `hyperscript-helpers` was principled in 2022: no compilation step, view as plain function calls, natural fit for Inferno's API. In 2026 the specific costs of keeping hyperscript are:
- No TypeScript JSX element-type checking — prop typos are runtime errors, not compile errors.
- SolidJS's JSX transform pre-computes reactive bindings at compile time. Hyperscript bypasses that; you lose the framework's primary performance mechanism.
- No IDE autocomplete for component props; no linter/formatter support.

The argument "hyperscript is just function calls" is true, but SolidJS's JSX compiles to equivalent function calls. The abstraction gap is zero at runtime and negative at authoring time. This is a deliberate drop, not a lazy default to "JSX is modern."

**Functional approach: kept, selectively modernized.**
The baseline's instinct — pure reducers, immutable data, composable helpers — is preserved in spirit with updated tools:

- `type-to-reducer` is replaced by Zustand Immer middleware. Immer produces immutable outputs from mutative-looking code; the reducer is still a pure function (input state → output state), just with less ceremony.
- `rambda` / point-free helpers are dropped at the library level. The specific pipeline operations the baseline used (`filter`, `map`, `compose` over a todo list) are native array methods in 2026 TypeScript. Reaching for `pipe(filter(...), map(...))` when `arr.filter(...).map(...)` is equally readable adds a dependency that pays no dividend at this app's scale. If the app processed large collections through multi-step transform pipelines, the functional-pipeline library would be justified again.
- `renderMarkdown` in `src/lib/markdown.ts` is written as a strict pure function: same input, same output, no side effects. This is the functional discipline that matters most — the path that writes into `innerHTML` must be predictable and testable in isolation.
- `debounce.ts` is a pure function returning a closure. Same pattern as the baseline's action creators; preserved.
- `funkia/list` is dropped in favor of `Record<string, Note>` with Immer. The performance characteristic is the same (structural sharing) with a simpler mental model: keyed lookup by ID is O(1) vs. list scan.

---

## What's surprising about this proposal

The most counterintuitive choice is the **uncontrolled CodeMirror island**. Most SolidJS-with-editor proposals try to make editor content fully reactive — binding a signal directly to CodeMirror's document so the store always reflects the current text. This proposal deliberately does not do that. CodeMirror is dark to the reactive graph during normal typing. The debounced push to the store is the only visibility window. The reason is latency: routing every keystroke through SolidJS's scheduler and back into CodeMirror adds a round-trip that a direct `update.state.doc` read avoids. The tradeoff is that the store is eventually consistent with the editor, not immediately consistent. For a single-user app that is fine. For collab, this is the first thing you would change — and the architecture sketch calls it out explicitly.

What I almost picked: **SvelteKit 5** with native `$state` / `$derived` runes. Svelte's compilation model makes reactivity explicit in the source file (you see the annotations) rather than implicit in function-call wrapping (SolidJS's `createSignal`). For a "planning-first" framing that arguably reads better. I moved away because Svelte's CodeMirror story runs through `svelte-codemirror-editor`, a community wrapper with a smaller maintenance surface than the official CM6 API, and because as of April 2026 the rune migration from stores is documented enough to be correct but recent enough to produce subtle gotchas in complex effects.

---

## Build & deploy

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Deploy: `npx wrangler pages deploy dist/`

**Estimated bundle size: ~90–100 KB gzipped (JS + CSS)**

```
solid-js runtime               7 KB   (bundlephobia)
zustand 5 + immer middleware   6 KB   (2.9 + 3.2 KB)
@codemirror/state             12 KB
@codemirror/view              18 KB
@codemirror/commands           6 KB
@codemirror/lang-markdown      5 KB
codemirror (basicSetup)        3 KB
                            ───────
CodeMirror subtotal           44 KB   (packages share internals; Rollup
                                       merges to ~40–44 KB after tree-shaking)
marked                        10 KB
dompurify                      7 KB
nanoid                         1 KB
app source (TS + CSS)        ~12 KB   (estimated post-gzip)
                            ───────
Total                        ~87–95 KB gzipped
```

Note: CodeMirror's sub-packages share `@codemirror/state` internally; Rollup deduplicates on build. The 87–95 KB figure accounts for that. Actual measurement would require a production build; bundlephobia per-package sums are used here per the v1.4 methodology.

---

## Bonus: collab sync sketch

### Sync strategy: Y.js CRDT

Y.js is the correct choice for text collaboration. Text CRDTs are Y.js's primary use case; CodeMirror 6 has a first-class `y-codemirror.next` binding; and Y.js's merge semantics (concurrent insertions at the same position are deterministically ordered) are exactly what a notes editor needs. OT requires a server to serialize operations — incompatible with the static/edge constraint. LWW silently discards concurrent edits, which is indefensible for a text editor.

### Sync host: Cloudflare Durable Objects

One Durable Object per `noteId` acts as the room server. It holds the Y.js document in memory and broadcasts update messages over WebSockets. Cloudflare's hibernatable WebSocket API means the object sleeps when no clients are connected — costs near zero for a single-user app with occasional collab. The `?note=<id>` URL convention maps directly to the Durable Object room key; no routing change required.

### What changes in the v1 architecture

1. **`updateContent` becomes a Y.js transaction.** The CodeMirror `updateListener` applies Y.js text operations to a shared `Y.Text` instance. Zustand still holds a serialized snapshot for localStorage hydration, now updated via `Y.Text.observe` rather than directly from CodeMirror.

2. **`CodeMirrorHost` gains `y-codemirror.next` binding.** This replaces the manual `createEffect` that pushes content on note-switch; Y.js handles synchronization automatically across clients.

3. **New: `src/sync/room.ts`** — opens a WebSocket to `wss://worker.workers.dev/room/<noteId>`, binds `Y.Doc`, exports a `useRoom(noteId)` composable.

4. **Awareness** via `y-protocols/awareness` adds remote cursor overlays. Purely additive — the v1 component tree does not need restructuring.

Additional bundle cost: `yjs` 14 KB + `y-codemirror.next` 4 KB + `y-protocols` 2 KB = **~20 KB gzipped**, bringing the collab build to roughly 110–115 KB.
