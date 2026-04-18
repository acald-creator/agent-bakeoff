import m from "mithril";
import { EditorPane } from "./ui/editor-pane";
import { NotesSidebar } from "./ui/notes-sidebar";
import { PreviewPane } from "./ui/preview-pane";
import { editBody, selectNote } from "./state/reducers";
import { createStore } from "./state/store";
import { AppState } from "./state/model";

interface AppShellAttrs {
  store: ReturnType<typeof createStore>;
}

function currentNote(state: AppState) {
  return state.notes.find((note) => note.id === state.selectedNoteId);
}

export const AppShell: m.Component<AppShellAttrs> = {
  view: ({ attrs }) => {
    const state = attrs.store.getState();
    const note = currentNote(state);

    return m("main.app-shell", [
      m(NotesSidebar, {
        notes: state.notes,
        selectedNoteId: state.selectedNoteId,
        onSelect: (noteId: string) => attrs.store.dispatch(selectNote, noteId)
      }),
      m("section.workspace", [
        m(EditorPane, {
          note,
          mode: state.ui.previewMode,
          onBodyInput: (body: string) => {
            if (!note) return;
            attrs.store.dispatch(editBody, { noteId: note.id, body });
          }
        }),
        m(PreviewPane, { body: note?.body ?? "" })
      ])
    ]);
  }
};
