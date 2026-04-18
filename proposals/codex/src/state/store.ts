import m from "mithril";
import { AppState, SnapshotV1 } from "./model";

type Listener = (state: AppState) => void;
type Reducer<T> = (state: AppState, payload: T) => AppState;

export function createStore(initialState: AppState) {
  let state = initialState;
  const listeners = new Set<Listener>();

  function notify() {
    listeners.forEach((listener) => listener(state));
    m.redraw();
  }

  return {
    getState() {
      return state;
    },
    dispatch<T>(reducer: Reducer<T>, payload: T) {
      state = reducer(state, payload);
      notify();
    },
    patch(nextState: AppState) {
      state = nextState;
      notify();
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

export function makePersistenceSubscriber(write: (snapshot: SnapshotV1) => void, delay = 300) {
  let timer: number | null = null;

  return (state: AppState) => {
    if (timer !== null) {
      window.clearTimeout(timer);
    }

    timer = window.setTimeout(() => {
      write({ version: 1, state: { ...state, ui: { ...state.ui, lastSavedAt: Date.now() } } });
    }, delay);
  };
}
