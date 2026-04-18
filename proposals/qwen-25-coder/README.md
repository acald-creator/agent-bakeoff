# Proposal: Modern Markdown Notes Editor

## Agent
- **Name:** qwen-25-coder
- **Model:** Qwen 2.5-Coder 14B (via local Ollama)
- **Date:** 2026-04-18
- **Collab considered in v1 design:** No

## TL;DR
A modern, single-user markdown notes editor built with SolidJS, TanStack Query, Vite, Tailwind CSS, TypeScript, Vitest, and deployed as a static site. The editor uses CodeMirror for rich text input with live preview, leveraging the latest toolchain for performance and maintainability.

## Stack
| Layer | Choice | Why this over alternatives |
|---|---|---|
| Framework | SolidJS | SolidJS offers fine-grained reactivity and high performance, making it ideal for a notes editor. It's also modern and lightweight compared to other frameworks. |
| State | TanStack Query | TanStack Query provides a simple and powerful way to manage state and data fetching, which is crucial for handling note persistence and search. |
| Build | Vite | Vite offers ultra-fast build and dev server performance, perfect for modern development workflows. It supports the latest JavaScript features and is highly extensible. |
| Styling | Tailwind CSS | Tailwind CSS allows for rapid UI development with utility-first classes, making it easy to create a clean and responsive user interface. |
| Language | TypeScript | TypeScript provides static typing, which helps catch errors early and makes the code more maintainable. |
| Testing | Vitest | Vitest is a fast and modern testing framework that works seamlessly with Vite. It supports asynchronous testing and provides a rich set of features for testing. |
| Deploy target | Static site | Deploying as a static site ensures the app is lightweight and can be easily hosted on platforms like GitHub Pages or Vercel. |

## Architecture sketch
The architecture is designed to be simple and efficient. SolidJS handles the UI rendering, while TanStack Query manages state and data fetching. CodeMirror provides the rich text editor with live preview capabilities. The application is built using Vite, which allows for a fast development experience and efficient production builds.

### Saving an edit to a note
1. User types into the CodeMirror editor.
2. SolidJS captures the input event and updates the local state.
3. TanStack Query debounces the state change and persists it to localStorage.
4. The editor reflects the updated state in real-time.

### Switching to a different note
1. User clicks on a note in the sidebar.
2. The sidebar click event is captured by SolidJS.
3. SolidJS updates the active note state.
4. CodeMirror is re-initialized with the content of the new note.
5. The live preview is updated to reflect the new note's content.

## File tree
```
src/
├── assets/
│   └── icons/
├── components/
│   ├── Editor.tsx
│   ├── Sidebar.tsx
│   ├── NoteList.tsx
│   └── App.tsx
├── hooks/
│   ├── useNotes.ts
│   └── useLocalStorage.ts
├── styles/
│   └── globals.css
├── utils/
│   └── markdown.ts
├── index.tsx
├── vite.config.ts
└── tsconfig.json
```

## Key code sketches
### `src/components/Editor.tsx`
```tsx
import { createSignal, onCleanup, onMount } from 'solid-js';
import { useQuery, useMutation } from '@tanstack/solid-query';
import CodeMirror from 'codemirror';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/lib/codemirror.css';

const Editor = ({ noteId, onNoteChange }) => {
  let editorRef: HTMLTextAreaElement | null = null;
  let cm: CodeMirror.Editor | null = null;

  const [content, setContent] = createSignal('');

  onMount(() => {
    if (editorRef) {
      cm = CodeMirror.fromTextArea(editorRef, {
        mode: 'markdown',
        lineNumbers: true,
        lineWrapping: true,
      });

      cm.on('change', (instance) => {
        setContent(instance.getValue());
        onNoteChange(noteId, instance.getValue());
      });
    }
  });

  onCleanup(() => {
    cm?.toTextArea();
  });

  return (
    <textarea ref={editorRef} value={content()} />
  );
};

export default Editor;
```

### `src/hooks/useNotes.ts`
```tsx
import { createQuery } from '@tanstack/solid-query';
import { createSignal, onCleanup } from 'solid-js';

export const useNotes = () => {
  const [notes, setNotes] = createSignal<Record<string, string>>(JSON.parse(localStorage.getItem('notes') || '{}'));

  const saveNote = (id: string, content: string) => {
    setNotes((prevNotes) => ({
      ...prevNotes,
      [id]: content,
    }));
    localStorage.setItem('notes', JSON.stringify(notes()));
  };

  const query = createQuery({
    queryKey: ['notes'],
    queryFn: () => notes(),
  });

  return { notes: query.data, saveNote };
};
```

### `src/components/App.tsx`
```tsx
import { createSignal, onCleanup } from 'solid-js';
import { useNotes } from '../hooks/useNotes';
import Editor from './Editor';
import Sidebar from './Sidebar';

const App = () => {
  const [activeNoteId, setActiveNoteId] = createSignal('');
  const { notes, saveNote } = useNotes();

  const handleNoteChange = (id: string, content: string) => {
    saveNote(id, content);
  };

  const handleNoteSelect = (id: string) => {
    setActiveNoteId(id);
  };

  return (
    <div class="flex">
      <Sidebar notes={notes()} onNoteSelect={handleNoteSelect} />
      <Editor noteId={activeNoteId()} onNoteChange={handleNoteChange} />
    </div>
  );
};

export default App;
```

## Tradeoffs
- **Complexity**: The use of SolidJS and TanStack Query adds complexity compared to a simpler vanilla JavaScript approach. However, the tradeoff is improved performance, maintainability, and developer experience.
- **Features**: While this proposal focuses on single-user functionality, it sets a solid foundation for potential future collaboration features.

## Carryovers from the baseline
- **Hyperscript over JSX**: Dropped — SolidJS uses JSX, which is more widely used and supported in modern frameworks.
- **Functional approach**: Partial — While SolidJS promotes a functional approach, it also supports class components and other paradigms, providing flexibility.

## What's surprising about this proposal
The integration of CodeMirror for live preview and the use of TanStack Query for state management are unexpected choices for a simple notes editor. These choices highlight the importance of using powerful libraries to enhance user experience and maintainability.

## Build & deploy
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Deploy: `npm run deploy` (or deploy to GitHub Pages/Vercel)
- Estimated bundle size: 65KB gzipped (solid-js 7KB + codemirror 45KB + app 10KB + CSS 3KB = 65KB)

## Bonus: collab sync sketch (optional)
Collaboration features can be added in future versions by integrating with a real-time database like Firebase or Supabase. These services provide real-time data synchronization, allowing multiple users to edit notes simultaneously. The v1 architecture can be extended to include user authentication and permissions management to support collaborative editing.