# Proposal: SolidJS + Vite markdown notes editor with Zustand-flavored signals state

## Agent
- **Name:** claude-sonnet-plan
- **Model:** claude-sonnet-4-6
- **Date:** 2026-04-18
- **Independence:** high — no coordination with other agents; all choices made cold from the brief and baseline alone

## TL;DR

A single-user markdown notes editor built on SolidJS 1.9 + Vite 6 + TypeScript 5, with local state managed through SolidJS primitives (createStore, createSignal) and no external state library. The editor uses CodeMirror 6 for input and marked + DOMPurify for live preview. The headline tradeoff is: fine-grained reactivity without a virtual DOM buys the smallest meaningful bundle and near-zero unnecessary renders, at the cost of a smaller ecosystem and a mental model shift away from React's re-render cycle. Deployed to Cloudflare Pages as a purely static SPA.

## Stack

| Layer | Choice | Why this over alternatives |
|---|---|---|
| Framework | SolidJS 1.9 | Fine-grained reactivity with no VDOM diffing; bundle is ~7 KB vs. React's ~45 KB. Svelte 5's rune compiler is comparable in size but the SFC model adds a file-format layer that fights CodeMirror integration. Vue 3 is fine but brings more runtime than needed for a single-user local app. React 19 is the safe default but overkill when no server components or concurrent features are used. |
| State | SolidJS built-in (createStore, createSignal) | The app's state is a flat list of notes plus one "active note" pointer — no asynchronous thunks, no derived projections complex enough to need a separate library. Zustand would add ~2 KB and solve no real problem here. Jotai's atom model is interesting for collab extension but premature for v1. Redux Toolkit would be the baseline's evolutionary peer — deliberately avoided as the point of the exercise is to move on. |
| Build | Vite 6 + vite-plugin-solid | Sub-second HMR for SolidJS, native ESM, first-class TypeScript. Rolldown (Vite's future Rust bundler) is not yet stable. esbuild alone lacks the dev-server ergonomics. Webpack 5 is what the baseline used — dropping it is intentional. |
| Styling | CSS Modules | Zero runtime, tree-shaken at build time, co-located with components, no class-name collision. Tailwind is fine but requires the JIT compiler step and adds cognitive load on top of an already-unfamiliar framework choice. vanilla-extract is excellent but introduces another build plugin. Plain `<style>` tags in SolidJS work but offer no scoping. |
| Language | TypeScript 5.4 strict | Required for the data model to be trustworthy — a `Note` type that can be serialized to/from localStorage without a runtime schema validator (zod) needs compile-time discipline. JS would be acceptable but makes the persistence layer fragile. |
| Testing | Vitest + solid-testing-library | Vitest runs in the same Vite pipeline, no separate jest config. solid-testing-library mirrors the React Testing Library API, making unit tests of reactive primitives straightforward. Playwright for a single-user local app is overkill unless the collab sketch is implemented. |
| Deploy target | Cloudflare Pages (static) | Free tier, global CDN, zero config for static SPAs, first-class Wrangler CLI integration. No per-request backend is needed. Vercel and Netlify are equivalent; Cloudflare is chosen because the collab sketch (see bonus section) points toward Durable Objects — keeping everything in one ecosystem reduces the future-state integration cost. |

## Architecture sketch

The app has three conceptual layers: **persistence**, **state**, and **view**.

**Persistence** is an isolated module (`src/persistence/localStorage.ts`) that knows how to serialize and deserialize `Note[]` to `window.localStorage`. It exposes two functions: `loadNotes(): Note[]` and `saveNotes(notes: Note[]): void`. The module is intentionally not reactive — it is called imperatively. A debounced write is triggered by the state layer whenever notes change.

**State** lives in a single SolidJS store created in `src/state/notes.ts`. The store holds:

```
{
  notes: Note[];       // ordered array, full content included
  activeId: string | null;
  searchQuery: string;
}
```

The store is initialized from `loadNotes()` at startup. Derived signals — `activeNote()`, `filteredNotes()` — are computed via `createMemo`. Mutations are plain functions exported alongside the store: `addNote`, `deleteNote`, `renameNote`, `setContent`, `setActiveId`, `setSearchQuery`. Each mutation calls `setStore` (SolidJS's immer-like fine-grained setter) and then schedules a debounced localStorage write. There is no action/reducer ceremony because the app does not need replay, time-travel, or middleware.

**View** is organized as a shell layout with three zones: a sidebar (`NoteList`), a toolbar (`NoteToolbar`), and a content area split between `Editor` and `Preview`. The shell uses CSS Grid for layout. SolidJS's `<Show>` and `<For>` primitives handle conditional rendering and list rendering without key-collision risk.

**CodeMirror integration**: CodeMirror 6 is mounted imperatively inside a SolidJS `onMount` callback. The CM editor state is *not* put into the SolidJS store — CM manages its own internal state, and the SolidJS store holds only the serializable string content. A CM `EditorView.updateListener` dispatches content back to the SolidJS store on each change, and the SolidJS store pushes a new CM transaction when `activeId` changes (i.e., when the user switches notes). This is the standard "controlled editor" pattern for CodeMirror 6 and avoids cursor-position thrashing.

**How a "rename note" travels through the system:**
1. User double-clicks a note title in `NoteList` → inline `<input>` appears.
2. On blur or Enter, the component calls `renameNote(id, newTitle)` from the state module.
3. `renameNote` calls `setStore('notes', n => n.id === id, 'title', newTitle)`.
4. SolidJS fine-grained reactivity updates only the single list item that changed.
5. The debounce fires, `saveNotes(store.notes)` writes to localStorage.
6. No diffing, no action dispatch, no selector re-computation — just the one DOM text node updates.

## File tree

```
proposals/claude-sonnet-plan/
  README.md
  brief-critique.md
  package.json
  vite.config.ts
  src/
    main.tsx            # mount point, store initialization
    types.ts            # Note interface, shared types
    state/
      notes.ts          # createStore, mutations, derived signals
    persistence/
      localStorage.ts   # load/save, debounce helper
    components/
      App.tsx           # shell layout (CSS Grid)
      NoteList.tsx      # sidebar, search input, note items
      NoteToolbar.tsx   # rename, delete, new note buttons
      Editor.tsx        # CodeMirror 6 mount
      Preview.tsx       # marked + DOMPurify rendered HTML
    styles/
      app.module.css
      notelist.module.css
      editor.module.css
```

## Key code sketches

### `src/types.ts`

```typescript
export interface Note {
  id: string;        // crypto.randomUUID()
  title: string;
  content: string;
  updatedAt: number; // Date.now() — used for sort, not for sync
}
```

### `src/state/notes.ts`

```typescript
import { createStore, produce } from 'solid-js/store';
import { createMemo } from 'solid-js';
import type { Note } from '../types';
import { loadNotes, saveNotesDebounced } from '../persistence/localStorage';

const [store, setStore] = createStore({
  notes: loadNotes(),
  activeId: null as string | null,
  searchQuery: '',
});

export { store };

export const activeNote = createMemo(() =>
  store.notes.find(n => n.id === store.activeId) ?? null
);

export const filteredNotes = createMemo(() => {
  const q = store.searchQuery.toLowerCase();
  if (!q) return store.notes;
  return store.notes.filter(
    n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
  );
});

export function addNote(): Note {
  const note: Note = {
    id: crypto.randomUUID(),
    title: 'Untitled',
    content: '',
    updatedAt: Date.now(),
  };
  setStore('notes', notes => [note, ...notes]);
  setStore('activeId', note.id);
  saveNotesDebounced(store.notes);
  return note;
}

export function setContent(id: string, content: string) {
  setStore('notes', n => n.id === id, produce((n: Note) => {
    n.content = content;
    n.updatedAt = Date.now();
  }));
  saveNotesDebounced(store.notes);
}

export function renameNote(id: string, title: string) {
  setStore('notes', n => n.id === id, 'title', title.trim() || 'Untitled');
  saveNotesDebounced(store.notes);
}

export function deleteNote(id: string) {
  const remaining = store.notes.filter(n => n.id !== id);
  setStore('notes', remaining);
  if (store.activeId === id) {
    setStore('activeId', remaining[0]?.id ?? null);
  }
  saveNotesDebounced(store.notes);
}

export const setActiveId = (id: string) => setStore('activeId', id);
export const setSearchQuery = (q: string) => setStore('searchQuery', q);
```

### `src/persistence/localStorage.ts`

```typescript
import type { Note } from '../types';

const KEY = 'notes-app-v1';

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Minimal runtime validation: ensure array of objects with expected keys
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n): n is Note =>
        typeof n.id === 'string' &&
        typeof n.title === 'string' &&
        typeof n.content === 'string' &&
        typeof n.updatedAt === 'number'
    );
  } catch {
    return [];
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function saveNotesDebounced(notes: Note[], delay = 400): void {
  if (debounceTimer !== null) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(notes));
    } catch {
      // localStorage full or unavailable — silently drop
    }
  }, delay);
}
```

### `src/components/Editor.tsx`

```typescript
import { onMount, onCleanup, createEffect } from 'solid-js';
import { EditorView, basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { activeNote, setContent } from '../state/notes';
import styles from '../styles/editor.module.css';

export function Editor() {
  let container!: HTMLDivElement;
  let view: EditorView;

  onMount(() => {
    view = new EditorView({
      doc: activeNote()?.content ?? '',
      extensions: [
        basicSetup,
        markdown(),
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            const id = activeNote()?.id;
            if (id) setContent(id, update.state.doc.toString());
          }
        }),
      ],
      parent: container,
    });
  });

  // When the active note changes, replace the editor content
  createEffect(() => {
    const note = activeNote();
    if (!view || !note) return;
    const current = view.state.doc.toString();
    if (current !== note.content) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: note.content },
      });
    }
  });

  onCleanup(() => view?.destroy());

  return <div ref={container} class={styles.editor} />;
}
```

## Tradeoffs

**SolidJS ecosystem is thinner than React.** The component library ecosystem is smaller, Stack Overflow answers are fewer, and hiring for SolidJS is genuinely harder than React. This is a real cost — a team app would tip the scales toward React. For a single-user weekend-scope app being evaluated on technical merit, it is an acceptable tradeoff.

**CodeMirror 6 is not a lightweight choice.** The `codemirror` meta-package with `basicSetup` adds ~250 KB unminified (~90 KB gzipped). A plain `<textarea>` with a marked preview would be ~10 KB. The choice buys: syntax highlighting for markdown, keyboard shortcuts, undo history that survives React/SolidJS re-renders (because CM owns its own state), accessible editing, and a clear extension path to collaborative editing (Y.js + y-codemirror.next). For a notes editor that people will actually type in for extended sessions, this is worth the weight.

**No external FP library.** The baseline used rambda, funkia/list, and type-to-reducer for an explicitly functional style. This proposal uses none of them. The reason is not that functional programming has fallen out of fashion — it is that SolidJS's `createStore` with `produce` gives structural sharing and immutable-update semantics without an additional library, and the app's state mutations are simple enough that point-free composition adds ceremony without clarity. Ramda or Remeda would be appropriate if the state shape were more complex or if transformation pipelines appeared repeatedly.

**No TypeScript schema validation at runtime.** The persistence layer does minimal structural checking rather than running zod. This means a malformed localStorage entry can slip through if a user manually edits their storage. The tradeoff is ~10 KB of bundle size saved and no added dependency. A production app would use zod or valibot; this is a single-user local app.

**CSS Modules over Tailwind.** Tailwind's utility-class approach is well-suited to large teams writing consistent UI quickly. For a ~5-component app with a focused, custom layout, Tailwind's overhead (learning the class names, configuring purge, fighting arbitrary values) exceeds the benefit. CSS Modules give full CSS expressiveness with zero runtime cost.

## Carryovers from the baseline

**Hyperscript over JSX: dropped.**

The baseline used `inferno-hyperscript` + `hyperscript-helpers` to construct VNodes via function calls (`html.div(...)`, `html.input(...)`) instead of JSX. The argument for preserving this in 2026 is that it keeps everything in plain JavaScript/TypeScript without a compile step for template syntax — `h('div', props, children)` is just a function call. That argument was credible in 2017 when JSX tooling was fragile.

In 2026, JSX compilation is table stakes. Vite + the SolidJS JSX transform (`@babel/preset-solid` or `vite-plugin-solid`) compiles JSX at build time to exactly the fine-grained DOM calls SolidJS uses — there is no VDOM layer, and the compiled output is not JSX at runtime. The hyperscript-style API in SolidJS (`h` from `solid-js/h`) exists but loses the compiler's ability to statically analyze which expressions are reactive and which are static. The SolidJS JSX compiler produces dramatically better output than the runtime `h` fallback — using `h` in SolidJS is opting out of the framework's primary optimization.

The deeper issue: `hyperscript-helpers` trades angle brackets for function calls, but it does not change the mental model of component composition. The readability advantage is marginal after the first week of JSX familiarity, and tooling (prettier, eslint-plugin-jsx-a11y, type-aware JSX props in TypeScript) is materially better for JSX. Specifically against hyperscript: the main remaining case for hyperscript-over-JSX is environments where a build step is impossible (CDN scripts, legacy CMS injects). That constraint does not apply here.

**Functional approach: partial — kept in structure, dropped in library ceremony.**

The baseline's functional approach had two distinct parts: (1) pure, immutable state transitions — the Redux reducer model, `type-to-reducer`, `funkia/list`; and (2) point-free composition and FP utility libraries — `rambda`, curried renders.

Part (1) is kept. The state module in this proposal uses SolidJS's `produce` (from `solid-js/store`, structurally equivalent to Immer's produce) for immutable updates. Mutations are pure in the sense that they produce new object references for changed nodes without mutating the original. The persistence layer is a pure function from `Note[]` to `void` (side effect isolated). Derived values (`activeNote`, `filteredNotes`) are computed memos, not stored state — no derived data is mutated directly.

Part (2) is dropped. `rambda` and point-free helpers are not used. The specific reason: SolidJS's reactivity model is declaration-based, and inserting point-free composition into reactive signal pipelines produces code that is harder to trace when a signal is not updating as expected. When debugging reactive graphs, explicit intermediate values with names are significantly easier to follow than composed pipelines. The tradeoff is verbosity at call sites vs. debuggability at runtime — for a reactive framework, debuggability wins.

**Redux pattern: dropped.** The baseline's Redux architecture — store, action creators, reducers, `connect` HOC — was the correct choice in 2022 for Inferno, because Inferno had no built-in state primitive beyond component state. SolidJS's `createStore` provides the same immutable-update semantics and the same single-source-of-truth discipline without the action/dispatch/reducer ceremony. The pattern is preserved in spirit; the library machinery is not.

## What's surprising about this proposal

The most surprising choice is SolidJS over React. In 2026, React 19 has server components, concurrent rendering, and the largest ecosystem in the frontend world. Choosing SolidJS for a new app is a deliberate bet that for a self-contained, purely client-side, single-user app, the VDOM diffing cost is never worth paying — and that fine-grained reactivity at the component level is the right abstraction when there is no server rendering to integrate. A reader familiar with React might expect the obvious answer: React + Zustand + Vite. The proposal argues that "obvious" is not the same as "right-sized."

What was almost picked instead: **Svelte 5**. Svelte 5's rune system (`$state`, `$derived`, `$effect`) is semantically equivalent to SolidJS's signals and compiles to comparable bundle sizes. The reason SolidJS won: Svelte SFCs require the `.svelte` file format, which adds a build-time parsing layer between TypeScript and the component. CodeMirror 6's imperative API (`onMount`, `onCleanup`, `createEffect`) integrates more naturally into SolidJS's lifecycle primitives than into Svelte's `$effect` rune, which has specific constraints around where it can appear and what it can track. For a CM-heavy editor app, the integration seam matters.

What was not picked and why: **Monaco Editor** (VS Code's editor). Monaco is a serious contender — it has excellent TypeScript integration and is battle-tested. It is also ~2.5 MB gzipped and requires a web worker setup that fights Vite's default bundling. For a markdown notes app where the editor is primarily prose, Monaco's code-intelligence features are excess weight. CodeMirror 6's architecture is leaner and its extension model is more approachable for adding collaborative editing later.

## Build & deploy

- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Deploy: `pnpm dlx wrangler pages deploy dist` (or push to GitHub and connect Cloudflare Pages for CI/CD)
- Estimated bundle size (gzipped): `~110 KB` (SolidJS runtime ~7 KB + CodeMirror 6 with basicSetup ~90 KB + marked ~12 KB + app code ~8 KB; DOMPurify adds ~10 KB but can be shimmed lighter)

## Bonus: collab sync sketch (optional)

**Strategy: Y.js CRDT over Cloudflare Durable Objects WebSocket relay**

The single-user architecture already positions itself for collaboration because CodeMirror 6 has a first-party Y.js binding (`y-codemirror.next`), Y.js implements a CRDT (Conflict-free Replicated Data Type) that handles concurrent edits without a central arbitrator, and Cloudflare Durable Objects can serve as the WebSocket relay that ensures all peers share a single Y.js document instance.

**What changes in the single-user architecture:**

1. **The `content` field in `Note` stops being the source of truth for the editor.** Instead, a `Y.Doc` per note becomes the source of truth for editing. The `Note.content` field becomes a "last known snapshot" used only for search indexing and initial load when no WebSocket is available.

2. **A new `sync/` module** wraps the Y.js provider and the Cloudflare Durable Object WebSocket. The provider is created on `setActiveId()` and destroyed on note switch. The SolidJS state module's `setContent` mutation is replaced by Y.js awareness updates.

3. **Durable Objects** (one per note ID) act as the relay and persistence layer. Each Durable Object holds the Y.js document state in Durable Object storage, applies incoming updates, and broadcasts to all connected WebSockets. This is ~100 lines of Cloudflare Worker code.

4. **Presence** (cursor positions, user names) is handled by Y.js Awareness, which is a separate protocol that does not affect CRDT state and requires no additional storage.

5. **Offline resilience**: Y.js supports IndexedDB-backed local persistence (`y-indexeddb`). A user who edits offline accumulates a local Y.js update log; on reconnect, the Durable Object merges it automatically. This is the most significant advantage of CRDT over OT (Operational Transformation) for a notes app: offline-first is free.

**Why not Liveblocks or PartyKit**: Both are managed services that abstract Y.js + WebSocket relay behind an API. They reduce the backend code to near-zero. The tradeoff is vendor dependency and per-seat pricing, which matters at scale. For a prototype, either would be faster to ship. Durable Objects is chosen here because it is already the deployment platform (Cloudflare), keeps infrastructure in one place, and makes the sync logic inspectable and portable.
