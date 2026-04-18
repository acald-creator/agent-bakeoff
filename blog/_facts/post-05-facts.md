# post-05 facts-only skeleton

*Source material for rewriting "The build-off + 1-day build" (Act 2 rules + first build). NOT for publication.*

---

## What this post must establish

1. Act 2 runs the chosen design (claude-frontend-design) under three time budgets with the same agent configuration.
2. The original plan (agent runs its own builds) broke on three permission walls. Methodology pivoted: orchestrator runs `pnpm install` + `pnpm build` out-of-band; agent writes code self-paced.
3. The 1-day build succeeded on its own terms — but overshot the proposal's ~82 KB bundle target by 2.8× due to a specific import choice.
4. The agent was honest about not having verified its own bundle estimate.

## The Act 2 rules (brief form)

- **Same proposal across all three runs:** claude-frontend-design
- **Same agent configuration:** Claude Sonnet via subagent + `frontend-design` skill
- **Three budgets:** 1-day / 3-day / 1-week
- **Each run gets a fresh subagent context** — no conversation memory between rounds
- **Self-paced** — agent stops when budget runs out, even if features remain
- **No peeking at sibling builds**
- **Honesty in `build-notes.md` is graded**
- Full rules at `blog/act-2-rules.md`

## The methodology pivot (3 permission walls → orchestrator-runs-builds)

Originally: agent runs `pnpm install` + `pnpm build` itself.

