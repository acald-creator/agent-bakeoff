# agent-bakeoff

A multi-agent comparative study. Take a frozen 2022 codebase as a complexity reference, ask several AI agents to independently propose a 2026 rebuild of a different (more interesting) app, then build the chosen design under three time budgets.

The comparison is the content. Different agents pick different frameworks, different state strategies, different build tools, different editor libraries — and reading the proposals side-by-side is more revealing than any single rebuild would be.

## Structure

- **[blog/](blog/)** — the 8-post blog series, the working brief, and the index.
- **[proposals/](proposals/)** — the four agent proposals (one directory each), plus archived pilot iterations.
- **[baseline/](baseline/)** — frozen snapshot of the original `functionalHyperscriptTodoList` (Inferno + Redux + Hyperscript, last touched Jan 2022). Used as a complexity reference and the source of carryover questions in the brief.

## Reading order

1. [Why an agent bakeoff](blog/post-00-why-an-agent-bakeoff.md) — framing
2. [What's in the box](blog/post-01-whats-in-the-box.md) — the 2022 baseline tour
3. [The brief](blog/post-02-the-brief.md) — the prompt every agent received and the four iterations it took
4. [The proposals](blog/post-03-the-proposals.md) — all four agent outputs on their own terms
5. [The verdict](blog/post-04-the-verdict.md) — comparison matrix + the chosen design
6. *Build-off + 1-day build* — pending Act 2
7. *3-day vs 1-week* — pending Act 2
8. *What time pressure does to LLM code* — pending Act 2

## The agent slate

Four slots, each with a stated value and disclosed independence level. See the brief for the full setup.

| Slot | Lens | Independence |
|---|---|---|
| **Codex** (via Codex CLI) | Different model family | High — fresh subagent |
| **Claude Sonnet** (via Plan subagent) | Planning-first | High — fresh subagent |
| **Claude Opus** (main-thread) | Informed insider | Low — disclosed |
| **Claude + frontend-design skill** | UX-first | Medium — fresh subagent + skill bias |

## The brief, condensed

A single-user markdown notes editor that could plausibly become collaborative.

- **Hard constraints:** deployable as static or edge-runtime only, SPA UX, modern toolchain (Node 20+), exact output schema.
- **Required carryovers:** hyperscript-over-JSX and functional-programming approach. Kept / dropped / partial — with specific reasoning either way.
- **Required output:** an 11-section proposal document (1,500–2,500 words), plus optional supporting files.
- **Optional bonus:** a 200–400 word collab sync sketch.

The full brief is at [blog/the-brief.md](blog/the-brief.md) (currently v1.4).

## Status

| Phase | Status |
|---|---|
| Act 1 — design-off (4 proposals) | ✅ complete |
| Act 1 — verdict drafted | ✅ complete (chosen: claude-frontend-design for build-off, codex as runner-up) |
| Posts 0–4 drafted | ✅ |
| Act 2 — build-off (3 time budgets, same agent) | ⏸ pending |
| Posts 5–7 | ⏸ pending Act 2 |

## License

Code in `baseline/` retains its original MIT license (Leonardo Saracini, 2022). Blog posts and proposals are released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) unless otherwise noted in individual files.
