# agent-bakeoff

A multi-agent comparative study. Take a frozen 2022 codebase as a complexity reference, ask several AI agents to independently propose a 2026 rebuild of a different (more interesting) app, then build the chosen design under three time budgets — **twice**, once without feedback and once with.

The comparison is the content. Different agents pick different frameworks, different state strategies, different build tools, different editor libraries — and reading the proposals side-by-side is more revealing than any single rebuild would be.

## Series at a glance

- **10 blog posts** in [blog/](blog/) — posts 0 through 9
- **8 agent proposals** in [proposals/](proposals/) across 6 model families
- **2 rounds of Act 2** (write-only + instrumented) in [builds/](builds/) and [builds-instrumented/](builds-instrumented/) with per-build orchestrator notes
- **Frozen 2022 baseline** in [baseline/](baseline/) — the anchor for the carryover questions

## Reading order

### Act 1 — the design-off

1. [Why an agent bakeoff](blog/post-00-why-an-agent-bakeoff.md) — the framing
2. [What's in the box](blog/post-01-whats-in-the-box.md) — the 2022 baseline tour
3. [The brief](blog/post-02-the-brief.md) — the prompt every agent received + the four iterations it took
4. [The proposals](blog/post-03-the-proposals.md) — the four original agent proposals on their own terms
5. [The verdict](blog/post-04-the-verdict.md) — comparison matrix + the chosen design

### Act 2 — the build-off

6. [The build-off + 1-day build](blog/post-05-build-off-day-1.md) — rules + 1-day write-only result
7. [3-day vs 1-week](blog/post-06-build-off-3-day-vs-1-week.md) — the two longer budgets
8. [What time pressure does to LLM code](blog/post-07-what-time-pressure-does.md) — Round 1 meta-takeaways, non-monotonic budget curve
9. [Act 2, again — with feedback](blog/post-08-act-2-instrumented.md) — Round 2 (instrumented), the sweet-spot refinement

### Round 3 — slate expansion

10. [Slate expansion](blog/post-09-slate-expansion-round-3.md) — expanding from 4 to 8 agents across 6 model families; portability, depth vs schema, operational risks

## The final slate (8 agents, 6 model families)

| Slot | Family | Framework | Editor | Hyperscript | Functional | Bundle (est.) | Collab v1 |
|---|---|---|---|---|---|---|---|
| [claude-opus-main](proposals/claude-opus-main/) | Anthropic frontier | Inferno 8 | CodeMirror 6 | **Kept** | Kept | ~75 KB | Yes |
| [claude-sonnet-plan](proposals/claude-sonnet-plan/) | Anthropic frontier | SolidJS | CodeMirror 6 | Dropped | Kept | ~90–100 KB | Yes |
| [claude-frontend-design](proposals/claude-frontend-design/) | Anthropic frontier + skill | SolidJS | CodeMirror 6 | Dropped | Partial | ~82 KB | Yes |
| [claude-haiku-4-5](proposals/claude-haiku-4-5/) | Anthropic fast | SvelteKit 5 | CodeMirror 6 | Dropped | Dropped | ~54 KB | Yes |
| [codex](proposals/codex/) | OpenAI (GPT-5 via Codex CLI) | Mithril | `textarea` + micromark | **Kept** | Partial | ~37 KB | No |
| [gemini-3-1](proposals/gemini-3-1/) | Google (Gemini 3.1 Pro) | SolidJS + `solid-js/h` | CodeMirror 6 | **Kept** | Partial | ~65 KB | Yes |
| [qwen-25-coder](proposals/qwen-25-coder/) | Alibaba open-weight (via Ollama) | SolidJS + TanStack Query | CodeMirror 6 | Dropped | Partial | ~65 KB | No |
| [devstral](proposals/devstral/) | Mistral coding-specialized | SolidJS 2.0 *(speculative)* | Lexical | Dropped | Partial | ~56 KB | No |

## What the series actually found

### Act 1 — how four agents split on an open brief
- **Editor library consensus (3/4 → 6/8 final): CodeMirror 6**
- **Hyperscript carryover: 3 kept / 5 dropped** — aligned more with model family than framework
- **Bundle range 37–100 KB** — driven by editor-library choice, not framework
- **Most opinionated proposal came from the one non-Claude agent** (codex: "a plain textarea is the right editor library choice for v1")

### Act 2 Round 1 — the non-monotonic budget curve
- 1-day builds clean (219 KB, honest-about-unverified)
- 3-day doesn't build (three independent API mistakes the agent couldn't see)
- 1-week builds after orchestrator rename; bundle 2.4× *worse* than 1-day
- **Within write-only methodology, iteration headroom without verification headroom produces strictly worse outcomes** — full writeup in [post 7](blog/post-07-what-time-pressure-does.md)

### Act 2 Round 2 — the sweet-spot refinement
- 1-day instrumented: 236 KB, vanilla-extract kept
- 3-day instrumented: 216 KB, smaller than 1-day, all polish features shipped
- 1-week instrumented: doesn't build in 4 rounds (vanilla-extract scoping error resistant to round-by-round feedback)
- **Feedback loop helps most at a middle budget, not linearly** — full writeup in [post 8](blog/post-08-act-2-instrumented.md)

