# post-09 facts-only skeleton

*Source material for rewriting "Slate expansion" (Round 3: going from 4 agents to 8). NOT for publication.*

---

## What this post must establish

1. The series extended past 8 posts because the methodology became interesting on its own, not because any individual finding demanded a sequel.
2. The bakeoff format is model-portable — 4 different CLI invocation patterns were tested and all worked (Codex CLI, Gemini CLI, Ollama-local, Claude-subagent, Mistral-via-curl).
3. Schema compliance is a FLOOR, not a discriminator. Depth-of-engagement is the real signal.
4. Smaller / older models produce "trendy and shallow" over "engaged and specific" — a distinct failure mode worth naming.
5. Slate diversity saturates around 6–8 agents. Bigger slates ≠ more findings.

## The three new slots (original Round 3 + Devstral later)

Round 3 initial additions:
- **gemini-3-1** — Gemini 3.1 Pro via first-party `gemini-cli`
- **claude-haiku-4-5** — Anthropic fast Claude variant, via subagent
- **qwen-25-coder** — Qwen 2.5-Coder 14B via local Ollama (self-hosted, CPU inference)

Later addition (documented in the "Update" section):
- **devstral** — Devstral via Mistral API (after the user provided a Mistral API key)

Brings total slate to **8 agents across 6 model families**.

## The seven-agent slate at the time of initial Round 3

| Slot | Framework | Editor | Hyper | Func | Bundle | Collab v1 |
|---|---|---|---|---|---|---|
| claude-opus-main | Inferno 8 | CM 6 | Kept | Kept | ~75 KB | Yes |
| claude-sonnet-plan | SolidJS | CM 6 | Dropped | Kept | ~90–100 KB | Yes |
| claude-frontend-design | SolidJS | CM 6 | Dropped | Partial | ~82 KB | Yes |
| codex | Mithril | textarea | Kept | Partial | ~37 KB | No |
| gemini-3-1 | SolidJS + `solid-js/h` | CM 6 | Kept | Partial | ~65 KB | Yes |
| claude-haiku-4-5 | SvelteKit 5 | CM 6 | Dropped | Dropped | ~54 KB | Yes |
| qwen-25-coder | SolidJS + TanStack Query + Tailwind | CM 6 | Dropped | Partial | ~65 KB | No |

## Patterns at 7 agents (vs 4 agents)

- **SolidJS is consensus framework** (4/7). Inferno, Mithril, Svelte each have exactly one advocate.
- **Hyperscript split tightened to 3/4** — a narrower split than the 2/2 at 4 agents, but not decisively.
- **CodeMirror 6 = 6/7** — codex with textarea is the lone editor-library outlier.
- **Collab-in-v1: 5 yes / 2 no** — codex and qwen are the "decline the invitation" pair.
- **Bundle spread: 37 KB (codex) to 100 KB (sonnet-plan)** — 2.7× range.

## Five observations from running this

### 1. CLI invocation pattern is genuinely model-portable

Three different runners, same shape: invoke with a single prompt, get file output.
- Codex: `codex exec -s workspace-write 'PROMPT'`
- Gemini: `gemini --approval-mode yolo -p 'PROMPT'`
- Ollama: `echo PROMPT | ollama run qwen2.5-coder:14b`

Ollama doesn't have filesystem tools, but its stdout can be redirected to disk. All three produce schema-compliant proposals.

**Adding a model is cheap once the template is locked.** Every new runner is a ~10-line invocation change, not a new orchestration subsystem.

### 2. Output fidelity is a RUNNER property, not a model property

First-party CLIs (Codex, Gemini) produce clean markdown ready for disk.

Ollama's local inference polluted output with ANSI escape codes + Braille spinner characters — raw file needed `sed`/Python cleanup pass before markdown was valid:

