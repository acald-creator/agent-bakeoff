# Proposal: Small Hyperscript Notes

## Agent
- **Name:** codex
- **Model:** gpt-5 (Codex)
- **Date:** 2026-04-18
- **Collab considered in v1 design:** no

*(Independence rating is filled in by the orchestrator in the comparison post; you don't self-rate it.)*

## TL;DR
I would build this as a small Mithril SPA with a native `textarea`, `micromark` for preview, and a tiny application store made of pure update functions plus a debounced localStorage effect. The point is to keep the baseline's hyperscript sensibility, keep the state model legible, and avoid importing an editor framework whose main advantages only matter once syntax services or collaboration become real requirements. The app stays static-host deployable, URL-addressable by note id, and comfortably within weekend scope. The headline tradeoff is clear: less editor power than CodeMirror today in exchange for lower bundle cost, less abstraction, and a better fit for the actual required surface.

## Stack
| Layer | Choice | Why this over alternatives |
|---|---|---|
| Framework | Mithril | Native hyperscript, tiny runtime, routing/redraw model is enough for this app, and it lets me engage the baseline's hyperscript choice directly instead of defaulting to JSX out of habit. |
| State | Hand-rolled store module with pure reducers and subscriptions | Smaller and easier to reason about than Redux Toolkit or Zustand for a single-user notes app; keeps functional update discipline without inheriting 2022 Redux ceremony. |
| Build | Vite 7 | Fast default, modern Node 20+ tooling, static output to `dist/`, no need for Webpack-era configuration weight. |
| Styling | Plain CSS with CSS custom properties | Enough for split-view editor UI, keeps output inspectable, avoids utility-framework overhead for a very small app. |
| Language | TypeScript 5.x | Strong fit for state/data modeling and persistence boundaries; the proposal benefits from typed note ids, snapshots, and reducer contracts. |
| Testing | Vitest + Playwright smoke test | Vitest covers pure state and persistence helpers cheaply; one Playwright flow can verify create/edit/switch/search without building a deep harness. |
| Deploy target | Cloudflare Pages or Netlify static hosting | Pure client app, localStorage persistence, hash or pathname routing compatible with static hosting. |

## Architecture sketch
The app is a client-only SPA with one durable state tree and one side-effect boundary. The durable state is:

- `notes: NoteRecord[]`
- `selectedNoteId: string | null`
- `query: string`
- `ui: { previewMode: "split" | "edit" | "preview"; lastSavedAt: number | null }`

Each note carries `id`, `title`, `body`, `createdAt`, and `updatedAt`. Search is derived, not stored: the sidebar computes `visibleNotes` from `query` against `title` and `body`. There is no separate draft buffer in v1. The current note body in state is the editor value. That sounds blunt, but for a single-user textarea editor it is the cleanest thing to do: the preview always reflects the same source of truth, autosave does not need a reconcile step, and switching notes does not involve committing or discarding hidden drafts.

State mutations go through tiny action functions such as `renameNote`, `editBody`, `deleteNote`, `selectNote`, and `setQuery`. Those functions are pure: `(state, payload) => nextState`. A store wrapper owns the current state, exposes `dispatch`, `getState`, and `subscribe`, and runs one debounced persistence subscriber. The persistence layer is deliberately narrow: `loadSnapshot()` at boot, `saveSnapshot()` after debounce, and schema versioning so future migrations are straightforward.

Routing is equally small. I would use the URL hash or a lightweight pathname route like `/notes/:id`, but the route's job is limited to note selection. The router should not own the editor state. On boot, the app loads storage, chooses a note, then reconciles that with the route if the note exists. On later sidebar clicks, the store updates first and the route mirrors it. That order matters because note selection is application state; the URL is a reflection of it, not the authority.

1. **"Save an edit to a note"**: a keystroke lands in the `textarea`'s `oninput` handler. The handler dispatches `editBody({ id, body })`. The reducer returns a new state with the matching note's `body` and `updatedAt` changed. Mithril redraws, so the textarea value, word count, modified timestamp, and live preview all reflect the new body immediately. A debounced subscriber sees that state changed, serializes the snapshot, and writes it to localStorage after roughly 250 to 400 ms of idle time. When the write completes, the store can stamp `lastSavedAt`, which updates a small "Saved" indicator in the header without another persistence round-trip.

2. **"Switch to a different note"**: the user clicks a sidebar row. The row handler dispatches `selectNote(noteId)`. The reducer changes `selectedNoteId`; Mithril redraws; the editor pane now reads from a different note object, so the `textarea` content and preview reset to that note's body automatically. Immediately after dispatch, a route-sync helper writes `#/notes/<id>` or `/notes/<id>` so refresh preserves selection. Because the app does not maintain a separate unsaved draft buffer, there is no editor teardown logic beyond changing which note the view reads from.

This is intentionally unglamorous architecture. That is the point. The required app is CRUD, filtering, markdown preview, and local persistence. I want the design pressure to stay on the user-visible product, not on integrating a rich-text ecosystem before the product asks for it.

## File tree
```text
proposals/codex/
├── README.md
├── package.json
├── vite.config.ts
└── src/
    ├── main.ts
    ├── app-shell.ts
    ├── app.css
    ├── state/
    │   ├── model.ts
    │   ├── reducers.ts
    │   └── store.ts
    ├── persistence/
    │   └── local-storage.ts
    └── ui/
        ├── notes-sidebar.ts
        ├── editor-pane.ts
        └── preview-pane.ts
```

## Key code sketches
The sketches focus on the decisions that matter.

`src/state/model.ts` defines a compact domain model. I would keep note records flat and serializable, avoid classes, and use string ids from `crypto.randomUUID()`. The state shape is optimized for the actual flows: select a note, edit it, filter notes, persist the whole snapshot.

`src/state/reducers.ts` contains pure update functions. This is where the functional carryover survives: note creation, deletion, renaming, text edits, and query changes are all ordinary functions returning fresh state. No decorators, no command bus, no action-type boilerplate, and no mutable singleton model hidden behind the framework.

`src/state/store.ts` is the bridge between pure state transitions and framework redraw. A tiny `createStore` function owns state, runs reducers, and notifies subscribers. One subscriber debounces persistence; another can keep the current note id mirrored into the URL. That keeps effects explicit and testable.

`src/ui/editor-pane.ts` shows the editor bet. The editor is just a `textarea` plus metadata and mode toggles. For this requirement set, that is not a downgrade; it is a refusal to overfit. Markdown editing does not inherently require a programmable editor surface. The preview pane, powered by `micromark`, delivers the "markdown app" feel where it matters.

`src/app-shell.ts` composes the layout in Mithril hyperscript. The sidebar receives derived visible notes, the editor pane receives the selected note, and the preview pane receives rendered HTML from the same source string. The component tree stays shallow because Mithril does not need wrapper components for state injection or memoization gymnastics in an app this small.

## Tradeoffs
The biggest tradeoff is editor capability. A native `textarea` gives up syntax highlighting, block widgets, keymap ecosystems, and collaborative editing adapters that come "for free" with CodeMirror 6. If the product quickly grows into slash commands, markdown AST-aware transforms, or multi-cursor collaboration, this v1 will hit a ceiling earlier.

The second tradeoff is ecosystem gravity. Mithril is stable and technically well-suited here, but it has a smaller contemporary ecosystem than React, Vue, or Svelte. That means fewer off-the-shelf examples, fewer prebuilt note-editor demos, and a smaller hiring familiarity surface if this toy grows into a team-owned product.

The third tradeoff is that a hand-rolled store asks for discipline. It is easy at this size, but only if the team resists smuggling ad hoc effects into components. Redux Toolkit would impose more structure. I am choosing to trust the app's size and keep the machinery proportionate.

## Carryovers from the baseline
**Required.** Address each:
- **Hyperscript over JSX:** kept. This is the carryover I would preserve most strongly. The baseline used hyperscript as a real authoring preference, not as an accident before JSX won. For this app, Mithril's hyperscript is still a good fit in 2026 because the UI is mostly layout composition and event handlers, not heavy component metaprogramming. Keeping hyperscript avoids a compiler step for templates, keeps components as ordinary functions, and makes the "view is data" shape explicit. I am not anti-JSX; I am saying that for a small, stateful SPA, JSX does not buy enough to justify abandoning the baseline's most distinctive idea.
- **Functional approach:** partial. I would keep pure state transitions, serializable state, derived views, and explicit effect boundaries. I would drop the older style of point-free helper accumulation, custom immutable list libraries, and Redux action-type indirection. In the baseline, functional programming sometimes paid for itself and sometimes turned trivial updates into ceremony. My version keeps the part that matters architecturally, namely pure updates and deterministic derivation, while using plain arrays, object spreads, and a tiny store instead of building a shrine to functional style.
- *(Optional)* Any other baseline choice you deliberately kept or dropped (Redux pattern, immutable list lib, point-free helpers, etc.): I am deliberately dropping Redux as a library, not Redux's core lesson. One global state tree with pure transitions still fits. `type-to-reducer`, `list`, and Rambda do not. The baseline's shape was right for its time; the package stack was heavier than this app needs now.

## What's surprising about this proposal
The surprising part is probably what I did not choose. In 2026, the obvious notes-app answer is "React or Svelte plus CodeMirror 6." I think that answer is often reflexive. The required editor here is not an IDE, and the collaboration story is explicitly optional. So I am willing to say a plain textarea is the right editor library choice for v1.

I also almost picked Solid with `hyperscript` helpers to split the difference between modern fine-grained reactivity and the baseline's syntax heritage. I did not because that would have made the carryover argument weaker: it preserves the spelling of hyperscript but not the cultural through-line as cleanly as Mithril does. If the bakeoff is partially about whether the baseline's odd choices still have merit, I would rather answer that directly.

## Build & deploy
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Deploy: `npm run build` then upload `dist/` to Cloudflare Pages, Netlify, or Vercel static hosting
- Estimated bundle size: `37 KB gzipped` — measured by methodology estimate as **JS + CSS in the production build, gzipped, excluding fonts and images**. Shown math: `mithril 9 KB + micromark 14 KB + app/state/persistence code 11 KB + CSS 3 KB = 37 KB gzipped`. I did not run a production install in this turn, so this is a bundle-composition estimate rather than an emitted-build measurement.

## Bonus: collab sync sketch (optional)
If collaboration becomes real, I would not stretch the textarea design too far. I would swap the editor layer to CodeMirror 6 and add Y.js as the shared text model, hosted through PartyKit or Cloudflare Durable Objects. The rest of the application state can stay largely intact if I treat note metadata and note bodies differently.

The key architectural change would be splitting persistence domains. Today, the entire note record is stored as plain JSON in localStorage. In a collaborative version, note titles, ordering, and delete markers can remain app-level records, while the active note body becomes a CRDT document keyed by note id. The store would still own `selectedNoteId`, search query, layout mode, and a local cache of note metadata. The editor pane would bind to a Y.js text instance instead of a plain string. Autosave would become offline cache persistence for metadata plus local CRDT document snapshots rather than the primary durability path.

That means this v1 is not secretly a collab-first design. It is a clean single-user design with a migration path: keep the shell, replace the editor subsystem when the product earns that complexity.