Three attempts hit permission walls:
1. First 1-day agent blocked at `pnpm install`
2. Second agent blocked despite explicit permission discussion
3. Third agent blocked despite `.claude/settings.local.json` with allowlist patches (patterns didn't resolve correctly for subagent contexts)

Pivoted methodology:

> **The agent writes code. The orchestrator runs `pnpm install` + `pnpm build` and measures the bundle.**

This is actually a cleaner experiment design:
- Isolates what we're measuring (LLM coding behavior under time pressure) from what we don't care about (build infrastructure friction)
- Bundle-size lens preserved — orchestrator measures from actual `dist/` output
- Tradeoff: agent doesn't get to see its own code run; can inspect but can't run `pnpm build` and watch errors point somewhere

## Budget definitions

| Budget | Wall-clock cap | Iteration cap | Expected ceiling |
|---|---|---|---|
| 1-day | ~30 min | ~25 turns | Working app, polish cut |
| 3-day | ~90 min | ~75 turns | Design system wired, most polish |
| 1-week | ~4 hr | ~150 turns | Proposal as designed |

## The 1-day build — what actually happened

- Agent stopped at **14 iterations in ~12 minutes** (well under the cap)
- Stopped because of the permission wall, not because of budget exhaustion
- **Built clean on first verified build** (vs. Round 1's eventual 3-day and 1-week, both of which failed first build)

### Agent's choices at 1-day

- Framework: SolidJS (consensus with proposal)
- Editor: CodeMirror 6 (kept from proposal)
- State: SolidJS `createStore` + `produce` (from proposal)
- **Styling: Plain CSS with custom properties on `:root` — vanilla-extract DROPPED**
- Tests: None (cut)

Vanilla-extract was the proposal's most distinctive technical pick. Agent dropped it with specific reasoning:

> "Dropped in favor of plain CSS to avoid the extra build plugin and reduce budget risk. Design tokens implemented as CSS custom properties on `:root` instead. The token contract is still the single source of truth; it's just `var(--color-accent)` instead of `tokens.color.accent`."

Defensible 1-day cut — extra build plugin is real risk at 30-min budget; agent disclosed the cut and its reason.

### What survived from the design POV

- Warm aged-paper palette (#F5F0E8 bg, #1A1510 ink, #B8311F red accent)
- Playfair Display for titles (editorial serif)
- Literata for editor body
- 120ms opacity crossfade on note switch

Didn't survive:
- Pulsing animation on dirty-state dot (claimed in notes, not actually in CSS — small honesty gap)
- `.cm-header-1` / `.cm-strong` markdown decorations (referenced, unverified)
- Mobile layout
- Undo-history clear on note switch (CM6 history may bleed across notes)

### What agent shipped (5 verbs)

1. Create a new note
2. Edit a note's body (CodeMirror 6 + `basicSetup` + `@codemirror/lang-markdown`)
3. Auto-save to localStorage (400 ms debounce)
4. Switch between notes (`selectNote(id)` → `createEffect` in editor replaces doc)
5. Filter by search (substring on title + snippet)

## The headline finding — bundle 2.8× over target

- **Agent estimated:** ~79 KB gzipped
- **Orchestrator measured:** 219 KB gzipped
- **Target from proposal:** ~82 KB gzipped

**Root cause:** Agent imported `@codemirror/language-data` (the CodeMirror registry for 100+ language modes) instead of `@codemirror/lang-markdown` (markdown only).

Vite's default code-splitting *did* turn each language pack into its own ~5–25 KB lazy-loaded chunk. But:
- The registry bootstrap code ends up in the entry bundle
- Pulling in `language-data` instead of `lang-markdown` directly costs ~140 KB the agent didn't account for

The proposal specified `lang-markdown` only. Agent's import choice was an active deviation.

This is a textbook 1-day shortcut:

> Agent reached for the most-flexible-looking import (`language-data` "supports any language") instead of the minimal-correct one (`lang-markdown` "supports the one language we need").

At 1-day pace, no time for a bundle-analysis pass. One-line fix (swap import) would land bundle near target — but the fix is itself work the agent didn't have budget for.

## The honesty check

Agent self-assessed bundle as "estimated within target. Unverified."

- Three words, clearly-disclosed
- The *estimate* was wrong (actual 2.8× over)
- The *structure* of the disclosure was correct — agent correctly flagged that it didn't know

**At 1-day budget, the agent was honest partly because 14 iterations doesn't give you room to develop false confidence.**

## Clean summary of 1-day state

- **Works:** compiles, runs, 5 verbs operate, auto-save persists, aesthetic recognizable
- **Doesn't work:** bundle 2.8× over target, undo bleeds, no mobile layout, markdown decorations unverified, dirty-dot "pulse" doesn't exist
- **Grade against "stop at budget":** stopped at 14/25 iterations because of external wall, not because budget ran out

## What's next (preview)

- Post 6: 3-day and 1-week — 3-day doesn't compile; 1-week compiles (after orchestrator rename) at 533 KB (2.4× *worse* than 1-day)
- Post 7: what this means — budget curve is not monotonic in quality

## What the current post does that's load-bearing

- Tells the methodology-pivot story in place (not buried in rules doc)
- Shows the agent's cuts list and reasoning as a table (so reader can see what was traded)
- Names the specific import mistake with concrete bundle numbers
- Ends with the "11-iteration delta" teaser for post 6

## What the current post does that's NOT load-bearing (drop freely)

- The "Act 2 starts here" preamble
- Repeated "as the brief specified" name-checking
- Long quote from `build-notes.md` near the end
- The "hold on to that" teaser phrasing

## Numbers / specifics worth landing somewhere

- 3 permission walls before methodology pivot
- Budget: 30 min wall-clock, 25 iterations
- Actual: 14 iterations, ~12 min (wall, not budget)
- Bundle estimated: 79 KB. Measured: 219 KB. Target: 82 KB. Overshoot: 2.8×
- Cause: imported `@codemirror/language-data` instead of `@codemirror/lang-markdown`
- 5 functional verbs shipped
- 8 items in agent's disclosed cut list

## Hook the current prose uses (for reference)

Current opener: "The verdict post picked claude-frontend-design as the proposal we'd build in Act 2 — not because it scored highest..." Recap-then-context AI-rhythm. Find your own on-ramp — maybe start with the methodology pivot moment, or the 2.8× bundle overshoot, or the "stopped at 14 not 25" honesty.
