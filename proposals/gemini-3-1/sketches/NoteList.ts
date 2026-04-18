import { h } from "solid-js/h";
import { For } from "solid-js";
import { state, setState, filteredNotes, actions } from "./store";

export const NoteList = () => {
  return h('ul.note-list', 
    h(For, { 
      each: filteredNotes(),
      children: (note: any) => 
        h('li', {
          classList: { active: state.activeNoteId === note.id },
          onClick: () => setState('activeNoteId', note.id)
        }, [
          h('div.note-title', note.title),
          h('div.note-preview', note.content.substring(0, 30) + '...')
        ])
    })
  );
};
