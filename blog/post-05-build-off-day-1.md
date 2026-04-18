# The Build-Off + 1-Day Build — Post 5

*Act 2 starts here. Same chosen design, three different time budgets, same agent across all three. This post is the rules and the first build.*

---

The verdict post picked [claude-frontend-design](../proposals/claude-frontend-design/README.md) as the proposal we'd build in Act 2 — not because it scored highest on the brief's evaluation lenses (codex did), but because it had the most *polish surface* for a time-pressure comparison to show. Editorial typography, custom design tokens, vanilla-extract type system, considered motion — places where "1-day" and "1-week" would produce visibly different artifacts.

The three-build plan was straightforward: same proposal, same agent configuration (Claude Sonnet subagent + the `frontend-design` skill), same fresh context for each run, three different self-paced time budgets. Then compare.

That plan survived first contact. The first-order results did not.

## The Act 2 rules, briefly

The full rules live at [act-2-rules.md](act-2-rules.md). The compressed version:

- **Same proposal, same agent, three budgets** (1-day / 3-day / 1-week)
- **Self-paced** — budgets are caps, not floors. The agent stops when it runs out, even if features remain.
- **Independent runs, no peeking** — each agent gets a fresh subagent context with no memory of sibling builds. Orchestrator doesn't intervene mid-run.
- **Honesty in `build-notes.md` is graded.** The agent writes what it did, what it cut, and a self-assessment. Inflated claims hurt the comparison post.

The original plan had the agent run `pnpm install` and `pnpm build` itself — verify its own work, measure its own bundle. That plan broke.

## The methodology pivot

The first 1-day agent hit a Bash permission wall on `pnpm install`. So did the second. So did the third — even after I wrote `.claude/settings.local.json` with explicit allow rules for `pnpm install`, `pnpm run`, `pnpm build`, `vite`, `tsc`, and every other toolchain command the agent could plausibly need. The permission system resolves against the active session's primary project directory, and the primary project was elsewhere in my workspace. Subagents inherited the wrong scope.

Rather than continue iterating on the permission setup (which would have delayed Act 2 indefinitely), I pivoted the methodology:

> **The agent writes code. The orchestrator runs `pnpm install` + `pnpm build` and measures the bundle.**

This is actually a cleaner experiment design than the original. It isolates what we're trying to measure (LLM coding behavior under time pressure) from what we don't care about (build infrastructure friction). The bundle-size lens is preserved — the orchestrator measures it from the actual `dist/` output, the way the brief defined.

The tradeoff is the agent doesn't get to *see* its own code run. It can inspect what it wrote, reason about it, spot-check line-by-line — but it can't run `pnpm build` and watch where the errors point. That tradeoff will matter a lot over the next two posts.

Each build directory ends up with two notes files:
- `build-notes.md` — the agent's self-report. What got built, what got cut, self-assessment.
- `orchestrator-notes.md` — what the orchestrator did out-of-band. What install broke, what the measured bundle actually was, what was visible from outside the agent's perspective.

Both are committed. Together they're the primary source for this post and the two that follow.

## The 1-day budget

- **Wall-clock cap:** ~30 minutes
- **Iteration cap:** ~25 tool calls
- **Expected ceiling:** working app, cut polish. Five functional verbs work; visual aesthetic is suggested, not fully realized.

The 1-day agent stopped at **14 iterations in ~12 minutes.** Well under the cap. It stopped because it hit the (correctly-diagnosed) permission wall trying to verify its own build — and by design, it didn't attempt workarounds. Per the rules: hit a wall, stop, document.

## What the agent picked

Stack at 1-day:

| Layer | Choice | vs. proposal |
|---|---|---|
| Framework | SolidJS 1.9 | same |
| Editor | CodeMirror 6 | same |
| State | SolidJS `createStore` + `produce` | same |
| Styling | **Plain CSS with custom properties on `:root`** | **vanilla-extract dropped** |
| Design tokens | CSS custom properties | in-place substitute for typed tokens |
| Build | Vite 6 | same |
| Tests | None | cut |

Vanilla-extract was the proposal's single most distinctive technical pick — typed CSS-in-JS that compiles to static stylesheets and makes design tokens first-class TypeScript values. The agent cut it. The rationale in `build-notes.md`:

> Dropped in favor of plain CSS to avoid the extra build plugin and reduce budget risk. Design tokens implemented as CSS custom properties on `:root` instead. The token contract is still the single source of truth; it's just `var(--color-accent)` instead of `tokens.color.accent`.

That's a defensible 1-day cut. "Extra build plugin" is real risk at a 30-minute budget; a single plugin mis-configuration costs you the whole run. And the cut is honest — the agent disclosed it, named the tradeoff, and moved on.

What it kept, in the design-POV department:
- Warm aged-paper palette (`#F5F0E8` background, `#1A1510` ink, `#B8311F` red accent)
- Playfair Display for titles (editorial serif)
- Literata for the editor body (long-form reading serif)
- DM Sans for UI chrome
- A dirty-state indicator (a red border accent on the active note, no pulsing animation despite the notes claiming one)
- A 120 ms opacity crossfade on note switch
- No topnav, no modal dialogs — "maximum negative space"
- CodeMirror gutter hidden (no line numbers) for a cleaner writing surface

The visual character is recognizable. Not fully realized — there's no pulsing animation on the dirty dot, the `.cm-header-1` and `.cm-strong` markdown decorations are referenced in the editor theme but unverified, the mobile layout is cut — but recognizable.

## What the agent shipped

