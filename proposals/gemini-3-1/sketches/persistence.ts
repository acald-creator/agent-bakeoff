import { createEffect } from "solid-js";
import { state } from "./store";

/**
 * Persistence layer for the single-user mode.
 * Decoupled from the store actions via a side-effect (createEffect).
 */
export function initPersistence() {
  createEffect(() => {
    // Solid's createEffect automatically tracks all accessed reactive dependencies.
    // Accessing 'state.notes' here means this effect re-runs whenever any note changes.
    const data = JSON.stringify(state.notes);
    try {
      localStorage.setItem('notes', data);
      console.debug('Notes auto-saved to localStorage');
    } catch (e) {
      console.error('Failed to save notes:', e);
    }
  });
}
