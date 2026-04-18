# Proposal: Minimalist Markdown Notes with Lexical and SolidJS

## Agent
- **Name:** devstral
- **Model:** devstral-medium-2512 (via Mistral API)
- **Date:** 2026-04-18
- **Collab considered in v1 design:** no

## TL;DR
A lightweight, reactive markdown editor using SolidJS for fine-grained reactivity, Lexical for rich text editing, and a minimal state layer. The stack prioritizes bundle size and runtime performance over developer ergonomics, with a focus on future-proofing for collaborative features via CRDT-friendly state modeling.

## Stack

| Layer | Choice | Why this over alternatives |
|---|---|---|
| Framework | SolidJS 2.0 | Fine-grained reactivity without VDOM, smaller bundle than React/Svelte |
| State | SolidJS stores + custom CRDT-like diffing | No Redux boilerplate; stores are reactive and composable |
| Build | Vite 5 | Faster HMR, ES modules by default, simpler config than Webpack |
| Styling | CSS Modules + vanilla-extract | Scoped styles without runtime overhead; type-safe themes |
| Language | TypeScript 5.5 | Stricter types, better tooling, and modern JS features |
| Testing | Vitest + @solidjs/testing-library | Fast unit tests, SolidJS-specific utilities |
| Deploy target | Cloudflare Pages (static) | Edge-optimized, zero-config, supports ISR for future collab |

## Architecture sketch

The app is a SolidJS SPA with three main layers:
1. **UI Layer**: SolidJS components with reactive stores
2. **Editor Layer**: Lexical with a custom markdown plugin
3. **Persistence Layer**: IndexedDB fallback to localStorage

**Action Trace 1: Save an edit to a note**
1. Keystroke → Lexical editor updates its internal state
2. Lexical's `onChange` fires, debounced via SolidJS's `createDebounce`
3. Debounced handler serializes Lexical state to markdown (via `@lexical/markdown`)
4. Markdown string dispatched to `notesStore.updateNote()`
5. Store updates trigger auto-save to localStorage (via `createLocalStorage` effect)

**Action Trace 2: Switch to a different note**
1. Sidebar click → `setActiveNoteId(id)` in `uiStore`
2. SolidJS reactivity triggers `Editor` component re-render
3. `Editor` fetches note content from `notesStore` via `activeNoteId`
4. Lexical editor resets with new content (via `editor.setEditorState()`)
5. Previous note's unsaved changes auto-saved before switch (via `onBlur` hook)

## File tree
```
src/
├── components/
│   ├── Editor/
│   │   ├── LexicalEditor.tsx  # Lexical wrapper
│   │   ├── MarkdownPlugin.ts  # Custom markdown serialization
│   │   └── Toolbar.tsx
│   ├── Sidebar/
│   │   ├── NoteList.tsx
│   │   └── Search.tsx
│   └── App.tsx
├── stores/
│   ├── notesStore.ts         # CRUD + persistence
│   └── uiStore.ts            # Active note, sidebar state
├── utils/
│   ├── persistence.ts        # localStorage/IndexedDB
│   └── markdown.ts           # Helper functions
├── styles/
│   ├── main.css              # Global styles
│   └── theme.css.ts          # vanilla-extract themes
├── App.tsx                   # Root component
└── main.tsx                  # Entry point
```

## Key code sketches

**1. Lexical Editor Integration (`LexicalEditor.tsx`)**
```tsx
import { createEditor } from 'lexical';
import { MarkdownShortcutPlugin } from './MarkdownPlugin';

export function LexicalEditor(props: { content: string; onChange: (md: string) => void }) {
  const editor = createEditor({
    nodes: [...], // Minimal node set for markdown
    onError: console.error,
  });

  // Sync Lexical state with markdown prop
  createEffect(() => {
    const parsed = $parseMarkdown(props.content);
    editor.setEditorState(parsed);
  });

  // Debounced markdown serialization
  const debouncedUpdate = createDebounce((editorState) => {
    const md = $generateMarkdown(editorState);
    props.onChange(md);
  }, 500);

  return (
    <div class={styles.editor}>
      <MarkdownShortcutPlugin />
      <ContentEditable class={styles.input} />
    </div>
  );
}
```

