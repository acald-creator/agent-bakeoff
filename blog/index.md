# Blog Series — Modernizing a 2022 Inferno Todo with Multi-Agent Assessments

> Working document. Lives in the `agent-bakeoff` repo (private, under acald-creator GitHub).

## New repo

**Name:** `agent-bakeoff` — multiple agents, same brief, judged side-by-side. Generic enough to host future rounds against different baselines.

**Layout:** Each agent's proposal lives at `proposals/<agent>/` in the same repo. One tree, one `git log`, easy side-by-side diffs. Per-agent attribution comes from the directory name and a `proposals/<agent>/README.md` header (model, date, prompt version).

**Deploy:** Every proposal gets a preview URL so readers can click through and compare actual UX, not just code. Target free static/edge hosting (Cloudflare Pages, Vercel, or Netlify). This adds a hard constraint to the brief: each proposal must be deployable as static / edge-runtime — no per-proposal backend. That keeps the comparison fair and the cost near-zero.

## Premise

Use a frozen 2022 codebase — Inferno + Redux + Hyperscript + Webpack 5 — as a **complexity reference**, then ask several AI agents, independently, how they would build a different, more interesting 2026 app of similar weekend scope: a **single-user markdown notes editor that could plausibly become collaborative**. The interesting artifact is **the comparison**, not the rebuild. Different agents will pick different frameworks, different editor libraries, different state strategies, different build tools, and reason about tradeoffs differently. Reading those side-by-side is the content.

The pivot away from todo-rebuild is deliberate: a markdown editor surfaces the editor-library decision (CodeMirror / ProseMirror / TipTap / Monaco / Lexical / textarea) as a real architectural choice, and the optional "collab sync sketch" gives agents room to flex without forcing every proposal to deal with sync stacks.

## Baseline (this repo)

The baseline is a **complexity reference**, not a literal starting point — agents are building a different app (a markdown editor, see Premise above). Post 1 ("What's in the box") tours it as the "where we came from" context, not as the thing being rebuilt.

- **Last commit:** Jan 2022 (`a03ba2f`)
- **Stack:** TypeScript 4.5, Inferno 7, Redux 4, Hyperscript + `inferno-hyperscript`, `type-to-reducer`, `rambda`, `list`, Webpack 5
- **Pinned to** Node 9.11.1 (will not run on a modern toolchain without intervention)
- **Code:** ~15 small TS files in [src/](src/) — classic todo: add / edit / toggle / delete / filter
- **Original author:** Leonardo Saracini; this fork has been kept primarily as a learning artifact

The baseline stays untouched. Its dated-ness is part of the story.

## Series shape — two-act bakeoff

**Act 1 — Design-off:** 4 agents, same brief, propose a rebuild.
**Act 2 — Build-off:** 1 chosen design, 3 time budgets, same agent across all three. Observe what time pressure does to code — does the agent cut corners under pressure, over-engineer under abundance, or find a sweet spot?

| # | Act | Working title | Notes |
|---|---|---|---|
| 0 | — | "Why an agent bakeoff" | Framing post — the premise, why these agents, why now. Lets cold readers land without prior context. |
| 1 | — | "What's in the box" | Walk the 2022 baseline as-is. Why these choices made sense then. |
| 2 | 1 | "The brief" | The prompt every agent gets. |
| 3 | 1 | "The proposals" | Single mega-post — one section per agent, each with its plan, reasoning, and what's surprising. |
| 4 | 1 | "The verdict" | Comparison matrix + chosen design. The comparison *is* the case for the choice. |
| 5 | 2 | "The build-off + 1-day build" | Rules of Act 2 + the first build attempt. |
| 6 | 2 | "3-day vs 1-week" | The longer budgets, side-by-side with the 1-day. |
| 7 | 2 | "What time pressure does to LLM code" | Meta-takeaways from the whole series. |

### Act 2 rules (locked)

