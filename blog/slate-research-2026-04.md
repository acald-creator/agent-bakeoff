# Bakeoff Slate Research — April 2026

**Research date:** 2026-04-18  
**Purpose:** Identify non-Claude / non-OpenAI models for Round 2 of the multi-agent markdown notes editor bakeoff. All findings are sourced from live searches and provider docs. Knowledge cutoff of the research agent was Jan 2026; claims beyond that date are sourced from web searches performed on 2026-04-18 and annotated accordingly.

---

## 1. Summary Recommendation

**Add these two to the Round 2 slate:**

### Primary pick: Gemini 3.1 Pro via `gemini-cli`

Gemini 3.1 Pro (released 2026-02-19) pairs a frontier-tier SWE-bench score (80.6% Verified) with first-party CLI tooling that mirrors the Codex CLI pattern already in the slate. `gemini-cli` is open-source (Apache 2.0), installable with `npm install -g @google/gemini-cli`, and includes a free tier (1,000 req/day, 60 req/min) that is generous enough to complete a full proposal run. The 1M token context window eliminates any concern about fitting the baseline repo plus the brief. The model's known strength in frontend/web work (ranked #1 WebDev Arena) is directly relevant to a Markdown notes editor proposal.

### Secondary pick: Qwen3-Coder-Next via `qwen-code`

Qwen3-Coder-Next (released 2026-02-03) is an open-weight model (Qwen/Qwen3-Coder-Next, ~80B MoE) with 70.6% SWE-bench Verified and its own first-party CLI (`npm install -g @qwen-code/qwen-code`), adapted from Gemini CLI. It offers a genuinely different training story — RL-trained on executable tasks, specializing in long-horizon tool use — and adds cost/geographic diversity (Alibaba Cloud, OpenRouter, or local Ollama). The open-weight availability means results are reproducible at zero incremental cost if the orchestrator already has adequate GPU access.

### Honorable mention: Devstral 2 via `mistral-vibe-cli`

Mistral's Devstral 2 (123B, 72.2% SWE-bench Verified, released early 2026) + the new Mistral Vibe CLI would round out the slate with a fully open-weight European option. It's slightly weaker on coding benchmarks than the two primaries but brings an interesting angle: the smallest-yet-capable footprint in the "can run locally" category, and strong cost efficiency (Devstral Small 2 at $0.10/$0.30 per million tokens).

---

## 2. Comparison Table

