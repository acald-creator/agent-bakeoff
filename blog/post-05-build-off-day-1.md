# The Build-Off + 1-Day Build

Chosen design: `claude-frontend-design`. Same agent configuration (Claude Sonnet via subagent + `frontend-design` skill). Fresh context for each run. Three budgets — 1-day, 3-day, 1-week.

The original plan had the agent run its own `pnpm install` and `pnpm build`. Three permission walls killed that. Subagent permission scopes don't resolve cleanly against the primary project's settings. I patched `.claude/settings.local.json` with explicit allowlist patterns. Didn't help. Third try hit the same wall.

Rather than keep iterating on the permission setup, I pivoted.

> The agent writes code. The orchestrator runs `pnpm install` + `pnpm build` and measures the bundle.

A cleaner experiment design. It isolates what we're measuring (LLM coding behavior under time pressure) from what we don't care about (build infrastructure friction). The bundle-size lens is preserved. The orchestrator measures from the actual `dist/` output. The tradeoff is the agent can't see its own code run. It can inspect, reason about, spot-check, but can't run `pnpm build` and watch where errors point. That tradeoff matters in the next two posts.

## The rules

- Same proposal across all three runs (`claude-frontend-design`).
- Same agent configuration. Claude Sonnet via subagent + `frontend-design` skill.
- Fresh context per run. No memory between rounds.
- Self-paced. Budget is a cap, not a floor. Stop when it runs out, even if features remain.
- No peeking at sibling builds.
- Honesty in `build-notes.md` is graded.

Full rules at [blog/act-2-rules.md](https://github.com/acald-creator/agent-bakeoff/blob/main/blog/act-2-rules.md).

## Budget definitions

| Budget | Wall-clock cap | Iteration cap | Expected ceiling |
|---|---|---|---|
| 1-day | ~30 min | ~25 turns | Working app, polish cut |
| 3-day | ~90 min | ~75 turns | Design system wired, most polish |
| 1-week | ~4 hr | ~150 turns | Proposal as designed |

## The 1-day build

The agent stopped at 14 iterations in 12 minutes. Well under the cap. It stopped because of a permission wall during its own read-the-build-output check, not because of budget exhaustion. By design, it didn't attempt workarounds. Hit a wall, stop, document.

Built clean on the first verified build. The visible delta vs what happens at 3-day and 1-week.

### What the agent picked

| Layer | Choice | vs proposal |
|---|---|---|
| Framework | SolidJS 1.9 | same |
| Editor | CodeMirror 6 | same |
| State | SolidJS `createStore` + `produce` | same |
| Styling | Plain CSS + CSS custom properties on `:root` | vanilla-extract dropped |
| Tests | None | cut |
| Build | Vite 6 | same |

Vanilla-extract was the proposal's most distinctive technical pick. Typed CSS-in-JS, design tokens as first-class TypeScript values. The agent dropped it with specific reasoning. From `build-notes.md`:

> Dropped in favor of plain CSS to avoid the extra build plugin and reduce budget risk. Design tokens implemented as CSS custom properties on `:root` instead. The token contract is still the single source of truth; it's just `var(--color-accent)` instead of `tokens.color.accent`.

A defensible 1-day cut. Extra build plugin is real risk at a 30-minute budget. Plugin misconfiguration costs you the whole run. The cut is honest. Disclosed, reasoned, moved on.

### What survived from the design POV

- Warm aged-paper palette (`#F5F0E8` background, `#1A1510` ink, `#B8311F` red accent)
- Playfair Display for titles (editorial serif)
- Literata for editor body
- 120 ms opacity crossfade on note switch

What didn't survive:

- Pulsing animation on the dirty-state dot (claimed in notes, not in CSS — a small honesty gap)
- `.cm-header-1` / `.cm-strong` markdown decorations (referenced, unverified)
- Mobile layout
- Undo-history clear on note switch (CM6 history may bleed across notes)

### Five verbs shipped

1. Create a new note.
2. Edit a note's body. CodeMirror 6 + `basicSetup` + `@codemirror/lang-markdown`.
3. Auto-save to localStorage. 400 ms debounce.
4. Switch between notes. `selectNote(id)` → `createEffect` in editor replaces doc.
5. Filter by search. Substring on title + snippet.

## The headline finding

Agent estimated ~79 KB gzipped. Orchestrator measured 219 KB gzipped. Target from the proposal: ~82 KB.

2.8x over target. Root cause: the agent imported `@codemirror/language-data` (the CodeMirror registry for 100+ language modes) instead of `@codemirror/lang-markdown` (markdown only).

Vite's default code-splitting did turn each language pack into its own ~5–25 KB lazy-loaded chunk. But the registry bootstrap code ends up in the entry bundle. And pulling in `language-data` instead of `lang-markdown` directly costs about 140 KB the agent didn't account for.

The proposal specified `lang-markdown` only. The agent's import choice was an active deviation.

A textbook 1-day shortcut. The agent reached for the most-flexible-looking import (`language-data` "supports any language") instead of the minimal-correct one (`lang-markdown` "supports the one language we need"). At 1-day pace there was no time for a bundle-analysis pass that would have caught it. The one-line fix (swap the import) would land the bundle near target. But the fix is itself work the agent didn't have budget for, because it didn't see the bundle was wrong until the orchestrator measured it.

## The honesty check

The agent self-assessed its bundle as "estimated within target. Unverified."

Three words, clearly disclosed. The estimate was wrong (actually 2.8x over). The structure of the disclosure was correct. The agent flagged that it didn't know. It was right about that.

At 1-day budget, the agent was honest partly because 14 iterations doesn't give you room to develop false confidence.

## 1-day summary

- Works. Compiles, runs, 5 verbs operate, auto-save persists, aesthetic recognizable.
- Doesn't work. Bundle 2.8x over target, undo bleeds, no mobile layout, markdown decorations unverified, dirty-dot pulse doesn't exist.
- Grade against "stop at budget": the agent stopped at 14 of 25 iterations because of an external wall, not because budget ran out. Eleven iterations of runway unused.

That 11-iteration delta comes back in post 6.

Full 1-day artifact: [builds/1-day/](https://github.com/acald-creator/agent-bakeoff/tree/main/builds/1-day). Agent source, `build-notes.md`, `orchestrator-notes.md`.

Next: [3-Day vs 1-Week](post-06-build-off-3-day-vs-1-week.md).