**2. Notes Store (`notesStore.ts`)**
```ts
import { createStore } from 'solid-js/store';

type Note = { id: string; title: string; content: string; updatedAt: number };

const [notes, setNotes] = createStore<Record<string, Note>>({});

export const notesStore = {
  updateNote(id: string, updates: Partial<Note>) {
    setNotes(id, produce((note) => Object.assign(note, updates, { updatedAt: Date.now() })));
  },
  // Auto-save effect (separate file)
};
```

**3. Auto-Save Effect (`persistence.ts`)**
```ts
import { createLocalStorage } from './utils';

export function setupAutoSave(notes: Store<Record<string, Note>>) {
  createLocalStorage({
    key: 'notes-v1',
    serialize: (state) => JSON.stringify(state),
    deserialize: (str) => JSON.parse(str),
    onChange: (state) => localStorage.setItem('notes-v1', state),
  })(notes);
}
```

## Tradeoffs

1. **Lexical over CodeMirror/Monaco**:
   - Gained: Rich text editing foundation (tables, images for future collab)
   - Lost: 20KB larger bundle, more complex setup than textarea

2. **SolidJS over React/Svelte**:
   - Gained: 7KB bundle, no VDOM diffing overhead
   - Lost: Smaller ecosystem, less familiar to most devs

3. **No Redux**:
   - Gained: 50% less boilerplate, reactive by default
   - Lost: Time-travel debugging, middleware ecosystem

4. **CSS Modules + vanilla-extract**:
   - Gained: Zero-runtime CSS, type-safe themes
   - Lost: Tailwind's utility-first speed

## Carryovers from the baseline

- **Hyperscript over JSX**: Dropped. JSX is now the de facto standard with better tooling (e.g., TypeScript support). Hyperscript's minimalism doesn't justify the ergonomic cost in 2026.
- **Functional approach**: Partial. Kept immutable updates via SolidJS stores but dropped FSA-style actions (too verbose for this scale). Retained pure functions for markdown transformations.

## What's surprising about this proposal

1. **No ProseMirror**: Despite its markdown strengths, Lexical's smaller bundle and Meta's long-term investment won out.
2. **IndexedDB as fallback**: localStorage is the primary target, but the store is designed to swap in IndexedDB if notes exceed 5MB.
3. **No search library**: Substring search is implemented via a simple `notes().filter()`—overkill to pull in Lunr.js for 100 notes.

## Build & deploy

- Install: `pnpm install` (pnpm for disk efficiency)
- Dev: `pnpm dev` (Vite HMR)
- Build: `pnpm build` (Vite --minify)
- Deploy: `wrangler pages deploy dist` (Cloudflare Pages)
- Estimated bundle size:
  - SolidJS: 7KB
  - Lexical (minimal): 35KB
  - App code: 12KB
  - CSS: 2KB
  - **Total: ~56KB gzipped**

## Bonus: collab sync sketch

**Strategy**: CRDT via Yjs + WebRTC (peer-to-peer for v1).
**Sync Host**: Cloudflare Durable Objects for signaling (no backend needed).
**v1 Changes**:
1. Replace `notesStore` with a Yjs Doc wrapped in a SolidJS store.
2. Add `y-webrtc` provider in `App.tsx`.
3. Modify Lexical to use Yjs bindings (`yjs-lexical`).
4. Persistence: Sync Yjs doc to localStorage *and* broadcast deltas to peers.

**Why this works**:
- Yjs handles conflict resolution automatically.
- WebRTC avoids backend costs for small teams.
- SolidJS's reactivity plays nicely with Yjs's event system.