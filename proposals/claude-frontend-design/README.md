# Proposal: Ink — a markdown notes editor built around the feeling of writing

## Agent
- **Name:** claude-frontend-design
- **Model:** claude-sonnet-4-6
- **Date:** 2026-04-18
- **Collab considered in v1 design:** yes — the choice of CodeMirror 6 was partly motivated by its documented Y.js integration path, and the note data shape (an `updatedAt` timestamp and a stable `id` per note) was sized to survive an LWW merge without schema surgery. However, no collaborative infrastructure is wired in v1; those decisions are passive enablers, not active features.

*(Independence rating is filled in by the orchestrator in the comparison post; you don't self-rate it.)*

---

## TL;DR

Solid.js + CodeMirror 6 + vanilla-extract, deployed as a Cloudflare Pages static bundle. The headline tradeoff is that every architectural decision was made after first asking: *what does this moment feel like to the person writing?* The result is a single-column editorial layout with a tactile dark-ink-on-warm-paper aesthetic, signals-based reactivity that never batches away the feeling of instant response, and a typography stack built around a high-quality serif for the editor body. Bundle is approximately 105 KB gzipped. The thing you give up is ecosystem familiarity — Solid's JSX is not React's JSX, and vanilla-extract's type-level CSS is unfamiliar to most teams.

---

## Stack

| Layer | Choice | Why this over alternatives |
|---|---|---|
| Framework | SolidJS 1.9 | Fine-grained signals eliminate virtual DOM diffing on every keystroke; the editor never "re-renders" — only the note title in the sidebar updates when the title changes. React 19 with its server model is architecturally mismatched to a fully-static, writing-focus SPA. Svelte 5's runes are a valid alternative but Solid's composition model maps more cleanly to CodeMirror's own extension/facet system. |
| State | Solid stores (`createStore`) | Zero external state library. A single store holds the notes index; CodeMirror's internal `EditorState` owns the document. Two sources of truth only when necessary, not zero. Zustand or Jotai would work but add a dependency for no benefit here. |
| Build | Vite 6 + `vite-plugin-solid` | Rolldown-backed Vite 6 gives near-instant HMR and a single-pass production build. Webpack is the baseline's burden; esbuild alone lacks the plugin ecosystem; Bun's bundler is still maturing. |
| Styling | vanilla-extract | Typed CSS-in-TS with zero runtime overhead. Design tokens live as a TypeScript contract (`tokens.ts`), not a loose JSON file. Tailwind would fight the custom typographic scale; CSS Modules lack the token-sharing story; styled-components' runtime cost is antithetical to the perf goal. |
| Language | TypeScript 5.5 strict | No JSDoc-only alternative considered — the editor model and CRDT-ready data shapes need discriminated unions and branded types. |
| Testing | Vitest + Playwright | Vitest for pure functions (persistence codec, search filter); Playwright for two critical user journeys (create note → write → reload → content persists; switch notes → editor resets to correct content). No component-unit testing of UI — the visual surface is tested visually. |
| Deploy target | Cloudflare Pages | `wrangler pages deploy dist/` after `vite build`. Zero config, global CDN, free tier covers this use case entirely. Vercel or Netlify are equally valid; Cloudflare's edge Workers path is the most direct upgrade route if the collab sketch below is ever built. |

---

## Architecture sketch

### The shape

The app has two zones: a **sidebar** (note list + search) and a **writing surface** (CodeMirror editor + live preview). The sidebar is always visible on wide viewports; on narrow viewports it is a sheet that slides in over the writing surface. There is no topnav, no modal dialogs, no multi-column grid. Every pixel of screen real estate that isn't a note list item or the editor itself is negative space doing typographic work.

### State ownership

```
┌─────────────────────────────────────────────┐
│ Solid createStore: NotesStore               │
│  notes: Note[]         (index + metadata)   │
│  activeNoteId: string  (nullable)           │
│  searchQuery: string                        │
└────────────┬────────────────────────────────┘
             │ activeNoteId changes
             ▼
┌─────────────────────────────────────────────┐
│ CodeMirror EditorView                       │
│  EditorState  (document, selection, history)│
│  Extensions   (markdown, vim-optional,      │
│                theme, collab-ready)         │
└─────────────────────────────────────────────┘
             │ transactions
             ▼
┌─────────────────────────────────────────────┐
│ localStorage  (debounced, 400ms)            │
│  notes/{id}: { id, title, body, updatedAt } │
└─────────────────────────────────────────────┘
```

The `NotesStore` is deliberately thin — it holds metadata (id, title, updatedAt, a snippet for the sidebar) but *not* the full note body. The body lives in localStorage and is loaded into CodeMirror on demand. This means the sidebar re-renders cheaply (small objects) and the expensive part (a 10 KB markdown document) is only touched when you open that note.

### Trace: "Save an edit to a note"

1. **Keystroke** lands in CodeMirror's `EditorView`. CodeMirror dispatches a transaction containing the character insertion.
2. CodeMirror's update listener (`EditorView.updateListener`) fires. This is a synchronous callback, not a Solid reactive effect — it runs inside CodeMirror's own update cycle.
3. The update listener calls `scheduleSave(noteId, doc.toString())`. This arms a 400 ms debounce timer and returns immediately. The keystroke feels instantaneous because nothing blocks it.
4. **Visual feedback at 0ms:** CodeMirror re-renders its own viewport (no VDOM, direct DOM mutation). The character appears. There is a small dot indicator in the sidebar next to the note title — a CSS `opacity` transition driven by a Solid signal `isDirty`. This flickers on at keystroke.
5. **At 400ms:** The debounce fires. `persistNote(id, body)` serializes to `localStorage`. The `isDirty` signal is set to `false`. The dot fades out via CSS transition (200ms ease-out). The title snippet in the sidebar updates via a targeted Solid signal update — only the `<NoteListItem>` for the active note re-renders.
6. **What the user feels:** writing is frictionless. The subtle dirty-state dot confirms something is being tracked without demanding attention. The fade-out is the only visible confirmation of a save — no toasts, no "Saved at 3:42pm" banners.

### Trace: "Switch to a different note"

1. **Sidebar click** on a `<NoteListItem>` calls `setActiveNote(id)`.
2. Solid's fine-grained reactivity: `activeNoteId` signal updates. Only the components that read `activeNoteId` re-run — the `Editor` component and the `NoteListItem` that was previously active (removes active styling) and the one just clicked (adds active styling). The rest of the sidebar does not re-render.
3. The `Editor` component, watching `activeNoteId`, calls `loadNote(id)` — reads the body from localStorage synchronously (sub-millisecond for typical note sizes).
4. CodeMirror receives a `setState` dispatch: `view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: body }, selection: EditorSelection.cursor(0) })`. The editor's scroll position resets to top. History is **cleared** for the new note (a separate dispatch) so Cmd+Z doesn't undo into the previous note's text.
5. **Visual feel:** there is a 120ms CSS `opacity` crossfade on the editor surface — from 0.6 to 1.0 — triggered by toggling a CSS class on the editor container. This is driven by a `classList` binding on the editor wrapper, not a JS animation library. The transition communicates "new content loaded" without being slow.
6. **URL/route:** the active note id is written to `location.hash` (`#note-<id>`). This enables deep-linking and browser back/forward navigation between notes. No router library — a single `hashchange` listener and a `createEffect` that syncs `location.hash` to `activeNoteId` bidirectionally. Hash-based routing costs ~0 KB and handles the full navigation story for a single-user app.

---

## File tree

```
proposals/claude-frontend-design/
├── README.md
├── package.json
├── vite.config.ts
├── tokens.ts              ← design token contract
└── sketches/
    ├── store.ts           ← notes store + persistence
    ├── Editor.tsx         ← CodeMirror integration
    ├── NoteList.tsx       ← sidebar component
    └── theme.css.ts       ← vanilla-extract theme

src/  (full app, when built)
├── index.html
├── main.tsx
├── app/
│   ├── App.tsx
│   ├── store.ts
│   └── persistence.ts
├── editor/
│   ├── Editor.tsx
│   ├── extensions.ts      ← CM6 extension bundle
│   └── theme.css.ts
├── sidebar/
│   ├── Sidebar.tsx
│   ├── NoteList.tsx
│   ├── NoteListItem.tsx
│   └── Search.tsx
├── design/
│   ├── tokens.ts
│   ├── global.css.ts
│   └── typography.css.ts
└── lib/
    ├── persistence.ts
    ├── search.ts
    └── id.ts
```

---

## Key code sketches

Full sketches with inline commentary are in `sketches/` — see `store.ts`, `Editor.tsx`, `NoteList.tsx`, `persistence.ts`, and `theme.css.ts`. What follows are the decision-revealing excerpts.

### `tokens.ts` — the design contract first

The token file is written before any component. Every color, spacing step, and type size derives from it; nothing in the component tree hardcodes a value. The palette commitment in one line:

```typescript
accent: '#B8311F',   // red ink — the single chromatic statement
bg:     '#F5F0E8',   // aged paper — not pure white, not dark charcoal
ink:    '#1A1510',   // near-black with warm tint
```

Font stack declares intent before a pixel is rendered:

```typescript
display: '"Playfair Display", Georgia, serif',  // sidebar headings, note titles
prose:   '"Literata", Georgia, serif',          // editor body — built for reading
mono:    '"Fira Code", "Cascadia Code", monospace',
ui:      '"DM Sans", system-ui, sans-serif',    // search, buttons, metadata only
```

The `accent` color is the only chromatic element. Everything else is warm neutrals. Fonts are preloaded from Google Fonts CDN — not bundled, excluded from the bundle size below.

---

### `store.ts` — Solid store, no external state lib

No reducer, no action type string, no dispatch. Actions are plain exported functions; `produce` from `solid-js/store` provides structural-sharing immutability:

```typescript
export interface Note {
  id: string;
  title: string;
  snippet: string;   // first 120 chars of body — sidebar never loads full bodies
  updatedAt: number; // ms epoch — LWW merge key if collab is added
}

const [state, setState] = createStore<NotesState>({ notes: loadAllNotes(), activeNoteId: null, searchQuery: '' });

export function applyNoteSave(id: string, title: string, body: string) {
  setState('notes', (n) => n.id === id, produce<Note>((n) => {
    n.title = title; n.snippet = body.slice(0, 120); n.updatedAt = Date.now();
  }));
  persistNote(id, { title, body, updatedAt: Date.now() });
}
```

Redux's ceremony solved a problem (traceable state changes) that Solid's reactive graph already handles directly.

---

### `Editor.tsx` — CodeMirror 6 integration

The key structural decision: CodeMirror owns the document; Solid only signals note switches. The update listener fires on every transaction but only the 400ms debounce path writes to localStorage:

```typescript
EditorView.updateListener.of((update) => {
  if (!update.docChanged || isLoadingNote) return;
  setIsDirty(true);                          // dirty dot appears immediately
  scheduleSave(store.activeNoteId, update.state.doc.toString());  // deferred 400ms
}),
```

On note switch, a `createEffect` watching `activeNoteId` replaces the document and clears undo history — Cmd+Z must never cross note boundaries:

```typescript
createEffect(() => {
  const id = store.activeNoteId;
  if (!id || !view) return;
  container.dataset.transitioning = 'true';  // triggers CSS opacity crossfade
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: loadNoteBody(id) },
                  selection: EditorSelection.cursor(0) });
  requestAnimationFrame(() => { delete container.dataset.transitioning; view.focus(); });
});
```

---

### `persistence.ts` — index/body split

The sidebar reads the index (metadata, ~150 bytes per note) on startup. Full bodies are loaded only when a note is opened. A user with 500 notes loads 500 small objects, not 500 full documents:

```typescript
// Two separate localStorage key spaces:
const noteKey  = (id: string) => `ink:note:${id}`;  // full NotePayload
const INDEX_KEY = 'ink:index';                        // Record<id, NoteIndexEntry>

export function persistNote(id: string, payload: NotePayload): void {
  localStorage.setItem(noteKey(id), JSON.stringify(payload));
  // Index stores only metadata — never the full body
  index[id] = { id, title: payload.title, snippet: payload.body.slice(0, 120), updatedAt: payload.updatedAt };
  writeIndex(index);
}
```

---

## Tradeoffs

**Given up:**

- **Ecosystem familiarity.** Solid is not React. The JSX compiles differently; hooks equivalents (`createSignal`, `createEffect`) have different rules around re-execution. A developer who knows React will need a day of orientation. This is a real cost if the team grows.

- **vanilla-extract build complexity.** It requires a Vite plugin and generates class-name files at build time. Debugging a styling bug means understanding both the TypeScript contract and the generated CSS. Tailwind's class-list approach is more immediately legible to most developers.

- **No markdown preview.** This proposal treats CodeMirror's syntax highlighting as the primary reading mode. A split-pane "preview" is not in the initial design — the claim is that a well-configured CM6 with markdown decorations (bold renders **bold**, headers render larger) is sufficient for most writers. This is a taste decision that will alienate users who expect a "rendered HTML" panel. A preview panel is 1–2 days of additional work and can be added later without architectural surgery.

- **Playfair Display + Literata = two web font loads.** The editorial aesthetic requires real typefaces. The fonts are preloaded with `<link rel="preload">` and served from Google Fonts CDN (not bundled), so they don't inflate the JS/CSS bundle — but they do represent 2–4 network requests and ~80–150 KB of font data on first load. This is a conscious bet that the experience quality justifies it.

- **No offline-first / service worker.** localStorage-backed means the app works offline by nature (it's a static SPA), but there's no background sync, no push, no install prompt. Adding a service worker is a future enhancement.

---

## Carryovers from the baseline

**Hyperscript over JSX:** dropped, with specific reasoning.

The baseline's use of `inferno-hyperscript` via `hyperscript-helpers` was a reasonable choice in 2018–2022 for developers who found JSX's HTML-in-JS mixing aesthetically uncomfortable. In 2026, the design argument against it is stronger than the technical one: modern JSX, especially Solid's JSX, has first-class tooling for conditional rendering (`<Show>`), list rendering (`<For>`), and CSS class composition that makes the *structure of a component visually readable at a glance*. The hyperscript equivalent of a `<NoteListItem>` involves nested `h()` calls with selector strings — readable if you trained on it, but opaque to anyone reviewing the code for design intent. When the primary goal is a *written-for-reading* codebase that encodes visual design decisions, JSX's structural legibility wins. Mithril and hyperapp still support hyperscript natively and are credible 2026 choices for teams with that preference, but they trade away Solid's fine-grained reactivity, which is load-bearing for this proposal.

**Functional approach:** kept partially, justified specifically.

The baseline used `type-to-reducer`, `funkia/list`, and `rambda` for a fully functional, point-free style. This proposal keeps the *discipline* (pure functions, data-in / data-out persistence codec, no mutation outside `setStore`) but drops the *ceremony*. Here is the specific argument: `type-to-reducer` solved the problem of exhaustive action-type matching in Redux reducers; Solid's `produce` from `solid-js/store` gives you immer-style structural-sharing mutations that are just as safe with less boilerplate. `funkia/list` provided a persistent/immutable list structure; `Note[]` in a Solid store is already structurally shared — you cannot mutate it without going through `setStore`. `rambda`'s point-free helpers (pipe, compose, map, filter) are genuinely useful, and this proposal does use `Array.prototype` equivalents plus a small number of hand-written pipeline utilities — but the full `rambda` import is not justified for an app whose data transformations are mostly filtering and sorting a small array. The functional *values* (immutability, pure functions, composability) are preserved; the 2022 *tooling* that enforced them in a Redux context is not necessary in a Solid context.

Other baseline choices deliberately dropped:

- **Redux:** replaced by Solid's built-in `createStore`. Redux's predictability benefit was tightly coupled to React's batch-render model; in Solid, fine-grained signals already give you a traceable reactive graph without the action/reducer/selector ceremony.
- **Inferno:** a fascinating choice in 2022 for React-compatible performance without the React team's decisions; in 2026, Solid has fully superseded it on performance benchmarks and has a larger community. There is no reason to pick Inferno today.
- **Webpack 5:** replaced by Vite 6. The configuration overhead Webpack requires is not justified for a project of this scope.

---

## What's surprising about this proposal

The most surprising choice is what this proposal *refuses to add*: there is no preview pane, no toolbar, no keyboard shortcut cheat sheet overlaid on the editor, no tag system, no "focus mode" toggle, no Notion-style block commands. Every one of those features is a legitimate product decision — and every one of them exists because a designer or PM wanted to make the app feel "feature-complete." The design thesis here is the opposite: the quality of the writing experience comes from *removing* the UI surface, not adding to it.

The second surprise is the color palette. In 2026, almost every dark-mode-first notes app uses a near-black background with blue-white text — the palette of every IDE since VS Code popularized it. Ink uses a warm, slightly aged paper background in light mode as the primary and canonical experience. The red ink accent is a single emphatic color. The typefaces are editorial serifs — not the grotesque sans-serifs that dominate every "productivity tool" on the market. The bet is that a user who writes regularly will spend hundreds of hours looking at this surface, and a surface that looks like a book page feels less like a developer tool and more like a notebook.

What I almost picked instead: SvelteKit with Svelte 5 runes. The ergonomics are genuinely excellent and the community is large. I chose Solid because its fine-grained reactivity has a structural parallel to CodeMirror 6's extension/transaction model — both treat the document as a value and the view as a derived function of it. That alignment is not coincidental and it simplifies the editor integration considerably. SvelteKit's server-rendering story (even when fully disabled) adds cognitive overhead for a purely client-side app.

---

## Build & deploy

- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Deploy: `pnpm dlx wrangler pages deploy dist --project-name ink-notes`

**Estimated bundle size: ~105 KB gzipped (JS + CSS)**

Math:

| Dependency | Gzipped estimate |
|---|---|
| `solid-js` (core + store) | ~14 KB |
| `codemirror` (basicSetup) | ~38 KB |
| `@codemirror/lang-markdown` | ~12 KB |
| `@codemirror/language-data` (lazy-chunked) | ~3 KB initial |
| `@vanilla-extract/css` runtime | ~0.5 KB (near-zero, static) |
| App code (components, store, persistence, lib) | ~9 KB |
| Generated CSS (vanilla-extract output) | ~5 KB |
| **Total** | **~81.5 KB initial + ~24 KB lazy (language data)** |
| **Effective first-load** | **~82 KB gzipped** |

The `@codemirror/language-data` bundle (syntax highlighting for fenced code blocks in markdown) is code-split via dynamic `import()` and loads only when the editor first encounters a fenced block with a named language. The initial page load is approximately 82 KB, rising to ~105 KB if all lazy chunks are loaded. Fonts (Playfair Display + Literata + Fira Code via Google Fonts, ~150 KB) are excluded per the brief's methodology.

---

## Bonus: collab sync sketch

The v1 design is collab-influenced (declared in the Agent header) at two specific points:

1. **`updatedAt` timestamp on every note** — a last-write-wins merge key. In single-user mode it is unused as a conflict field; in collab mode, two clients that both edited a note while offline can be reconciled by accepting the higher `updatedAt` value for the entire note body (LWW at the note level, not the character level). This is coarse but correct for the "async, eventually consistent" case.

2. **CodeMirror 6 as editor** — CM6 has a documented, well-maintained Y.js binding (`y-codemirror.next`). The extension system means you attach `yCollab(yText, provider)` to an existing `EditorView` without rewriting the editor component. The single-user `EditorView` and the collaborative `EditorView` are the same component with a different extension list.

**To go collaborative:**

- **Sync strategy:** Y.js CRDT (character-level, merge-safe). LWW at the note level is sufficient for async/offline; Y.js is required for real-time concurrent editing without conflicts.
- **Sync host:** Cloudflare Durable Objects. One Durable Object per note, holding the Y.js document state and broadcasting updates to connected clients. Cloudflare Pages + Durable Objects is a natural fit because this proposal is already targeting Cloudflare Pages for static hosting. The upgrade path is: add a Cloudflare Worker that instantiates a Durable Object per note, switch the persistence layer from `localStorage.setItem` to `y-websocket`'s provider, keep the editor component unchanged.
- **Architecture changes:**
  - `persistence.ts` grows a `createSyncProvider(noteId): Provider` function that returns either a `localStorage`-backed mock provider (offline/single-user) or a `WebsocketProvider` (online/collab).
  - The `NotesStore` gains an `onlineStatus` signal and a `collaborators` map per note (for presence indicators).
  - The sidebar gains a small avatar stack per note showing who else is in that note.
  - No changes to the editor component itself — only the extension list changes when a sync provider is attached.

The notable constraint: Cloudflare Durable Objects are not free at scale. A low-traffic single-user deployment costs nothing; a multi-user product at meaningful scale requires a paid Cloudflare plan. The architecture supports swapping the sync host (PartyKit, Liveblocks, self-hosted `y-websocket` server) without touching the editor layer.