| Model (ID + release) | Family | Agentic CLI | SWE-bench Verified | Context window | Cost / 1M tokens (in / out) | Known quirks for bakeoff | Availability concerns |
|---|---|---|---|---|---|---|---|
| **Gemini 3.1 Pro** (2026-02-19) | Google DeepMind — distinct reasoning; native thinking; multimodal-first | Yes — `gemini-cli` (first-party, Apache 2.0, npm) | **80.6%** | 1M tokens | $2 / $12 (>200K: $4 / $18) | High verbosity per benchmark run (57M tokens generated in eval); strong frontend/web bias; sometimes over-engineers solutions | 60 req/min free; Vertex AI for higher limits; preview models may deprecate fast — Gemini 3 Pro Preview deprecated March 9, 2026 |
| **Gemini 2.5 Pro** (2025-03) | Google DeepMind | Yes — `gemini-cli` | ~63.8% (older custom agent setup) | 1M tokens | $1 / $10 | Stronger on reasoning/math than raw SWE-bench score implies; #1 LMArena at launch | Free tier: same as 3.1 Pro; now superseded by 3.1 Pro for most tasks |
| **Qwen3-Coder-Next** (2026-02-03) | Alibaba Qwen — RL-trained coding specialist; MoE; distinct from Western RLHF pipelines | Yes — `qwen-code` (first-party fork of Gemini CLI, npm) | **70.6%** (SWE-Bench Verified via SWE-agent scaffold) | 256K native; 1M via extrapolation | API via Alibaba Cloud DashScope; OpenRouter ~$0.30 / $1.50 (approximate) | Designed for long-horizon tool-calling; "preserve_thinking" param useful in agent loops; OAuth discontinued 2026-04-15, use DashScope or OpenRouter | DashScope API key required; latency from US to Alibaba Cloud may be higher; open weights also on Ollama for local use |
| **Qwen 3.6 Plus** (2026-03-31) | Alibaba Qwen — proprietary hosted API; agentic focus | Via `qwen-code` with DashScope endpoint | **78.8%** | 1M tokens | $0.29 / ~$1.50 (DashScope) | Claims 2–3x token/s vs Claude Opus 4.6; explicitly pitched as "agentic coding"; compatible with Claude Code via Anthropic-compatible endpoint | Proprietary; DashScope key; newer/less battle-tested than Qwen3-Coder-Next |
| **Devstral 2** (early 2026, 123B) | Mistral AI — European, MoE, open-weight | Yes — `mistral-vibe-cli` (Apache 2.0, curl install) | **72.2%** | 256K tokens | $0.40 / $2.00 (after free period); Devstral Small 2: $0.10 / $0.30 | Claims 7x cost efficiency vs Claude Sonnet; strong multi-file coordination; architecture-level reasoning built into CLI | Open-weight; self-hostable; API via api.mistral.ai; Small 2 runs on consumer hardware |
| **Kimi K2.5** (2026-01-26) | Moonshot AI — 1T MoE params, 32B active; agent-swarm native; multimodal | Yes — `kimi-cli` (pip install, open-source) | **76.8%** | 256K tokens | $0.60 / $2.50 (platform.moonshot.ai); OpenRouter: ~$0.38 / $1.72 | Agent Swarm (up to 100 sub-agents); coordinated 1,500-step execution; visual coding from UI specs; knowledge cutoff: unclear | Via platform.moonshot.ai and OpenRouter; open weights available on HuggingFace |
| **Grok 4.20** (2026-03, beta) | xAI — distinct reasoning lineage; 2M context; multi-agent native | Partial — `grok-build` (live beta as of 2026-04-15, v4.20.175) | **~81%** (claimed, independent tests unverified) | 2M tokens | $2 / $6 (4.20 model) | Knowledge cutoff November 2024 (stated in xAI docs) — a significant gap for a notes-app proposal that references 2025/2026 tooling; 8-agent parallel system; infrastructure still scaling | Grok Build beta available but not fully stable; waitlist residue; community `grok-cli` exists as unofficial fallback |
| **DeepSeek V4** (expected late April 2026) | DeepSeek — Chinese MoE; strong cost efficiency; open weights | None confirmed yet | **~80%+ (unverified leak)** | 1M tokens | ~$0.30 / undisclosed | Not released as of research date; current API (`api.deepseek.com`) maps to V3.2 (128K context); open weights expected under Apache 2.0 | NOT AVAILABLE 2026-04-18; V3.2 is current; skip for Round 2 |
| **Mistral Large 3** (2025-Q4, 675B MoE) | Mistral AI | No dedicated agent CLI (use Mistral Vibe CLI or OpenCode) | No published SWE-bench | 256K tokens | $0.50 / $1.50 | Top open-source on LMArena coding; Forge enterprise platform launched March 2026; reasoning variant not yet shipped | Open-weight on HuggingFace; requires significant VRAM for self-host |
| **Meta Llama 4 Maverick** (2025-Q4) | Meta — MoE; open-weight; multimodal | No first-party CLI; use OpenCode / llama.cpp / Together AI | **74.2%** (via third-party scaffold) | 1M tokens | $0.35–0.40 / $1.00–1.20 (Together AI / Fireworks) | Underperforms Llama 3 on coding-specific tasks per Rootly benchmarks; better at multimodal than pure code; no first-party agentic CLI | Open-weight; widely available via Together, Fireworks, Groq, Ollama |
| **Claude Haiku 4.5** (2025-10-15) | Anthropic — in-house; same family as existing slate | Inherits Claude Code / any Claude-capable harness | **73.3%** | 200K tokens | $1.00 / $5.00 | 4–5x faster than Sonnet 4.5; 90% of Sonnet performance per Augment's eval; lowest-cost Claude option; extended thinking supported | No availability concerns — already in-scope for this Claude Code session |

