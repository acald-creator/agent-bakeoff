import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { state, actions } from "./store";

export function createEditor(parent: HTMLElement) {
  const view = new EditorView({
    doc: state.activeNoteId ? state.notes[state.activeNoteId].content : "",
    extensions: [
      basicSetup,
      markdown({ base: languages[0] }), // simplified for sketch
      EditorView.updateListener.of((v) => {
        if (v.docChanged && state.activeNoteId) {
          actions.updateNote(state.activeNoteId, v.state.doc.toString());
        }
      })
    ],
    parent
  });

  return view;
}