- **Same agent across all three budgets** — isolates the time variable cleanly.
- **Time budget = wall-clock cap + iteration cap + autonomous loop.** The agent runs itself; we observe the trajectory. Most realistic surface for shortcut/rigor behavior.
- **Budget calibration TBD** — "1 day / 3 day / 1 week" are labels, not literal wall-clock. Concrete minutes/iterations will be set once the app is chosen, since a collaborative editor and a todo are very different problems.
- **Which agent builds Act 2** — TBD, picked after Act 1 verdict (likely the winning proposal's author).

**Publishing note:** Order of publishing ≠ order of work. Posts 0, 1, 2 (framing, baseline, brief) can ship while proposals are still being collected. No fixed cadence yet.

## Agents to brief

Locked slate of 4. Each agent gets **the same brief** so differences are about reasoning, not inputs. Slate deliberately mixes two axes (different models *and* different lenses) — disclosed to readers as "design-space survey," not controlled experiment.

| Agent | Lens | Independence | Notes |
|---|---|---|---|
| **Codex** (via `codex:rescue` plugin) | Different model family | High — fresh subagent | Cleanest "second opinion" signal |
| **Claude Sonnet** (via `Plan` subagent) | Planning-first | High — fresh subagent, no orchestration context | |
| **Claude Opus** (main-thread, this conversation) | Full orchestration context | Low — disclosed | The "informed insider" perspective; post should name this honestly |
| **Claude + `frontend-design` skill** (subagent invocation) | UX-first | Medium — fresh subagent + skill bias | The only agent explicitly steered toward design |

The "no-framework / vanilla web components" slot was dropped: that's a brief variation, not a different agent. If interesting, can be a follow-up round.

## The brief

Drafted at [the-brief.md](the-brief.md) (v1, 2026-04-18). Covers: the ask, baseline summary, feature parity scope, hard constraints (deployable-as-static, modern toolchain, fixed output format), open choices (framework / state / build / styling / language / testing all open), out-of-scope list, required output schema with exact section headers for mechanical comparison, and the five evaluation lenses.

Iterate on the brief before sending to agents — once it ships, all four runs use the same version.

## Open questions

- Comments / discussion venue for the series? (non-blocking — purely a publishing choice)

## Changelog

- **2026-04-18** — Document started. Baseline surveyed. Series outline drafted. New repo named `agent-bakeoff`. Proposals will live at `proposals/<agent>/` in that repo. Decision: every proposal gets a preview URL on free static/edge hosting; brief will require deployable-as-static.
- **2026-04-18** — Outline tightened: added framing post (post 0), collapsed comparison + choice into single "verdict" post (post 4), made proposals a single mega-post (post 3) rather than one-per-agent. Final shape: 6 posts.
- **2026-04-18** — Agent slate locked at 4: Codex, Claude Sonnet (Plan subagent), Claude Opus (main-thread, disclosed), Claude + frontend-design skill. Open "no-framework" slot dropped — better as a future round.
- **2026-04-18** — Brief v1 drafted at [the-brief.md](the-brief.md). Hard constraints: deployable static/edge, modern toolchain, exact output schema. Open: framework, state, build, styling, language, testing. Output schema includes the section headers needed to assemble the comparison post mechanically.
- **2026-04-18** — Series restructured into a two-act bakeoff: Act 1 = design-off (4 agents), Act 2 = build-off (1 design, 3 time budgets, same agent). New shape: 8 posts. Act 2 rules locked: same agent across budgets, wall-clock + iteration cap + autonomous loop, concrete budget sizing calibrated after app is chosen.
- **2026-04-18** — App pivoted from todo-rebuild to a **single-user markdown notes editor**. Baseline is now a complexity reference, not a literal starting point. Optional bonus in the brief: a "collab sync sketch" agents may include without implementing. Brief updated to v1.1.
- **2026-04-18** — Brief v1.2: added required "Carryovers from the baseline" section. Hyperscript-over-JSX and functional-programming-approach are now soft preferences with **required specific justification if dropped**. Forces every proposal to engage honestly with the baseline's identity rather than defaulting to "modern" choices unexamined.
- **2026-04-18** — Sonnet pilot ran on brief v1.2 (output archived at `proposals/_archive/claude-sonnet-plan-brief-v1.2/`). Pilot picked SolidJS + Vite + CodeMirror 6 + TS. Three brief problems flagged → patched into v1.3: (a) required "Collab considered in v1 design: yes/no" declaration, (b) pinned two architecture-trace actions ("save an edit," "switch to a note") replacing stale "toggle complete," (c) removed self-rated `Independence` field — orchestrator fills in comparison post. Re-running Sonnet against v1.3 to validate.
- **2026-04-18** — Sonnet pilot v1.3 confirmed all three patches landed (output archived at `proposals/_archive/claude-sonnet-plan-brief-v1.3/`; stack updated to SolidJS + Zustand + CodeMirror 6 + Vite). One residual critique patched into v1.4: bundle-size measurement methodology defined (JS + CSS, gzipped, excluding fonts/images, with shown math). Two other critiques (collab-influence granularity, self-assessment honesty) accepted as freeform/qualitative content the verdict post will handle. Fanning out to all 4 agents on v1.4.
- **2026-04-18** — All four proposals in. Spot-check passed (every required schema header, carryover, action trace, bundle math present in each). Stacks: opus-main (Inferno + CM6 + hand-rolled), sonnet-plan (Solid + Zustand + CM6), frontend-design (Solid + CM6 + vanilla-extract), codex (Mithril + textarea + micromark). Three patterns: CodeMirror 6 is editor consensus (3/4); hyperscript kept by both non-default-Claude slots (opus-main + codex); bundle sizes spread 37–100 KB driven by editor lib choice.
- **2026-04-18** — Post 4 (the verdict) drafted at [post-04-the-verdict.md](post-04-the-verdict.md). Pick: **claude-frontend-design** for Act 2's build-off, on build-off-fitness reasoning (most polish surface for time-pressure signal). Codex named as runner-up and "best pure proposal" by the brief's lenses. Opus-main self-disclosed as informed-insider, not eligible. Verdict reasoning is in the post; user can override.
- **2026-04-18** — Posts 0–3 drafted: [post-00-why-an-agent-bakeoff.md](post-00-why-an-agent-bakeoff.md) (framing), [post-01-whats-in-the-box.md](post-01-whats-in-the-box.md) (baseline tour), [post-02-the-brief.md](post-02-the-brief.md) (brief evolution v1.0→v1.4 with both pilot critiques), [post-03-the-proposals.md](post-03-the-proposals.md) (mega-post with one section per agent, on each proposal's own terms). All forward references in post 4 now resolve. Posts 5–7 still wait on Act 2.
- **2026-04-18** — Repo `agent-bakeoff` created (private, under acald-creator GitHub account). Initial commit `fd959bc9` includes baseline snapshot + blog + 4 proposals + archived pilots. Author/committer set to `Antonette Caldwell <18711313+acald-creator@users.noreply.github.com>` (GitHub noreply for privacy + correct profile attribution).
- **2026-04-18** — Act 2 setup locked. Builder: same agent that authored the chosen proposal (Claude Sonnet via subagent + `frontend-design` skill). Budget calibration: 1-day = ~30 min / ~25 iterations; 3-day = ~90 min / ~75 iterations; 1-week = ~4 hr / ~150 iterations. Operational rules at [act-2-rules.md](act-2-rules.md). Independent runs, no peeking, output to `builds/<budget>/`. Kicking off 1-day build first.
- **2026-04-18** — 1-day build complete. Agent: SolidJS + CodeMirror 6 + plain CSS + Vite (vanilla-extract dropped under pressure). 14 iterations, ~12 min. Orchestrator measured 219 KB gzipped entry bundle (2.8× the ~82 KB target). Cause: agent imported `@codemirror/language-data` (100+ language modes) instead of `@codemirror/lang-markdown`. Classic time-pressure shortcut. Methodology pivoted: orchestrator runs install+build out-of-band after three permission walls; agent self-paces on code only.
- **2026-04-18** — 3-day build complete (structurally). Agent: SolidJS + CodeMirror 6 + vanilla-extract + Vite with full tokens + accessibility + motion. 35 iterations, ~45 min — well under budget. But the delivered code **does not compile**: three independent mistakes ((a) nonexistent version pin `@vanilla-extract/vite-plugin@^4.0.21`, (b) `globalStyle` called in `tokens.ts` not `tokens.css.ts`, (c) `selectors` key used inside `globalStyle()` where it's not allowed). Orchestrator patched (a) and (b), stopped at (c) which needed ~12 code rewrites. Bundle not measured; agent's claimed ~105 KB is unverifiable. Strongest time-pressure finding so far: *self-verification through inspection does not substitute for execution*.
- **2026-04-18** — 1-week build complete. Agent: SolidJS + CodeMirror 6 + vanilla-extract + Vite + Vitest + Playwright with full design tokens, mobile responsive sidebar, 6 things "evolved beyond the proposal," 27 test assertions. 140 iterations, 18 min. But: **same `tokens.ts` mistake as 3-day** + 11 TypeScript errors the agent never saw + manual chunk config that produced a 533 KB gzipped entry bundle (6.5× target, 2.4× worse than 1-day). After orchestrator's one-line rename fix, `vite build` succeeds; `tsc` still fails. **The budget curve is not monotonic in quality**: 1-day was the only build that ran as delivered. The 1-week agent had 3h42m of unused wall-clock and spent none of it on verification.
- **2026-04-18** — Act 2 complete. Three-build summary: 1-day builds but 2.8× over bundle target; 3-day doesn't build; 1-week builds after orchestrator fix, 6.5× over bundle target. Meta-finding: within the methodology's "write-only, no build feedback" constraint, adding iteration headroom without verification headroom produces strictly worse outcomes. Posts 5–7 can now be drafted.
- **2026-04-18** — Posts 5–7 drafted. [post-05-build-off-day-1.md](post-05-build-off-day-1.md) covers the methodology pivot and the 1-day results (219 KB, wrong CM6 import, honest-about-unverified). [post-06-build-off-3-day-vs-1-week.md](post-06-build-off-3-day-vs-1-week.md) stacks the two longer budgets: 3-day doesn't compile (three independent vanilla-extract / version mistakes); 1-week compiles after rename patch but with a 533 KB bundle from a `manualChunks` misconfiguration, same `tokens.ts` mistake as 3-day, plus 11 TS errors. [post-07-what-time-pressure-does.md](post-07-what-time-pressure-does.md) is the meta-post: the non-monotonic budget curve as evidence that iteration headroom without verification headroom hurts, the honesty-calibration degrading with budget, "what a properly instrumented agent would look like" as a future-round hypothesis. Series complete at 8 posts.
- **2026-04-18** — Round 2 of Act 2 executed (instrumented mode). Subagent → orchestrator → subagent feedback loop; orchestrator runs all `pnpm build` out-of-band, agent writes code and stops each round. Three builds, each multi-round: instrumented 1-day builds at 236 KB (57 iter, 4 rounds — similar to Round 1 1-day but with vanilla-extract kept); instrumented 3-day builds at **216 KB** (40 iter, 2 rounds — smaller than 1-day, and Round 1 3-day didn't build at all); instrumented 1-week **doesn't build** after 4 rounds + orchestrator interventions (vanilla-extract scoping error resistant to round-by-round fixing).
- **2026-04-18** — Post 8 drafted at [post-08-act-2-instrumented.md](post-08-act-2-instrumented.md). The post-7 hypothesis (live feedback → monotonic curve) is **partially confirmed, partially refuted**. Monotonic at 1-day → 3-day (216 KB < 236 KB, both built); breaks at 3-day → 1-week (more code → emergent cross-cutting compiler errors the loop can't resolve). Finding: there's a **sweet spot** where feedback matters most, not a linear relationship. Four newly-observed patterns: lessons carry across fresh subagent contexts via prompt (not memory); subagents can mis-target directories under ambiguous prompts; iteration self-count is unreliable at scale; bundle floor is set by dep set, not loop. Series extended from 8 to 9 posts total.
- **2026-04-18** — Round 3 slate expansion: gemini-3-1 (Gemini 3.1 Pro via first-party gemini-cli), claude-haiku-4-5 (fast-Claude slot via subagent), qwen-25-coder (Qwen 2.5-Coder 14B via local Ollama). Slate now at 7 agents across 5 model families. Patterns at 7: SolidJS is consensus framework (4/7); Hyperscript 3 kept / 4 dropped; CodeMirror 6 is 6/7; Bundle spread 37–100 KB. Four CLI patterns demonstrated portable: Codex CLI, Gemini CLI, Ollama-local, Claude-subagent.
- **2026-04-18** — Post 9 drafted at [post-09-slate-expansion-round-3.md](post-09-slate-expansion-round-3.md). Five observations: (1) the CLI pattern is model-portable — no per-model wrappers needed; (2) output fidelity is a *runner* property, not a model property — Ollama needs an ANSI + Braille cleanup pass; (3) capability shows up as *depth*, not schema compliance — all 7 agents hit all 11 headers, Qwen's carryover engagement was 1 sentence where Claude/Gemini were paragraphs; (4) smaller / older models pick "trendy and shallow" over "engaged and specific"; (5) slate diversity saturates around 6–8 agents. Operational risks: model ID churn (Qwen OAuth endpoint discontinued 3 days before research ran); subagent permission walls keep returning; open-weight is cost-free but slow (~10 min on CPU for 1k words). Devstral 2 + Kimi K2.5 queued for Round 4 when API keys available.
- **2026-04-18** — Devstral (Mistral) added via API — 8th agent. SolidJS 2.0 (speculative version), Lexical editor (first non-CodeMirror non-textarea pick), 56 KB bundle, 973 words. Pattern held: shorter proposal length similar to Qwen. Small hallucination (SolidJS 2.0 unreleased) matches the codex `vite-plugin@4.0.21` non-existent-version pattern.
- **2026-04-18** — Kimi K2.5 (Moonshot) attempted and deferred. Key authenticated but account zero-balance; `HTTP 429` returned with a billing-suspension body, not rate-limit body. New operational finding: **API keys don't always mean API access** — billing-gate errors look like rate-limit errors in status code. Round 3 closed at 8 agents. Post 9 updated with a closure "Update" section documenting Devstral and the Kimi skip.
