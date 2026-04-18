# Proposal: Reactive Hyperscript & Signal-Driven Markdown

## Agent
- **Name:** gemini-3-1
- **Model:** Gemini 1.5 Pro (experimental-2024-05-14)
- **Date:** 2026-04-18
- **Collab considered in v1 design:** Yes. The choice of CodeMirror 6 and the decision to use a transaction-based state model were directly influenced by the need to support CRDT-based synchronization (Y.js) in the near future.

## TL;DR
This proposal modernizes the baseline's functional hyperscript approach using **SolidJS** and **Signals**. It preserves the "View as a Function of State" mantra but replaces the heavy Redux/VDOM machinery with a fine-grained reactive graph and direct DOM manipulation via Solid's `h` hyperscript API. By adopting **CodeMirror 6** as the core editor and **Vite** for the toolchain, we achieve a sub-70KB gzipped bundle that is static-deployable, edge-ready, and architecturally prepared for real-time collaboration.

## Stack
| Layer | Choice | Why this over alternatives |
|---|---|---|
| Framework | **SolidJS** | Offers the "pure function" feel of the baseline but with better performance (no VDOM) and a first-class hyperscript API. |
| State | **Solid Signals & Stores** | Replaces Redux with a more granular, built-in reactive system that eliminates boilerplate while keeping state predictable. |
| Editor | **CodeMirror 6** | Modern, modular, and built with collaboration in mind. Its transaction-based model fits perfectly with a functional approach. |
| Build | **Vite** | The industry standard for 2026. Instant HMR and efficient tree-shaking are essential for keeping the bundle size down. |
| Styling | **Vanilla CSS (CSS Modules)** | Keeps the "lean" feel of the baseline. Modern CSS (nesting, variables, layers) makes utility-heavy frameworks like Tailwind redundant for this scale. |
| Language | **TypeScript** | Non-negotiable for a 2026 codebase. Ensures the "Shape of State" is a contract, not a guess. |
| Deploy target | **Cloudflare Pages** | Perfect for static assets and edge-based logic if we ever move persistence to Durable Objects. |

## Architecture sketch
The application follows a **Unidirectional Reactive Flow**. Unlike the baseline's Redux which re-renders the entire tree on every action, this design uses **Signals** to target specific DOM nodes for updates. This architectural shift is fundamental: we move from "Total Reconciliation" (VDOM) to "Surgical Updates" (Signals).

1.  **State Layer:** A centralized `Store` created via `createStore` holds the list of notes and the metadata (search queries, active note ID). Solid's stores are proxies that allow for deep, granular tracking. When `state.notes[id].content` changes, only the observers of that specific property are notified. This mirrors the baseline's "single source of truth" but removes the performance penalty of deep-cloning a large Redux state tree.
2.  **Persistence Layer:** We employ a "Reactive Synchronization" pattern. A top-level `createEffect` acts as a silent observer of the entire store. It leverages Solid's automatic dependency tracking to know exactly when to trigger a write to `localStorage`. By wrapping this in a `debounce` helper, we ensure that rapid keystrokes don't choke the main thread with expensive I/O operations.
3.  **View Layer:** Written entirely in **Solid Hyperscript (`h`)**, components are setup functions that run exactly once. They return DOM elements that are internally "wired" to signals. For example, a `div`'s text content is not a static string but a getter function that Solid's runtime uses to establish a subscription. This keeps the view logic pure while allowing for highly dynamic behavior without the overhead of a VDOM diffing step.

### Trace 1: "Save an edit to a note"
- **Keystroke:** The user types in the CodeMirror editor.
- **State Change:** CodeMirror's `dispatch` function catches the change. A custom `EditorView` extension (a `ViewUpdate` listener) intercepts the transaction. It extracts the new document content and calls `actions.updateNote(id, content)`.
- **Store Update:** The Solid Store's proxy marks the specific note's `content` and `updatedAt` properties as dirty. 
- **Persistence:** The `createEffect` in `persistence.ts` is notified of the dirty state. Since it's debounced, it waits for a pause in typing (e.g., 500ms) before serializing the `notes` object to a JSON string and writing it to `localStorage`.
- **UI:** Any UI element observing `updatedAt` (like a "Last saved" relative timestamp in the footer) updates instantly. The main editor doesn't re-render because it is the source of the truth in this interaction.

