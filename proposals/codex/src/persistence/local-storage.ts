import { AppState, SnapshotV1 } from "../state/model";
import { createInitialState } from "../state/reducers";

const STORAGE_KEY = "small-hyperscript-notes/v1";

export function loadSnapshot(): AppState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createInitialState();
  }

  try {
    const parsed = JSON.parse(raw) as SnapshotV1;
    if (parsed.version !== 1) {
      return createInitialState();
    }
    return parsed.state;
  } catch {
    return createInitialState();
  }
}

export function saveSnapshot(snapshot: SnapshotV1) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}