---

## 3. Per-Model Notes

### Gemini 3.1 Pro

What makes it distinct: Gemini 3.1 Pro is Google DeepMind's current flagship (as of 2026-02-19), trained with native thinking/reasoning capabilities and multimodal inputs baked in from pretraining, not bolted on. Its 80.6% SWE-bench Verified puts it in the same tier as Claude Opus 4.5/4.6 and GPT-5.3 Codex. Crucially for this bakeoff, it ranked #1 on the WebDev Arena leaderboard (human preference for web app aesthetics and functionality) — exactly the lens relevant to a Markdown notes editor proposal.

Proposal capability: Yes. 1M context easily handles the brief + baseline codebase in one pass. `gemini-cli`'s ReAct loop with built-in file system tools and shell commands is structurally equivalent to Claude Code — the same 11-section schema is achievable with the same prompting discipline used for the Claude subagent proposals.

Wiring: `npm install -g @google/gemini-cli && gemini` — authenticate with a Google account for the free tier, or pass a Gemini API key. The CLI accepts a `--model gemini-3.1-pro-preview` flag. Non-interactive (`--prompt`) and pipe modes are supported, enabling scripted proposal generation.

Red flags: (1) Verbosity — the model generated 57M tokens across benchmarks, suggesting it over-generates. A tight schema with explicit section headers and word limits mitigates this. (2) Model ID churn — Gemini 3 Pro Preview was deprecated just weeks after launch (March 9, 2026). Pin the exact model ID in the bakeoff script and document the deprecation date. (3) Preview status — "3.1 Pro Preview" is not GA; behavior may shift.

---

### Gemini 2.5 Pro