### Round 3 — slate expansion findings
- The bakeoff's CLI invocation pattern is genuinely model-portable (Codex CLI → Gemini CLI → Ollama-local → Mistral API all worked)
- **Schema compliance is a floor; proposal *depth* is the signal** — Qwen and Devstral both hit all 11 headers but with 1,000-word proposals vs frontier models' 2,000–2,500 words
- Smaller / older models pick "trendy and shallow" over "engaged and specific"
- **Diminishing returns on slate surprise above 6–8 agents**
- Operational risks: model ID churn, subagent permission walls, API keys ≠ API access (billing-gate errors look like rate-limit errors) — full writeup in [post 9](blog/post-09-slate-expansion-round-3.md)

## The brief, condensed

A single-user markdown notes editor that could plausibly become collaborative.

- **Hard constraints:** deployable as static or edge-runtime only, SPA UX, modern toolchain (Node 20+), exact output schema
- **Required carryovers:** hyperscript-over-JSX and functional-programming approach — kept / dropped / partial with specific reasoning
- **Required output:** an 11-section proposal document (1,500–2,500 words), plus optional supporting files
- **Optional bonus:** a 200–400 word collab sync sketch

Full brief at [blog/the-brief.md](blog/the-brief.md) (v1.4 — the shipped version).

## Directory structure

```
agent-bakeoff/
├── baseline/                     # Frozen Jan 2022 Inferno+Redux+Hyperscript todo
├── blog/
│   ├── index.md                  # Changelog / working document
│   ├── the-brief.md              # v1.4 — the actual prompt sent to every agent
│   ├── act-2-rules.md            # Operational rules for the build-off phase
│   ├── slate-research-2026-04.md # Research on which models to add in Round 3
│   └── post-00 … post-09.md      # Ten-post series
├── proposals/                    # 8 agent proposals
│   ├── claude-opus-main/
│   ├── claude-sonnet-plan/
│   ├── claude-frontend-design/
│   ├── claude-haiku-4-5/
│   ├── codex/
│   ├── devstral/
│   ├── gemini-3-1/
│   ├── qwen-25-coder/
│   └── _archive/                 # Pilot iterations of the brief (v1.2, v1.3)
├── builds/                       # Act 2 Round 1 (write-only)
│   ├── 1-day/, 3-day/, 1-week/
│   └── _archive/                 # Permission-blocked early attempts
└── builds-instrumented/          # Act 2 Round 2 (orchestrator-driven feedback)
    ├── _template/                # Pre-installed scaffold used for each budget
    └── 1-day/, 3-day/, 1-week/
```

Every build directory in `builds/` and `builds-instrumented/` has:
- the agent's source files
- `build-notes.md` — the agent's self-report
- `orchestrator-notes.md` — what was observable from outside the agent's perspective, including any fixes the orchestrator made to enable measurement

## Status

| Phase | Status |
|---|---|
| Act 1 — design-off, original 4 agents | ✅ |
| Act 1 — verdict + posts 0–4 | ✅ |
| Act 2 Round 1 — write-only (3 builds) | ✅ |
| Act 2 Round 1 — writeup (posts 5, 6, 7) | ✅ |
| Act 2 Round 2 — instrumented (3 builds) | ✅ (1-week partial: builds clean via orchestrator intervention but doesn't produce `dist/` cleanly) |
| Act 2 Round 2 — writeup (post 8) | ✅ |
| Round 3 — slate expansion to 8 agents | ✅ |
| Round 3 — writeup (post 9) | ✅ |
| Round 4 — Kimi K2.5 | ⏸ deferred (Moonshot account requires prepaid credits) |
| Act 2 Round 3 — instrumented with expanded slate | ⏸ not attempted |

## Running your own

The bakeoff format is reusable. Three things to know if you want to run one:

- **The brief needs to be unambiguous.** v1.0 of this series' brief had three structural ambiguities that were only discovered by running a pilot agent against it. A brief that seems clear to its author is almost certainly ambiguous to a fresh agent — pilot before fanning out.
- **Schema headers aren't depth.** Include required per-section reasoning ("kept / dropped / partial **with specific reasoning**") to force real engagement rather than one-sentence replies.
- **Orchestrator-in-main-thread is the reliable workaround** for subagent permission issues. Expect to do install / build / measurement yourself rather than trusting subagents to do it on their own.

See [post 9](blog/post-09-slate-expansion-round-3.md) for the fullest set of "running your own" advice.

## License

Code in `baseline/` retains its original MIT license (Leonardo Saracini, 2022). Blog posts and proposals are released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) unless otherwise noted in individual files.

## Acknowledgments

The 2022 baseline is [Leonardo Saracini's functionalHyperscriptTodoList](https://github.com/lesar/hyperscriptTodoList-like). The bakeoff uses it as a complexity reference; no modernization-in-place claims are made about that codebase.

Every agent in the slate is identified by model ID and snapshot where possible — see [post 9's "Model ID churn is real-time" section](blog/post-09-slate-expansion-round-3.md) for why that matters and the limitations of model-ID pinning as the landscape moves.
