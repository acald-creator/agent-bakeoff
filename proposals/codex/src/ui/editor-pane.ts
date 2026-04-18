import m from "mithril";
import { NoteRecord } from "../state/model";

interface EditorPaneAttrs {
  note: NoteRecord | undefined;
  mode: "split" | "edit" | "preview";
  onBodyInput: (value: string) => void;
}

export const EditorPane: m.Component<EditorPaneAttrs> = {
  view: ({ attrs }) => {
    const { note, mode, onBodyInput } = attrs;

    if (!note) {
      return m("section.empty", "Select or create a note");
    }

    return m("section.editor-pane", [
      m("header.editor-meta", [
        m("h2", note.title),
        m("small", `Updated ${new Date(note.updatedAt).toLocaleString()}`)
      ]),
      mode !== "preview" &&
        m("textarea.editor-input", {
          value: note.body,
          oninput: (event: InputEvent) => {
            onBodyInput((event.target as HTMLTextAreaElement).value);
          }
        })
    ]);
  }
};
