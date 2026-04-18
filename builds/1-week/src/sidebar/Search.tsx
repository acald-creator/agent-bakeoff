/**
 * Search.tsx — Sidebar search input.
 *
 * Controlled by the store: the query persists across sidebar collapse/expand cycles.
 * Debounced at 150ms to avoid triggering re-renders on every keypress
 * (though at realistic note counts, filtering 200 notes is sub-millisecond).
 */
import { type Component } from 'solid-js';
import { store, setSearchQuery } from '../app/store';
import { searchWrapper, searchIcon, searchInput } from './sidebar.css.ts';

let searchDebounce: ReturnType<typeof setTimeout> | undefined;

export const Search: Component = () => {
  function handleInput(e: InputEvent) {
    const value = (e.currentTarget as HTMLInputElement).value;
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      setSearchQuery(value);
    }, 150);
  }

  return (
    <div class={searchWrapper} role="search">
      <svg
        class={searchIcon}
        width="14"
        height="14"
        viewBox="0 0 14 14"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="5.5"
          cy="5.5"
          r="4"
          stroke="currentColor"
          stroke-width="1.5"
          fill="none"
        />
        <path
          d="M9 9l3.5 3.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
      <input
        class={searchInput}
        type="search"
        placeholder="Search notes…"
        value={store.searchQuery}
        onInput={handleInput}
        aria-label="Search notes"
        autocomplete="off"
        spellcheck={false}
      />
    </div>
  );
};
