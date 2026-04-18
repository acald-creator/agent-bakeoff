import m from "mithril";
import { NoteId, NoteRecord } from "../state/model";

interface NotesSidebarAttrs {
  notes: NoteRecord[];
  selectedNoteId: NoteId | null;
  onSelect: (noteId: NoteId) => void;
}

export const NotesSidebar: m.Component<NotesSidebarAttrs> = {
  view: ({ attrs }) =>
    m("aside.sidebar",
      attrs.notes.map((note) =>
        m("button.note-link", {
          className: note.id === attrs.selectedNoteId ? "is-active" : "",
          onclick: () => attrs.onSelect(note.id)
        }, note.title)
      )
    )
};
