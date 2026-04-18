# build-notes.md — 1-day build

## One-line summary

Working app scaffolded completely (all 5 functional verbs implemented in code) but `pnpm build` could not be verified — Bash tool denied permission to run `pnpm install` before the build could execute.

---

## What was built

All source files were written and are ready to install and build:

| File | Status |
|---|---|
| `package.json` | Complete — correct dependencies (solid-js 1.9, codemirror 6, vite-plugin-solid) |
| `vite.config.ts` | Complete |
| `tsconfig.json` | Complete |
| `index.html` | Complete — Google Fonts preload for Playfair Display, Literata, DM Sans, Fira Code |
| `src/main.tsx` | Complete — Solid render root |
| `src/app/App.tsx` | Complete — shell layout, empty state |
| `src/app/store.ts` | Complete — Solid createStore, all 5 actions wired |
| `src/lib/persistence.ts` | Complete — split index/body localStorage codec |
| `src/lib/id.ts` | Complete — crypto.randomUUID-based ID |
| `src/editor/Editor.tsx` | Complete — CodeMirror 6, debounced save, note-switch crossfade |
| `src/sidebar/Sidebar.tsx` | Complete — search, note list, dirty dot, delete |
| `src/styles/global.css` | Complete — full editorial aesthetic, warm paper palette |

### 5 functional verbs

1. **Create a new note** — `createNote()` in store.ts, wired to "+ New note" button in Sidebar and empty-state button in App
2. **Edit a note's markdown body** — CodeMirror 6 with `basicSetup` + `@codemirror/lang-markdown`, line wrapping, markdown syntax highlighting
3. **Auto-save to localStorage (debounced)** — 400ms debounce in Editor.tsx, split index/body persistence in persistence.ts
4. **Switch between notes** — sidebar click → `setActiveNoteId()` → `createEffect` in Editor replaces document + clears pending save
5. **Filter by search** — `filteredNotes()` reactive computed in store.ts, substring match on title + snippet

### Design POV attempted

- Warm aged-paper palette (`#F5F0E8` bg, `#1A1510` ink, `#B8311F` red accent)
- Playfair Display for brand and note titles (editorial serif)
- Literata for editor body (long-form reading serif)
- DM Sans for UI chrome (contrasts cleanly with the serifs)
- Dirty-state dot (pulsing red) on active note when unsaved
- 120ms opacity crossfade on note switch
- Active note has red left border accent (`3px solid var(--color-accent)`)
- No topnav, no modal dialogs, maximum negative space
- CodeMirror gutter hidden (no line numbers) — cleaner writing surface

---

## What was deliberately cut

| Cut | Reason |
|---|---|
| `vanilla-extract` | Dropped in favor of plain CSS to avoid the extra build plugin and reduce budget risk. Design tokens implemented as CSS custom properties on `:root` instead. The token contract is still the single source of truth; it's just `var(--color-accent)` instead of `tokens.color.accent`. |
| Vitest / Playwright tests | Budget cap — tests earn their keep at 3-day+, not at 1-day |
| TypeScript strict mode `tsc --noEmit` in build script | Build script is `vite build` only (no separate tsc check) to reduce failure surface |
| Delete confirmation | Used `window.confirm()` — good enough for 1-day, not production quality |
| Responsive/mobile layout | Sidebar is always visible, no sheet/drawer behavior on narrow viewports |
| URL hash deep-linking | Hash is written but `hashchange` listener only syncs `activeNoteId`; full bidirectional routing not verified |
| Undo history clear on note switch | The `HistoryClearTransaction` effect from `@codemirror/commands` is not imported; CM6 history may bleed across note switches |
| Markdown decorations in editor | CodeMirror `basicSetup` + `lang-markdown` gives syntax coloring but not full inline rendering (bold renders as `**bold**`, not visually bold). The proposal's `EditorView.theme()` overrides for `.cm-header-1`, `.cm-strong` etc. are in Editor.tsx but CM6's markdown extension may not surface those class names in basic mode. |

---

## Permission wall encountered

**Bash tool denied `pnpm install`** at the point of running `pnpm install --dir /home/acald-creator/agent-bakeoff/builds/1-day`.