```
⠙ ⠹ ⠸ ⠴ ⠦ ⠧ ⠇ ⠏ ⠙ ⠹ [...]```markdown
# Proposal: Modern Markdown Notes Editor
```

After stripping `U+2800..U+28FF` Braille range and `\x1b\[.*[A-Za-z]` ANSI escapes, content underneath was fine.

**Orchestration tax is specifically on the local-inference path, not on open-weight models per se.** Remote Qwen via hosted API would likely behave like Gemini. If bakeoff goes public-facing, Ollama-driven runs should pipe through stripping filter by default.

### 3. Model capability shows up as DEPTH, not schema compliance

All 7 agents hit all 11 required section headers. All addressed both required carryovers and both pinned action traces. **Schema was a floor, not a discriminator.**

Depth discriminator:
- Qwen 14B: 1,126 words, generic carryover reasoning ("JSX is more widely used")
- Gemini 3.1 Pro: ~2,000 words, specific hyperscript-via-`solid-js/h` engagement
- Claude Opus/Sonnet: 2,000–2,500 words with named tradeoffs, alternatives-considered

Word counts aren't the measure; specificity is. Qwen's carryover reply is technically on-schema and technically correct. It's also hollow — doesn't engage with baseline's actual functional lineage.

**Future bakeoffs should grade on schema + depth jointly.** A proposal that hits all 11 headers with paragraph-level engagement per carryover ≠ a proposal that hits 11 headers with one-sentence replies. Both pass spot-check. Only one does comparison work.

### 4. Smaller / older models pick "trendy and shallow" over "engaged and specific"

Qwen picked TanStack Query for localStorage (usually server-state library, repurposed) and Tailwind (no other agent picked it). Neither wrong. Both *frictionlessly plausible* — choices that sound like answers without being answers to the specific questions the brief asked.

Compare to codex picking `textarea` + `micromark`: contrarian against CodeMirror consensus, but reasoning is specific ("the required editor is not an IDE, and the collaboration story is explicitly optional"). **Engagement with brief's SHAPE, not just brief's words.**

**A bakeoff with too many small/older models risks producing majority-shallow proposals that meet schema but don't produce comparison signal.** The 7-agent slate is well-balanced because 4 of 7 are current-frontier Claude or Gemini. One more shallow-depth slot would tip the average.

### 5. Each new model yields diminishing returns on slate surprise

- Round 1 (4 agents): 3 distinct framework picks, 2/2 hyperscript split
- Round 2 adds Gemini: one new distinctive configuration (SolidJS with hyperscript via `solid-js/h`)
- Round 3 adds Haiku (Svelte — new!), Qwen (echoes Sonnet-plan's shape with different styling/state)

**Slate's diversity saturated somewhere between 4 and 7 agents for this brief.** A 12-agent slate wouldn't produce 3× the findings of a 4-agent slate. Most signal in early agents.

**For your own bakeoff:** 4 agents is minimum interesting, 6 is sweet spot, 8 is thorough, beyond that is noise. Drop slots that aren't going to change consensus-or-disagreement shape.

## Three operational risks surfaced

### Model ID churn is real-time

- Slate-research doc from that same afternoon recommended Qwen3-Coder-Next. Local Ollama had only Qwen 2.5-Coder. Ran 2.5 — represents Sept 2024 generation, not April 2026.
- Gemini is on 3.1, not 3.0 (the 3 Preview silently deprecated within weeks of launch).
- Qwen's OAuth endpoint discontinued three days before the research ran.

**Bakeoff needs a "model-ID-at-run-time" field** — not just slot identity, but specific snapshot. Otherwise a year later, "Qwen proposal" is just "Qwen of some indeterminate era."

### Subagent permission walls keep returning

Every round, some fresh permission edge-case blocks subagents from running the thing they need.
- Round 1 3-day/1-week: `pnpm install` denied
- Round 2 Act 2 instrumented: `pnpm build` wall despite allowlist patches
- Round 3 Qwen orchestration subagent: Bash tool denied outright

**Orchestrator-in-main-thread is the reliable workaround, but adds toil.** A proper bakeoff runner would need to either run everything from a process with full Bash scope, or use a permission model that routes allowlists to subagents predictably.

### Open-weight = cost-free but slow

Qwen 14B on CPU: ~10 min to produce 1,126 words. Scaling to similar models would mean ~30 min per proposal, ~2 hr for 4-agent open-weight round. **Tractable; also means open-weight slots lag first-party-CLI slots by an order of magnitude in wall-clock.**

## The Round 3 update section (Devstral + Kimi skip)

Written after original post. Two post-publication runs attempted.

### Devstral (Mistral) ran
- Via curl against `api.mistral.ai/v1/chat/completions`
- Same bakeoff prompt template used for Qwen (no model-specific prompt)
- One-shot; no retries; clean markdown with leading ```markdown fence that stripped trivially
- 973 words — same "shorter than frontier Claude/OpenAI" pattern Qwen exhibited. **Now a two-data-point pattern, not a one-off.**

Devstral's picks:
- **Lexical** as editor library (nobody else picked it; second editor-library outlier after codex)
- **SolidJS 2.0** (speculative version; actual SolidJS is at 1.9.x — another small confident-wrong hallucination, matching codex's non-existent `@vanilla-extract/vite-plugin@^4.0.21` pattern)
- Bundle estimate 56 KB, third-lowest in the slate

### Kimi K2.5 (Moonshot AI) attempted, didn't ship
- User provided Moonshot key
- Key authenticated (HTTP 200 on /models endpoint)
- Chat completion returned HTTP 429 with body: *"Your account is suspended due to insufficient balance, please recharge your account or check your plan and billing details"*
- Moonshot's public API requires prepaid credits — no free tier for chat completions
- Valid-looking key from unfunded account returns 429 (not 401), which is misleading
- Exponential backoff through 5 attempts + ~5 minutes waiting; every retry hit same suspension
- Closed Kimi as deferred

### New operational finding from Kimi skip

**API keys don't always mean API access.** Valid authentication token doesn't guarantee callable endpoint. Payment-gate errors can look like rate limits in response code (`429`) while being operationally different (account suspension, quota exhaustion, plan limits).

**Production bakeoff runner should inspect response body, not just status code.** Budget for the fact that some slate candidates will fail at billing gate rather than model gate.

## What this round didn't test

- Frontier competitors beyond OpenAI/Anthropic/Google — Devstral 2 (tested) and Kimi K2.5 (deferred) both scored within range of existing frontier agents on SWE-bench Verified.
- Act 2 instrumented with expanded slate. Round 2's instrumented build-off used only `claude-frontend-design`. Testing whether Gemini or Haiku produce different Act-2 behavior is an obvious next experiment.
- Cross-runner parity of "agent behavior." Multiple runs per model to establish variance = real missing piece.

## Final slate (8 agents, Round 3 closed)

| Slot | Family | Framework | Editor | Words |
|---|---|---|---|---|
| claude-opus-main | Anthropic frontier | Inferno 8 | CM 6 | ~2,200 |
| claude-sonnet-plan | Anthropic frontier | SolidJS | CM 6 | ~2,500 |
| claude-frontend-design | Anthropic frontier + skill | SolidJS | CM 6 | ~2,500 |
| claude-haiku-4-5 | Anthropic fast | SvelteKit 5 | CM 6 | ~2,200 |
| codex | OpenAI (GPT-5) | Mithril | textarea | ~1,500 |
| gemini-3-1 | Google frontier | SolidJS + `solid-js/h` | CM 6 | ~2,000 |
| qwen-25-coder | Alibaba open-weight | SolidJS | CM 6 | 1,126 |
| devstral | Mistral coding | SolidJS 2.0 *(speculative)* | Lexical | 973 |

## What the current post does that's load-bearing

- Separates "what I tested" from "operational risks that are generalizable"
- Names the Kimi API-keys-don't-mean-access finding explicitly (new risk)
- The update section admits the findings shifted post-publication (honest)
- Ends with portable working assumptions for other bakeoff runners

## What the current post does that's NOT load-bearing (drop freely)

- Full enumeration of every agent's stack choice (just link to README's slate table)
- "This post is about running that experiment" meta-commentary
- Repeated "observations" numbered lists
- The final "go run your own" exhortation at the very end

## Numbers / specifics worth landing somewhere

- 8 agents across 6 model families
- CLI patterns: Codex, Gemini, Ollama, Claude-subagent, Mistral-via-curl = 5 portable invocation patterns
- Word counts: 973 (devstral), 1,126 (qwen) at low end; 2,500 (frontier Claude/OpenAI) at high end
- Qwen on CPU: ~10 min for ~1,100 words
- Hallucination examples: codex `@vanilla-extract/vite-plugin@^4.0.21`, devstral `SolidJS 2.0`
- Kimi: key authenticated but HTTP 429 with billing-suspension body
- Slate diversity saturation: 4–6 agents sweet spot, 8 is thorough, beyond that noise

## Hook the current prose uses (for reference)

Current opener: "The original series landed at 8 posts..." Then pivot to "the question of whether the bakeoff *format* itself was model-portable started to matter more than whatever individual finding..." Announce-then-pivot AI-rhythm again. Find your own on-ramp — maybe from the Kimi 429 moment, or the Qwen cleanup pass, or the 3/8 hallucination-rate observation.
