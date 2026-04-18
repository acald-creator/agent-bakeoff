/**
 * Search.tsx — sidebar search input
 *
 * Controlled by the store so search query persists across sidebar collapse.
 */
import { type JSX } from 'solid-js';
import { store, setSearchQuery } from '../app/store';

export function Search(): JSX.Element {
  return (
    <div class="search-wrapper" role="search">
      {/* Magnifying glass icon */}
      <svg
        class="search-icon"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <circle cx="5.5" cy="5.5" r="4" />
        <path d="M9 9l3.5 3.5" stroke-linecap="round" />
      </svg>
      <input
        class="search-input"
        type="search"
        placeholder="Search notes…"
        value={store.searchQuery}
        onInput={(e) => setSearchQuery(e.currentTarget.value)}
        aria-label="Search notes"
        autocomplete="off"
        spellcheck={false}
      />
    </div>
  );
}