What makes it distinct: The previous generation — still strong (63.8% SWE-bench, #1 LMArena at launch), $1/$10 pricing. Relevant if budget is constrained or for a "generation comparison" subtrack within the bakeoff (2.5 Pro vs 3.1 Pro as the same model family evolution).

Proposal capability: Yes, with the same `gemini-cli` tooling. Less recommended than 3.1 Pro for new rounds given the newer model is available at modest cost premium.

Wiring: Same as 3.1 Pro, different model ID flag.

Red flags: Superseded. The free tier is shared with 3.1 Pro, so no cost advantage.

---

### Qwen3-Coder-Next

What makes it distinct: Purpose-built for coding agents, not retrofitted. RL training on large-scale executable tasks teaches plan → tool call → test → failure recovery loops — a different capability profile than RLHF-for-helpfulness models. The 480B-A35B (480B total, 35B active) MoE architecture is efficient at inference. Open weights under a permissive license mean fully reproducible results with zero ongoing API cost.

Proposal capability: Yes. 70.6% SWE-bench Verified via SWE-agent scaffold, and the CLI (`qwen-code`) was explicitly built for multi-file, repository-level work. The 256K native context is sufficient for the brief + baseline codebase simultaneously. The 1M extrapolation mode covers edge cases.

Wiring: `npm install -g @qwen-code/qwen-code`. Configure with DashScope API key (Alibaba Cloud Model Studio), OpenRouter, or Fireworks AI. Qwen Code supports OpenAI-compatible and Anthropic-compatible API endpoints. Alternatively, run locally via Ollama (`ollama run qwen3-coder-next`).

Red flags: (1) Qwen OAuth discontinued 2026-04-15 — orchestrators using the old auth method must migrate to DashScope or OpenRouter before running the bakeoff. (2) Chinese-hosted API: US developers may see higher latency and should test response times before the run. (3) Qwen3-Coder's proposal style will likely be technically dense; may need explicit schema enforcement to match the 11-section structure.

---

### Qwen 3.6 Plus

What makes it distinct: A proprietary, hosted evolution of the Qwen3 line released 2026-03-31. 78.8% SWE-bench Verified — closer to frontier than Qwen3-Coder-Next. The 1M context window, 2–3x speed advantage vs Claude, and explicitly "agentic coding" pitch make it an interesting alternative to Qwen3-Coder-Next if API reliability from the West is prioritized over open weights.

Proposal capability: Strong. Available through Claude Code as a drop-in by pointing ANTHROPIC_BASE_URL at DashScope's Anthropic-compatible endpoint — potentially the lowest-friction way to add a non-Anthropic model to the existing harness.

Wiring: Set `ANTHROPIC_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`, `ANTHROPIC_MODEL=qwen3.6-plus`, `ANTHROPIC_AUTH_TOKEN=<DashScope API key>`. Use existing Claude Code orchestration.

Red flags: Proprietary model — not reproducible by readers who self-host. DashScope API key required. Less battle-tested public benchmark track record than Qwen3-Coder-Next's open-weight model.

---

### Devstral 2 + Mistral Vibe CLI

What makes it distinct: Mistral's agent-specific model (not their general Large 3 — this is purpose-trained for software engineering), open-weight at 123B, claims 7x cost efficiency vs Claude Sonnet. The Mistral Vibe CLI is purpose-built for repo-level coding (file manipulation, git integration, multi-file orchestration). At 72.2% SWE-bench Verified it's slightly below Kimi K2.5 and Gemini 3.1 Pro, but it's the only entry from a European AI lab, adding geographic/regulatory diversity to the slate.

Proposal capability: Yes. 256K context, git-aware CLI, architecture-level reasoning features in the CLI itself. Should handle the 11-section schema with proper prompting.

Wiring: `curl -LsSf https://mistral.ai/vibe/install.sh | bash`. Use Devstral 2 model ID against api.mistral.ai, or self-host the open weights.

Red flags: (1) At 123B parameters, self-hosting requires significant GPU capacity — use the API unless reproducibility via local inference is a hard requirement. (2) Devstral 2's score (72.2%) trails the primary picks by 8+ points on SWE-bench Verified. (3) Mistral Large 3 (the general model) has no published SWE-bench score — do not confuse with Devstral 2.

---

### Kimi K2.5

What makes it distinct: Moonshot AI's open-source, natively multimodal model (released 2026-01-26) with a 1T-param MoE architecture (32B active) and built-in "Agent Swarm" capability — up to 100 sub-agents coordinating simultaneously. 76.8% SWE-bench Verified at $0.60/$2.50 is the most cost-efficient frontier-tier coding option in this list. The Kimi Code CLI (`pip install kimi-cli`, v1.12.0 as of 2026-02-11) is a direct Claude Code competitor.

Proposal capability: Yes. The Agent Swarm is overkill for a single proposal but demonstrates the model can break down complex tasks. 256K context is sufficient. Visual coding capability (code from UI screenshots) is genuinely useful for a frontend-adjacent bakeoff task.

Wiring: `pip install kimi-cli && kimi-code`. Authenticate with platform.moonshot.ai or OpenRouter key.

Red flags: (1) Moonshot AI is a Chinese startup — geopolitical availability risk is similar to DeepSeek. (2) The Agent Swarm's parallelism, while impressive, may produce non-deterministic proposals across runs — important for reproducible bakeoff comparisons. (3) Less community validation than Google/Mistral tooling; CLI v1.12.0 is relatively new.

---

### Grok 4.20 / Grok Build

What makes it distinct: xAI's Grok 4.20 (latest as of research date) has a 2M token context window — the largest in this list — and a stated ~81% SWE-bench score (from independent tests; xAI has not published a primary source). The Grok Build CLI (v4.20.175, released 2026-04-15) is in live beta with 8-parallel-agent coding support.

Proposal capability: Conditional. The 2M context is more than sufficient. However, xAI's docs state Grok 3/4's knowledge cutoff is November 2024 — meaning the model has no training signal for developments in 2025 or 2026 tooling. For a proposal about building a "2026 markdown notes editor," this is a meaningful gap; the model will need to reason from web search or the brief alone about current framework choices.

Wiring: `grok-build` CLI (live beta as of 2026-04-15); alternatively, direct xAI API (`api.x.ai`) with tool-use scaffolding. Community `grok-cli` (npm) is an unofficial fallback.

Red flags: (1) Knowledge cutoff: November 2024 is 17 months behind research date. (2) Infrastructure still scaling — xAI reported delays as recently as February 2026. (3) SWE-bench 81% claim is from independent/community tests, not xAI-published. (4) Pricing: $2/$6 per million tokens for 4.20 — reasonable but not cheap. (5) Grok Build remains in beta with potential instability.

---

### DeepSeek V4

What makes it distinct: Expected 1T-parameter MoE with $0.30/MTok pricing and claimed 80%+ SWE-bench Verified — potentially the most cost-efficient frontier model ever released. Open weights under Apache 2.0 expected.

Proposal capability: Unknown — model not yet released.

Wiring: Not applicable — `api.deepseek.com` currently serves V3.2 (128K context, deepseek-chat and deepseek-reasoner endpoints). V4 has a CLI-less API pattern; use existing DeepSeek API client libraries.

Red flags: **Do not include in Round 2 — not available as of 2026-04-18.** Expected late April 2026; add to Round 3 slate once released and benchmark-verified. Multiple prior release windows have slipped (January, February, March 2026).

---

### Meta Llama 4 Maverick

What makes it distinct: Open-weight, widely available (Together, Fireworks, Groq, Ollama), $0.35–0.40/$1.00–1.20 pricing, 1M context. 74.2% SWE-bench Verified (via third-party scaffold). Strongest argument: most widely deployed open model, so bakeoff results are maximally reproducible.

Proposal capability: Marginal. Independent benchmarks (Rootly) show Llama 4 underperforms Llama 3 on coding-specific tasks and trails specialized models (DeepSeek V3, Qwen3-Coder) on complex code. No first-party agentic CLI — requires OpenCode or llama.cpp scaffolding, adding variable performance from the scaffold layer.

Wiring: Use OpenCode CLI (npm, 140K GitHub stars, 75+ provider support) pointing at Together AI or Fireworks Llama 4 Maverick endpoint.

Red flags: Not specialized for agentic coding; scaffold-dependent performance; potentially less interesting bakeoff output than purpose-built coding models.

---

### Claude Haiku 4.5

What makes it distinct: In-house but represents the "fast/cheap Claude" performance tier. 73.3% SWE-bench Verified at $1/$5 — higher benchmark score than some non-Claude models at a competitive price. Can run in the same Claude Code harness already in use.

Proposal capability: Yes — it is Claude-family and will produce well-structured output. 90% of Sonnet 4.5's performance per Augment's agentic eval. 200K context is sufficient for the brief + baseline.

Wiring: Already available in-scope. Set `model: claude-haiku-4-5-20251001` in the subagent configuration.

Red flags: (1) Adds a fourth Claude entry to the slate — the bakeoff's stated goal is *not-Claude, not-OpenAI* diversity. Use only if the "fast/cheap within-family" contrast is a deliberate editorial choice. (2) 200K context is the smallest in this list.

---

### Mistral Large 3 (675B)

What makes it distinct: 675B total parameters, 41B active, 256K context, open-weight. Top open-source on LMArena coding leaderboard as of early 2026. Positioned as Mistral's general-purpose flagship, not coding-specialist.

Proposal capability: Plausible but no published SWE-bench score makes it hard to calibrate. For a bakeoff requiring file ops and multi-turn agentic behavior, Devstral 2 (purpose-trained for SWE tasks) is the stronger Mistral family choice.

Wiring: api.mistral.ai or self-host via HuggingFace weights.

Red flags: No published SWE-bench Verified score. Reasoning variant not yet shipped. 675B requires very significant VRAM for local inference.

---

## 4. Proposed Round 2 Slate

**Goal:** 4–6 agents, genuinely diverse model families, all runnable from CLI, mix of lenses and price tiers.

### Option A — 4-agent minimal expansion

| # | Agent | Model | CLI | Role / Lens | Est. cost per run |
|---|---|---|---|---|---|
| 1 | Gemini CLI agent | Gemini 3.1 Pro Preview | `gemini-cli` (first-party) | Frontend-first, WebDev-optimized perspective | ~$2–5 (1 proposal + 20-file impl) |
| 2 | Qwen Code agent | Qwen3-Coder-Next or Qwen 3.6 Plus | `qwen-code` (first-party) | Agent-loop specialist; RL-trained long-horizon view | ~$1–3 (OpenRouter/DashScope) |
| 3 | Mistral Vibe agent | Devstral 2 | `mistral-vibe-cli` (first-party) | Open-weight European model; cost-efficiency lens | ~$1–2 (API) or $0 (self-hosted) |
| 4 | Kimi Code agent | Kimi K2.5 | `kimi-cli` (first-party) | Agent-swarm / multimodal; ultra-low-cost perspective | ~$1–2 (OpenRouter) |

**Total estimated cost per full Round 2 run: $5–12 across all four agents**

---

### Option B — 6-agent expanded comparison (adds Grok + Haiku contrast)

Adds:

| 5 | Grok Build agent | Grok 4.20 | `grok-build` (beta) | xAI real-time reasoning; 2M context; high-cost tier | ~$10–20 |
| 6 | Claude Haiku subagent | Claude Haiku 4.5 | Claude Code harness | "Fast Claude" within-family contrast; editorial anchor | ~$1–2 |

**Total estimated cost per full Round 2 run: $17–36 across six agents**

---

### What to do about DeepSeek V4

Hold for Round 3. Monitor `api.deepseek.com` changelog. When V4 appears, add it as the "cheapest frontier" slot — the $0.30/MTok pricing and open weights would make it the most reproducible entry in the entire series.

---

### Practical setup notes

1. **Gemini CLI rate limit:** Free tier is 1,000 req/day, 60 req/min. A full proposal generation run (2,500 words + code sketch iteration) should complete well under 50 requests. Safe for bakeoff use on the free tier; no billing required.

2. **Qwen OAuth is dead (2026-04-15):** If any previous Qwen tooling used the Qwen OAuth flow, it must be migrated to DashScope, OpenRouter, or Fireworks before the bakeoff run.

3. **Gemini model ID pinning:** Always specify the exact model ID in the CLI invocation (e.g., `--model gemini-3.1-pro-preview`). Gemini "Pro" aliases rotate without notice — Gemini 3 Pro Preview was deprecated without fanfare on 2026-03-09.

4. **Grok 4.20 knowledge cutoff gap:** If Grok is added to the slate, prepend the brief with a "State of the Ecosystem in April 2026" context block summarizing framework choices (Vite, SvelteKit/Next/Remix, Tauri/Electron, etc.) to compensate for the November 2024 cutoff.

5. **Scaffold vs model score:** The SWE-bench numbers here mix scaffold types (SWE-agent, custom agent, CLI-native). Treat them as directional, not directly comparable. A controlled bakeoff using identical scaffolding would yield cleaner comparisons — consider using OpenCode CLI as a neutral scaffold for models without first-party agents (Llama 4, Mistral Large 3).

---

## Sources

- [Google Gemini API Models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini 3.1 Pro — Google DeepMind](https://deepmind.google/models/gemini/pro/)
- [Gemini CLI — GitHub](https://github.com/google-gemini/gemini-cli)
- [Gemini 3.1 Pro Preview — Artificial Analysis](https://artificialanalysis.ai/models/gemini-3-1-pro-preview)
- [Gemini 3.1 Pro Complete Guide 2026 — NxCode](https://www.nxcode.io/resources/news/gemini-3-1-pro-complete-guide-benchmarks-pricing-api-2026)
- [DeepSeek V4 Full Specs — NxCode](https://www.nxcode.io/resources/news/deepseek-v4-release-specs-benchmarks-2026)
- [DeepSeek V4 Expected Late April — GizChina](https://www.gizchina.com/ai/deepseek-v4-expected-to-launch-in-late-april-with-massive-parameter-scale)
- [DeepSeek API Changelog](https://api-docs.deepseek.com/updates/)
- [xAI Grok 4 News](https://x.ai/news/grok-4)
- [xAI Models and Pricing](https://docs.x.ai/developers/models)
- [Grok Build CLI Agent](https://www.adwaitx.com/grok-build-vibe-coding-cli-agent/)
- [Grok 5 Release Date — NxCode](https://www.nxcode.io/resources/news/grok-5-release-date-latest-news-2026)
- [Alibaba Qwen3 Introduction](https://www.alibabacloud.com/blog/alibaba-introduces-qwen3-setting-new-benchmark-in-open-source-ai-with-hybrid-reasoning_602192)
- [Qwen3-Coder: Agentic Coding](https://qwenlm.github.io/blog/qwen3-coder/)
- [Qwen3-Coder-Next — MarkTechPost](https://www.marktechpost.com/2026/02/03/qwen-team-releases-qwen3-coder-next-an-open-weight-language-model-designed-specifically-for-coding-agents-and-local-development/)
- [Qwen 3.6 Plus Review — MindStudio](https://www.mindstudio.ai/blog/qwen-3-6-plus-review-agentic-coding-model)
- [Qwen Code CLI — GitHub](https://github.com/QwenLM/qwen-code)
- [Qwen3.6-Plus: Towards Real World Agents — Alibaba Cloud](https://www.alibabacloud.com/blog/qwen3-6-plus-towards-real-world-agents_603005)
- [Devstral 2 + Mistral Vibe CLI](https://mistral.ai/news/devstral-2-vibe-cli)
- [Mistral 3 Family — DataCamp](https://www.datacamp.com/blog/mistral-3)
- [Mistral Large 3 Explained — IntuitionLabs](https://intuitionlabs.ai/articles/mistral-large-3-moe-llm-explained)
- [Kimi K2.5 — GitHub](https://github.com/MoonshotAI/Kimi-K2.5)
- [Kimi K2.5 Developer Guide — NxCode](https://www.nxcode.io/resources/news/kimi-k2-5-developer-guide-kimi-code-cli-2026)
- [Kimi K2.5 — OpenRouter](https://openrouter.ai/moonshotai/kimi-k2.5)
- [Meta Llama 4 — llama.com](https://www.llama.com/models/llama-4/)
- [Llama 4 Maverick Review — TokenMix](https://tokenmix.ai/blog/llama-4-maverick-review)
- [Llama 4 Underperforms Coding — Rootly](https://rootly.com/blog/llama-4-underperforms-a-benchmark-against-coding-centric-models)
- [Claude Haiku 4.5 — Anthropic](https://www.anthropic.com/news/claude-haiku-4-5)
- [Claude Haiku 4.5 — DataCamp](https://www.datacamp.com/blog/anthropic-claude-haiku-4-5)
- [SWE-bench Leaderboard — BenchLM](https://benchlm.ai/coding)
- [SWE-bench & LiveCodeBench 2026 — BenchLM](https://benchlm.ai/coding)
- [OpenCode CLI](https://opencode.ai/)
- [OpenCode — InfoQ](https://www.infoq.com/news/2026/02/opencode-coding-agent/)
- [Top 5 Agentic Coding CLI Tools — KDnuggets](https://www.kdnuggets.com/top-5-agentic-coding-cli-tools)
