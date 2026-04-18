# Proposal: SolidJS + Zustand markdown notes editor with CodeMirror 6 and Vite

## Agent
- **Name:** claude-sonnet-plan
- **Model:** claude-sonnet-4-6
- **Date:** 2026-04-18
- **Collab considered in v1 design:** yes — CodeMirror 6 was chosen partly because its transaction/extension model maps cleanly onto a Y.js binding (`y-codemirror.next`), making the editor a first-class citizen in a future collab layer rather than an afterthought. The note state shape (keyed by a stable `id`, with `content` as a plain string) was also kept deliberately simple so a CRDT could own the string value without reshaping the whole store.

*(Independence rating is filled in by the orchestrator in the comparison post; you don't self-rate it.)*

---

## TL;DR

The stack is SolidJS + Zustand + CodeMirror 6 + Vite, deployed as a Cloudflare Pages static bundle. SolidJS gives fine-grained reactivity without a virtual DOM, which removes the main performance excuse for heavyweight editors; CodeMirror 6 is the most defensible editor choice in 2026 because it has first-class TypeScript, a proven Y.js path, and a real extension API. State lives in a single Zustand store with a stable note-ID key scheme. The headline tradeoff is that this stack is genuinely unfamiliar to React developers, which matters for a "bakeoff" proposal—but familiarity is not the same as correctness, and I think SolidJS is the right call here.

---

## Stack

| Layer | Choice | Why this over alternatives |
|---|---|---|
| Framework | SolidJS 1.8 | Fine-grained signals, no vDOM diff overhead, JSX with real DOM bindings. React 19 would also work but its `use()` + server emphasis is drag for a pure client SPA. Svelte 5 is the closest competitor; its rune-based reactivity is excellent but SolidJS has a stronger TypeScript story and the component model is more explicit about what is reactive. |
| State | Zustand 5 | Minimal API, no boilerplate, works outside React (SolidJS has its own signals but a Zustand store is a good single source of truth for cross-cutting concerns like active note and search query). Jotai is also good; Zustand wins on simplicity for this scope. Redux Toolkit would be overkill—three actions don't need a slice pattern. |
| Build | Vite 6 with `vite-plugin-solid` | Sub-second HMR on this codebase size, native ESM, straightforward Rollup-based production build. esbuild alone would also work but Vite's dev experience is noticeably better for rapid iteration. Webpack 5 (the baseline) is not wrong but its config overhead is unjustified here. |
| Styling | CSS Modules + a thin CSS custom-properties theme | Zero runtime cost, co-located styles, good enough for a focused single-user app. Tailwind is viable but its purge setup adds build configuration I don't want to justify for ~10 components. vanilla-extract is elegant but adds a build plugin and a new mental model. |
| Language | TypeScript 5.4+ (strict mode) | Required for the CodeMirror 6 extension API to be usable without pain. The baseline used TS 4.5; strict mode is now the obvious default. |
| Testing | Vitest + `@solidjs/testing-library` for unit; Playwright for one smoke E2E | Vitest shares the Vite pipeline so there is no second bundler config. Playwright covers the "can I type in the editor and see the preview update" case. |
| Deploy target | Cloudflare Pages (`wrangler pages deploy dist`) | Static bundle, global CDN, free tier. Vercel or Netlify are interchangeable for this use case. |

---

## Architecture sketch

### State model

The Zustand store holds the entire application state:

```ts
interface Note {
  id: string;        // nanoid, stable across renames
  title: string;
  content: string;   // raw markdown
  updatedAt: number; // ms epoch
}

interface AppState {
  notes: Record<string, Note>;
  activeNoteId: string | null;
  searchQuery: string;
}
```

Persistence is a Zustand middleware (`zustand/middleware` `persist`) writing to `localStorage` under a versioned key. The debounce on writes (300 ms) lives in the middleware config, not in component code.

### Tracing "save an edit to a note"

1. **Keystroke** lands in the CodeMirror 6 editor instance.
2. CodeMirror fires its `updateListener` extension callback with a `ViewUpdate`. The callback is wired in `EditorPane.tsx` as a one-time `useEffect`-equivalent (`onMount` in SolidJS terms) that subscribes to the CodeMirror `EditorView`.
3. The listener calls `store.updateNoteContent(id, newContent)` — a Zustand action that does `set(state => ({ notes: { ...state.notes, [id]: { ...state.notes[id], content, updatedAt: Date.now() } } }))`.
4. The Zustand `persist` middleware detects the state change and schedules a debounced `localStorage.setItem`.
5. SolidJS's fine-grained reactivity: only the preview pane is subscribed to `notes[activeNoteId].content` via a derived signal. The sidebar title updates only when `title` changes. The editor itself does not re-render (CodeMirror owns its own DOM).

The critical design point: **the editor is not a controlled component**. CodeMirror 6 owns its own document state. The store is the source of truth for persistence and cross-component sharing, not for driving the editor's internal representation on every keystroke. When a note is loaded, the store value is pushed into CodeMirror once (on note switch); after that CodeMirror is the local authority until focus leaves or the note is switched.

### Tracing "switch to a different note"

1. **Sidebar click** calls `store.setActiveNote(newId)`.
2. Zustand updates `activeNoteId`. This is a synchronous in-memory write.
3. SolidJS's `createMemo` for `activeNote` recomputes. Two consumers update: `EditorPane` and `PreviewPane`.
4. `EditorPane` detects the `activeNoteId` change via a `createEffect`. It calls `editorView.dispatch({ changes: { from: 0, to: editorView.state.doc.length, insert: newContent } })` — a single CodeMirror transaction that replaces the document. This avoids destroying and recreating the editor instance (expensive) or triggering the `updateListener` (would cause a spurious save).
5. `PreviewPane` reactively re-renders the markdown HTML because `activeNote().content` changed.
6. URL is updated via the History API (`history.replaceState`) with `?note=<id>` — no full router, just enough for shareable/bookmarkable state. On load, `initFromUrl()` reads the query param and calls `setActiveNote`.

The guard against the spurious save: the `updateListener` checks `update.docChanged && !update.transactions.some(t => t.annotation(skipSave))` where `skipSave` is a custom CodeMirror annotation used by the note-switch dispatch.

### Component tree

```
App
├── Sidebar
│   ├── SearchInput
│   ├── NoteList
│   │   └── NoteItem (×N)
│   └── NewNoteButton
├── EditorPane
│   └── [CodeMirror 6 EditorView — owns its DOM]
└── PreviewPane
    └── [marked/markdown-it rendered HTML — sanitized]
```

The split between `EditorPane` and `PreviewPane` is togglable on narrow screens via a CSS class on `App`; no JS routing needed.

---

## File tree

```
proposals/claude-sonnet-plan/
├── README.md
├── package.json
├── vite.config.ts
└── src/
    ├── main.tsx           # SolidJS render root
    ├── store.ts           # Zustand store + persist middleware
    ├── Editor.tsx         # CodeMirror 6 wrapper
    ├── Preview.tsx        # markdown-it renderer
    ├── Sidebar.tsx        # note list + search
    ├── App.tsx            # layout, split-view toggle
    ├── types.ts           # Note, AppState interfaces
    └── styles/
        ├── app.module.css
        ├── sidebar.module.css
        └── editor.module.css
```

---

## Key code sketches

### `store.ts` — state and actions

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { Note, AppState } from './types';

interface Actions {
  createNote: () => void;
  deleteNote: (id: string) => void;
  renameNote: (id: string, title: string) => void;
  updateNoteContent: (id: string, content: string) => void;
  setActiveNote: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
}

export const useNotesStore = create<AppState & Actions>()(
  persist(
    (set, get) => ({
      notes: {},
      activeNoteId: null,
      searchQuery: '',

      createNote: () => {
        const id = nanoid();
        const note: Note = { id, title: 'Untitled', content: '', updatedAt: Date.now() };
        set(s => ({ notes: { ...s.notes, [id]: note }, activeNoteId: id }));
      },

      deleteNote: (id) => {
        set(s => {
          const { [id]: _, ...rest } = s.notes;
          const nextActive = s.activeNoteId === id
            ? Object.keys(rest)[0] ?? null
            : s.activeNoteId;
          return { notes: rest, activeNoteId: nextActive };
        });
      },

      renameNote: (id, title) =>
        set(s => ({ notes: { ...s.notes, [id]: { ...s.notes[id], title, updatedAt: Date.now() } } })),

      updateNoteContent: (id, content) =>
        set(s => ({ notes: { ...s.notes, [id]: { ...s.notes[id], content, updatedAt: Date.now() } } })),

      setActiveNote: (id) => set({ activeNoteId: id }),
      setSearchQuery: (q) => set({ searchQuery: q }),
    }),
    {
      name: 'notes-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Derived: visible notes in sidebar (filtered + sorted)
export const filteredNotes = (store: AppState) => {
  const q = store.searchQuery.toLowerCase();
  return Object.values(store.notes)
    .filter(n => !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
    .sort((a, b) => b.updatedAt - a.updatedAt);
};
```

### `Editor.tsx` — CodeMirror 6 wrapper

```tsx
import { onMount, onCleanup, createEffect } from 'solid-js';
import { EditorView, basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { Annotation } from '@codemirror/state';
import { useNotesStore } from './store';

const skipSave = Annotation.define<boolean>();

export default function EditorPane() {
  let containerRef!: HTMLDivElement;
  let view: EditorView;
  const store = useNotesStore;

  onMount(() => {
    view = new EditorView({
      doc: store.getState().notes[store.getState().activeNoteId ?? '']?.content ?? '',
      extensions: [
        basicSetup,
        markdown(),
        EditorView.updateListener.of(update => {
          if (update.docChanged && !update.transactions.some(t => t.annotation(skipSave))) {
            const id = store.getState().activeNoteId;
            if (id) store.getState().updateNoteContent(id, update.state.doc.toString());
          }
        }),
      ],
      parent: containerRef,
    });
  });

  // React to note switches
  createEffect(() => {
    const id = store(s => s.activeNoteId)();
    const content = id ? store(s => s.notes[id]?.content ?? '')() : '';
    if (!view) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content },
      annotations: skipSave.of(true),
    });
  });

  onCleanup(() => view?.destroy());

  return <div ref={containerRef} class={styles.editor} />;
}
```

### `main.tsx` — entry point

```tsx
import { render } from 'solid-js/web';
import App from './App';
import { useNotesStore } from './store';

// Restore URL-driven note selection on load
const params = new URLSearchParams(location.search);
const noteParam = params.get('note');
if (noteParam && useNotesStore.getState().notes[noteParam]) {
  useNotesStore.getState().setActiveNote(noteParam);
} else if (!useNotesStore.getState().activeNoteId) {
  // Auto-create first note for empty state
  useNotesStore.getState().createNote();
}

render(() => <App />, document.getElementById('root')!);
```

---

## Tradeoffs

**Given up for SolidJS:** A smaller ecosystem than React. The `@solidjs/testing-library` is maturing but not as battle-tested as RTL. If a future contributor knows only React, there is a learning curve. The bet is that SolidJS's model is simple enough (it is closer to HTML + signals than React's fiber model) that the curve is short.

**Given up for CodeMirror 6:** ProseMirror/TipTap offer richer block-level editing semantics (embed images, slash commands, nested blocks). CodeMirror 6 is line-oriented, not block-oriented. For a "markdown notes editor" that is a fine fit — but if the product later wants Notion-style blocks, the editor would need replacement. I chose not to build in that flexibility now because the spec says "markdown text input with live preview," which is exactly CodeMirror's domain.

**Given up for Zustand over signals-native state:** SolidJS's own `createStore` would be the more idiomatic choice. I picked Zustand because it is framework-agnostic, which matters for the collab sketch below (the sync layer plugs into Zustand without touching SolidJS internals). The cost is a small conceptual mismatch: Zustand returns React-style hooks by default; I'm using its vanilla `create` + manual subscriptions in some places.

**Given up for CSS Modules over Tailwind:** More explicit class names, more typing for styles. Worth it here because this app has clear layout structure (sidebar + editor + preview) and the CSS is not complex. Tailwind's utility classes shine in component-heavy UIs with varied element types; a notes app is mostly layout containers and typography.

**Given up for no full router:** A hash-router (e.g., `@solidjs/router`) would give cleaner URL semantics and forward/back navigation. I went with `history.replaceState` because the spec doesn't require multi-route navigation and adding a router brings its own API surface. If routes are needed later, `@solidjs/router` is a one-dependency upgrade.

---

## Carryovers from the baseline

**Hyperscript over JSX:** Dropped. The baseline used `inferno-hyperscript` + `hyperscript-helpers` to compose view trees as plain function calls — `html.div([h(AddTodo), h(VisibleTodoList)])`. This approach has real merit: views are pure data structures, trivially testable without a render environment, and composable without compiler magic. In 2026, I am dropping it for two specific reasons. First, JSX (or more precisely, the compiler pipeline behind it) has won in all the frameworks I would consider for this app — including SolidJS, where JSX compiles directly to fine-grained DOM operations rather than virtual nodes. The hyperscript model would require either writing SolidJS's `h` calls manually (losing all the reactive compilation) or wrapping them in a helper that re-introduces the overhead JSX was avoiding. Second, TypeScript support for hyperscript-style APIs is weaker: JSX intrinsic elements have detailed typing via `JSX.IntrinsicElements`; a custom `h`-based API requires manual type declarations for every HTML element. That cost was acceptable in 2022; in 2026 with strict TypeScript as the default, it is not.

**Functional approach:** Kept in spirit, adjusted in tooling. The baseline used `type-to-reducer` for pure reducer composition, `funkia/list` for structural sharing, and `rambda` for point-free helpers. I am keeping the core commitment: state is never mutated in place, all actions return new objects via spread, derived values are computed not stored. What I dropped: `rambda` point-free composition (I use plain arrow functions and `Array` methods — the language has caught up to where a library overhead is rarely justified), `funkia/list` (overkill for `Record<string, Note>` where `Object.values` + spread is idiomatic), and `type-to-reducer` (Zustand's action pattern makes it unnecessary). The functional principle that mattered in the baseline — **reducers are pure functions, state is not mutated** — is preserved through Zustand's immutable update pattern and strict TypeScript's `readonly` modifiers on state types.

**Redux pattern:** Dropped in favor of Zustand. Redux's action/reducer/selector split is genuinely valuable at scale. For an app with six discrete actions, the overhead is not justified. Zustand keeps the same unidirectional data flow and single-store constraint without the ceremony.

---

## What's surprising about this proposal

The most likely surprise is the choice of SolidJS over Svelte 5. Both are "not React" reactive frameworks in 2026 and the community energy around Svelte 5's runes is high. I almost picked Svelte 5 — its SFC format is ergonomic for small components, its compiler output is tight, and its CSS scoping is built in. I didn't because Svelte's store story (outside of runes) is still fragmented, and runes don't yet compose as cleanly with third-party state libraries like Zustand. SolidJS's `createEffect` / `createMemo` / `createSignal` primitives are explicit in a way that makes the CodeMirror integration less surprising.

The second surprise may be Zustand rather than SolidJS's native `createStore`. The orthodox SolidJS choice would be to keep state entirely in signals. I chose Zustand because the collab sketch below needs a state container that a sync adapter can intercept without being coupled to SolidJS's reactivity model. That's a deliberate collab-influenced choice (hence the "yes" in the Agent header).

A competent developer who knows neither SolidJS nor CodeMirror 6 could ship this in a weekend — both have excellent documentation, the file tree is small, and there are no exotic patterns. That's the strongest argument for this stack.

---

## Build & deploy

- Install: `npm install`
- Dev: `npm run dev` (Vite dev server with HMR)
- Build: `npm run build` (output to `dist/`)
- Deploy: `npx wrangler pages deploy dist --project-name notes-editor` or drag `dist/` to Cloudflare Pages UI
- Estimated bundle size (gzipped): ~90 KB — SolidJS runtime ~7 KB, CodeMirror 6 + markdown extension ~55 KB, Zustand ~3 KB, markdown-it ~25 KB. No heavy framework runtime (no React, no Angular).

---

## Bonus: collab sync sketch

The v1 design already anticipates this, which is why `content` is a plain `string` in the note shape rather than a structured document and why the editor uses CodeMirror 6.

**Sync strategy:** Y.js CRDT. Y.js represents a shared text document as a `Y.Text` type, and `y-codemirror.next` provides a CodeMirror 6 plugin that binds a `Y.Text` to an `EditorView`. This is the most battle-tested path for collaborative markdown editing in 2026: Notion-style block editors use it, Linear uses a variant, and the CodeMirror integration is maintained.

**Sync host:** Cloudflare Durable Objects via `y-cloudflare`. Each note gets its own Durable Object instance (keyed by note ID), which holds the authoritative Y.js document and broadcasts updates to connected clients via WebSocket. This fits the static/edge-only constraint: the frontend remains a static Cloudflare Pages bundle; the Durable Object is an edge worker, not a long-running server.

**Changes to the v1 architecture:**

1. The Zustand `updateNoteContent` action becomes a write to the `Y.Text` document instead of a plain string update. The `Y.Text` change propagates to the store observer which keeps `notes[id].content` in sync for the preview pane and search index.
2. The `skipSave` annotation in CodeMirror becomes unnecessary — the Y.js binding handles the distinction between local and remote updates.
3. The Zustand `persist` middleware is replaced by a sync adapter: local persistence is still `localStorage` (as an offline cache), but the source of truth for a connected session is the Durable Object.
4. A `CollabStatus` indicator component is added to the sidebar (showing connection state and other active cursors).

The key architectural insight is that because the single-user v1 already avoids controlled-component re-renders for the editor (CodeMirror owns its DOM), plugging in `y-codemirror.next` requires no changes to the component tree — only to the extensions array passed to `EditorView`.
