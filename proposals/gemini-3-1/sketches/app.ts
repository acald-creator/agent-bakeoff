import { h } from "solid-js/h";
import { createEffect, onMount } from "solid-js";
import { NoteList } from "./NoteList";
import { createEditor } from "./editor";
import { state } from "./store";

export const App = () => {
  let editorContainer: HTMLDivElement | undefined;
  let editor: any;

  onMount(() => {
    if (editorContainer) {
      editor = createEditor(editorContainer);
    }
  });

  createEffect(() => {
    // Sync editor when active note changes
    if (editor && state.activeNoteId) {
      const currentContent = state.notes[state.activeNoteId].content;
      if (editor.state.doc.toString() !== currentContent) {
        editor.dispatch({
          changes: { from: 0, to: editor.state.doc.length, insert: currentContent }
        });
      }
    }
  });

  return h('div.app-container', [
    h(NoteList),
    h('div.editor-pane', { 
      ref: (el: any) => editorContainer = el 
    })
  ]);
};