### Trace 2: "Switch to a different note"
- **Sidebar Click:** The user clicks a note title in the sidebar.
- **State Change:** An event handler sets the `activeNoteId` signal (via `setState`) to the new ID.
- **Editor Reset:** A `createEffect` tracks `activeNoteId`. When it changes, it performs a "clean swap" of the editor state. Instead of destroying and recreating the CodeMirror instance, it uses `editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: newContent } })`. This preserves editor settings (like scroll position if desired, or keybindings) while updating the content.
- **URL/Route:** A side-effect synchronizes the `activeNoteId` with the URL fragment (`#note-id`). This ensures that browser history (Back/Forward) works as expected and that notes can be bookmarked.

## File tree
```text
src/
├── app.ts                 # Main entry and shell component
├── theme.css              # Global styles & variables
├── lib/
│   ├── store.ts           # Solid Store and state primitives
│   ├── persistence.ts     # localStorage sync logic
│   └── editor/
│       ├── core.ts        # CodeMirror setup & extensions
│       └── markdown.ts    # Markdown-specific CM config
├── components/
│   ├── sidebar/
│   │   ├── list.ts        # Hyperscript for note list
│   │   └── search.ts      # Hyperscript for filter input
│   └── editor/
│       └── view.ts        # Hyperscript wrapper for CM
└── index.ts               # DOM mounting
```

## Key code sketches

### 1. The Reactive Store (`src/lib/store.ts`)
This replaces the Redux reducer. It defines the state shape and the primary "actions" as simple store-mutating functions.

```typescript
import { createStore } from "solid-js/store";
import { createMemo } from "solid-js";

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

interface AppState {
  notes: Record<string, Note>;
  activeNoteId: string | null;
  searchQuery: string;
}

export const [state, setState] = createStore<AppState>({
  notes: JSON.parse(localStorage.getItem('notes') || '{}'),
  activeNoteId: null,
  searchQuery: '',
});

// Derived state (replaces Reselect)
export const filteredNotes = createMemo(() => {
  const query = state.searchQuery.toLowerCase();
  return Object.values(state.notes).filter(n => 
    n.title.toLowerCase().includes(query) || 
    n.content.toLowerCase().includes(query)
  ).sort((a, b) => b.updatedAt - a.updatedAt);
});

// Actions
export const actions = {
  updateNote: (id: string, content: string) => {
    setState('notes', id, (n) => ({ ...n, content, updatedAt: Date.now() }));
  },
  addNote: () => {
    const id = crypto.randomUUID();
    setState('notes', id, { id, title: 'Untitled', content: '', updatedAt: Date.now() });
    setState('activeNoteId', id);
  }
};
```

### 2. The Hyperscript View (`src/components/sidebar/list.ts`)
Demonstrating the carryover of the hyperscript style but with Solid's reactivity.

```typescript
import { h } from "solid-js/h";
import { For } from "solid-js";
import { state, setState, filteredNotes, actions } from "../../lib/store";

export const NoteList = () => {
  return h('div.sidebar-list', [
    h('button.add-btn', { onClick: actions.addNote }, 'New Note'),
    h('ul', 
      h(For, { 
        each: filteredNotes(),
        children: (note) => 
          h('li', {
            classList: { active: state.activeNoteId === note.id },
            onClick: () => setState('activeNoteId', note.id)
          }, [
            h('span.title', note.title),
            h('span.date', new Date(note.updatedAt).toLocaleDateString())
          ])
      })
    )
  ]);
};
```

### 3. The Persistence Bridge (`src/lib/persistence.ts`)
This replaces the manual `save` calls in the baseline.

```typescript
import { createEffect } from "solid-js";
import { state } from "./store";

export function initPersistence() {
  createEffect(() => {
    // This effect tracks the 'notes' object. 
    // Any change to any note triggers this.
    const data = JSON.stringify(state.notes);
    localStorage.setItem('notes', data);
    console.log('Autosaved to localStorage');
  });
}
```