All five functional verbs implemented in code:

1. Create a new note (`createNote()` in `store.ts`, wired to a "+ New note" button and an empty-state button)
2. Edit a note's body (CodeMirror 6 with `basicSetup` + `@codemirror/lang-markdown`)
3. Auto-save to localStorage (400 ms debounce, split index/body persistence)
4. Switch between notes (`selectNote(id)` → `createEffect` in Editor replaces the document)
5. Filter by search (substring match on title + snippet)

The architecture follows the proposal's two-trace test:
- **"Save an edit to a note"** — keystroke → `oninput` handler → `editBody({ id, body })` → reducer → debounced localStorage subscriber writes after 250–400 ms idle. Sidebar re-renders with updated "2s ago" timestamp; editor doesn't remount.
- **"Switch to a different note"** — sidebar click → `selectNote(id)` → reducer sets `activeId` → `createEffect` on `activeId` change → fetch body from storage → CodeMirror dispatches a `changes` transaction to replace the doc. No teardown.

Clean execution. At 1-day budget, this is what "done enough to ship" looks like.

## What the agent cut, with reasons

From `build-notes.md`:

| Cut | Reason given |
|---|---|
| vanilla-extract | "Extra build plugin, reduce budget risk." |
| Vitest / Playwright tests | "Budget cap — tests earn their keep at 3-day+, not at 1-day." |
| `tsc --noEmit` in the build script | "Reduce failure surface." (Build is `vite build` only.) |
| Confirmation dialog for delete | "`window.confirm()` — good enough for 1-day, not production." |
| Responsive / mobile layout | "Sidebar always visible, no sheet/drawer on narrow viewports." |
| URL hash deep-linking | "Hash is written but `hashchange` listener only syncs `activeNoteId`; full bidirectional routing unverified." |
| Undo-history clear on note switch | "`HistoryClearTransaction` effect not imported; CM6 history may bleed across notes." |
| Markdown visual decorations | "Referenced in `EditorView.theme()` but CM6's markdown extension may not surface those class names in basic mode." |

Eight cuts, each with a reason that is either "time" or "risk." The last four are design-affecting — undo-history bleed and unverified markdown decorations are real UX defects. The agent names them. This is the kind of disclosure the brief's honesty lens rewards.

## The headline finding: 219 KB gzipped

The agent estimated **~79 KB gzipped** based on manual dependency math.

The orchestrator measured **219 KB gzipped** on the actual entry bundle. **2.8× larger than the agent's estimate.** Also 2.7× the proposal's ~82 KB target.

Where did the 140 KB come from?

The agent imported `@codemirror/language-data` — the CodeMirror registry for 100+ language modes. Vite's default code-splitting *did* turn each individual language pack into its own ~5–25 KB lazy-loaded chunk. But the registry bootstrap code is in the entry bundle. And pulling in `language-data` instead of `@codemirror/lang-markdown` directly is a real cost the agent didn't account for.

The proposal specified `@codemirror/lang-markdown` only. The agent's import choice was an active deviation, not a faithful execution.

This is a textbook 1-day shortcut:

> The agent reached for the most-flexible-looking import (`language-data` "supports any language") instead of the minimal-correct one (`lang-markdown` "supports the one language we need").

At 1-day pace there was no time for a bundle-analysis pass that would have caught it. The one-line fix (remove `language-data`, keep `lang-markdown`) would land the bundle near the target. But the fix is itself work the agent didn't have budget for — because it didn't see the bundle size was wrong until the orchestrator measured it.

## The honesty gap

The 1-day agent self-assessed its bundle as "estimated within target. Unverified." Three words, clearly-disclosed.

That sentence is much more accurate than it was trying to be. The estimate wasn't within target — it was 2.8× over. But the *structure* of the disclosure ("unverified") is what saves it from being a bad disclosure. The agent correctly flagged that it didn't know; it just happened to be wrong about what it would measure.

This is a template we'll see hold less well at higher budgets. When the agent spends more time on the code, it starts to *feel* like more verification is happening — even when it isn't. The 1-day agent was honest partly because 14 iterations doesn't give you room to develop confidence.

## What "1-day" actually produced

Put plainly:

- **Works:** the code compiles and runs. Five verbs operate. Auto-save persists. The aesthetic is recognizable.
- **Doesn't work:** bundle is 2.8× over target. Undo history bleeds across notes. Mobile layout doesn't exist. Markdown visual decorations aren't wired. Dirty-state "pulsing" animation is in the notes but not in the CSS.
- **Grade against "stop when budget is gone":** the agent stopped at 14/25 iterations because of the permission wall. Without the wall, it would have had 11 more iterations of runway.

That 11-iteration delta will come up again. Hold onto it.

## What's next

Posts 6 and 7 cover the 3-day and 1-week builds, and then what the whole three-build arc means for how LLMs produce code under time pressure. The short version of the preview:

- **The 3-day build doesn't compile.**
- **The 1-week build compiles (after an orchestrator fix) with a bundle 2.4× *worse* than the 1-day build's bundle.**
- **Budget curve is not monotonic in quality.**

That's the actual finding of Act 2. The rest of the series is the evidence for it.

---

*Series: Post 5 of 8. Previous: [The Verdict](post-04-the-verdict.md). Next: [3-Day vs 1-Week](post-06-build-off-3-day-vs-1-week.md).*

*Full 1-day artifact: [builds/1-day/](../builds/1-day/) — agent's source files, `build-notes.md`, and `orchestrator-notes.md`.*