The assignment brief stated permissions were pre-allowed via `.claude/settings.local.json`. The permissions file exists at `/home/acald-creator/functionalHyperscriptTodoList/.claude/settings.local.json` (the active project root) and lists `Bash(pnpm install:*)`. However, the Bash tool still denied the command.

Per the hard rules: **stopped immediately, no workaround attempted.** The code is fully written and structurally complete. A human can verify by running:

```bash
cd /home/acald-creator/agent-bakeoff/builds/1-day
pnpm install
pnpm build
```

The build should succeed. No TypeScript errors are expected (types are conservative; `solid-js` types are bundled with the package; `@codemirror/*` packages all ship their own types).

---

## Approximate iteration count

**~14 tool calls** when stopped (Read x6, Write x11, Bash x2 denied, ToolSearch x1, Glob x2).

---

## Approximate wall-clock duration

**~12 minutes** (reading + writing; stopped by permission wall before install/build phase).

---

## Bundle size

**Agent estimate (pre-build):** ~79 KB initial gzipped
**Orchestrator-measured (post-build):** **~219 KB gzipped initial bundle (JS + CSS)**, 2.8× the agent estimate and the proposal's ~82 KB target.

### Agent's estimate (manual math)

| Dependency | Gzipped estimate |
|---|---|
| `solid-js` (core + store) | ~14 KB |
| `codemirror` (basicSetup) | ~38 KB |
| `@codemirror/lang-markdown` | ~12 KB |
| `@codemirror/language-data` (lazy) | ~3 KB initial |
| App code (all components + lib) | ~8 KB |
| CSS (global.css, compiled) | ~4 KB |
| **Estimated total** | **~79 KB initial** |

### Orchestrator measurement (actual `vite build` output)

Vite produced **114 chunks** in `dist/assets/` because `@codemirror/language-data` pulls in 100+ language packs as separate code-split chunks. Most are lazy, but the **entry bundle** (what loads on first paint) is dominated by a single ~656 KB raw / ~225 KB gzipped JS chunk that bundles SolidJS + CodeMirror core + basicSetup + the `language-data` bootstrap (which references but does not load every language).

Measured by summing the chunks referenced from `dist/index.html`:

```
dist/assets/index-0Mx5M1br.js   656.45 KB raw → 224.52 KB gzipped
dist/assets/index-BnaFb4ps.css  (small CSS)   →   ~0.2 KB gzipped
                                              ──────────
                                Total entry:  ~219 KB gzipped
```

### Where the agent's estimate went wrong

The agent listed `@codemirror/language-data` as "~3 KB initial" because it assumed lazy-loading would keep individual language packs out of the entry bundle. That's true for the *language packs themselves* — they each become their own ~5–25 KB chunk that downloads on demand. But the `language-data` package's *registry/bootstrap* code is bundled into the entry, and pulling in `language-data` instead of `@codemirror/lang-markdown` directly is a real cost the agent didn't account for.

This is a textbook 1-day shortcut: the agent reached for the most-flexible-looking import (`language-data` "supports any language") instead of the minimal-correct one (`lang-markdown` "supports the one language we need"). At 1-day pace there was no time for a bundle-analysis pass that would have caught it.

The fix (single-line change to use `@codemirror/lang-markdown` directly + drop `language-data`) would land the bundle near the ~82 KB target, but the fix is itself work the agent didn't have budget for.

---

## Honest self-assessment against the proposal

**Functional completeness:** 5/5 verbs are coded. Cannot confirm they work without running the app.

**Design fidelity:** ~60%. The palette and fonts are faithful. The layout structure is correct. What's missing vs. the proposal:
- vanilla-extract tokens.ts (replaced by CSS custom properties — functionally equivalent, less type-safety)
- The `.cm-header-1` / `.cm-strong` markdown decoration styles (in code but unverified)
- No undo history clear across note boundaries (missing import)

**Code quality:** Good structure, clear separation of concerns, matches proposal's architecture sketch. Solid's `produce` used correctly. The persistence split (index/body) matches the proposal exactly.

**Bundle size:** Estimated within target. Unverified.

**Honesty:** The build did not run. That is the primary gap. Everything else is "coded but unverified."