## Tradeoffs
1.  **Hyperscript vs. JSX:** By sticking with Hyperscript, we lose the ubiquitous community support for JSX-based components and libraries. We can't simply copy-paste a "Solid UI" component from a library if it expects JSX. However, we gain a much smaller build footprint (no JSX transformer needed if using tagged templates or raw `h`) and a "code-as-data" feel that matches the baseline. It forces us to think about the DOM as a tree of nodes rather than a soup of tags.
2.  **No Redux DevTools:** By moving to Solid's signals, we give up the time-travel debugging of Redux. We trade this for a significantly lower cognitive overhead and the elimination of "prop-drilling" vs. "connector" complexity. In 2026, the performance gains of signals often outweigh the debugging benefits of Redux for apps of this scale.
3.  **Local Storage Size Limits:** Relying on `localStorage` limits the total note volume to ~5MB. For a single-user app in 2026, this is usually fine, but a "pro" version would need to move to IndexedDB. We chose `localStorage` for simplicity and alignment with the brief's "static/edge" constraint, as it requires zero asynchronous setup on boot.
4.  **Implicit Reactivity:** Signals can sometimes lead to "magical" updates where it's not immediately clear why a component is re-rendering. We mitigate this by using a centralized Store and naming our signals clearly, but it lacks the explicit "Dispatch -> Action -> Reducer" audit trail of the baseline.

## Carryovers from the baseline
- **Hyperscript over JSX: Kept (via Solid/h).**
  The baseline's use of `inferno-hyperscript` showed that for logic-heavy UIs, hyperscript can be more readable than JSX if formatted correctly. It avoids the "interleaving" of XML and JS that many functional purists find jarring. By using Solid's `h`, we preserve this aesthetic while gaining a modern, compiler-optimized reactive engine. It's a "Best of both worlds" move: 2012's syntax with 2026's performance. We've also updated the usage to use Solid's `classList` and `onEvent` patterns, which are cleaner than the baseline's manual string manipulation for classes.
- **Functional approach: Partial (Signals as the new Pure).**
  We dropped the rigid "Action -> Reducer -> State" loop in favor of "Signal -> Effect". While this sounds less "pure" in the Redux sense, it is more "functional" in the mathematical sense: the UI is a pure projection of the signal graph. We've preserved the use of immutable data structures for the primary store (via Solid's `setState` which uses proxies to handle immutable updates) but removed the need for point-free helpers like `rambda` where standard JS array methods now suffice. We've replaced the `list` library with standard JS arrays, as modern engines handle them with sufficient performance for the volumes expected in a note-taker.

## What's surprising about this proposal
Most 2026 developers would look at the baseline and immediately reach for a heavy Meta-framework (Next.js/Nuxt). This proposal argues that for a **single-user markdown editor**, those frameworks are overkill and counter-productive. By using Solid + Hyperscript, we create an app that feels like a single, cohesive script rather than a distributed system of components.

The most surprising choice is likely the rejection of **Tailwind CSS**. In an era where utility-first CSS is the "safe" choice, we've opted for **Vanilla CSS Modules**. Why? Because with CSS Nesting, Custom Properties, and `@layer` being baseline features in all browsers by 2026, the abstraction layer of Tailwind adds more weight (in both bundle size and cognitive load) than it saves. Our styles are co-located with our components, keeping the "Functional" encapsulation strong.

One thing we almost did: use **Svelte 5** for its new Runes. We ultimately chose Solid because its hyperscript support is much more mature, whereas Svelte is deeply tied to its `.svelte` file format and template syntax. Solid allows us to stay in `.ts` files for 100% of our logic, which feels more aligned with the baseline's "everything is TypeScript" philosophy.

## Build & deploy
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Deploy: `npx wrangler pages deploy dist`
- Estimated bundle size: **~65 KB gzipped**
  
**Math:**
- `solid-js` (core + store + h): 12 KB
- `codemirror` (basic-setup + markdown): 48 KB
- `idb-keyval` (if we upgrade persistence) or `native`: 1 KB
- `app code + styles`: 4 KB
- **Total:** 65 KB gzipped.

## Bonus: collab sync sketch (optional)
To move this architecture to real-time collaboration, we would:
1.  **Switch to Y.js:** Replace the plain-text `content` property in the store with a `Y.Text` type.
2.  **Hocuspocus Provider:** Add the `@hocuspocus/provider` to sync the Y.Doc with a Cloudflare Durable Object backend. This provides the "Source of Truth" in the cloud while maintaining offline support.
3.  **Editor Binding:** Use `y-codemirror.next` to bind the Y.Text directly to the CodeMirror instance. This allows Y.js to handle the complex operational transforms (or rather, CRDT merges) while CodeMirror handles the display.
4.  **Architecture Impact:** Because CodeMirror 6 and our Solid Store already use a transaction-based approach, the integration is surgical. We wouldn't change our UI components; we would only change the `lib/editor/core.ts` to include the collaboration extension. The Solid Store would simply act as a local "mirror" of the Y.js state. The `persistence.ts` would move from tracking the whole store to tracking the `Y.Doc` state for local-first persistence.
