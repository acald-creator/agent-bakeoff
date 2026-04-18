# Slate Expansion — Round 3

Round 3 took the slate from 4 agents to 8 across 6 model families. Same brief, same schema, different runners. Codex CLI, Gemini CLI, Ollama on CPU, Mistral via curl. The bakeoff format turned out to be portable. The interesting findings were the operational risks.

## The new slots

Round 3 initial additions:

- gemini-3-1. Gemini 3.1 Pro via first-party `gemini-cli`.
- claude-haiku-4-5. Anthropic's fast Claude variant, via subagent.
- qwen-25-coder. Qwen 2.5-Coder 14B via local Ollama (self-hosted, CPU inference).

Added after publication, documented in the update section:

- devstral. Devstral via the Mistral API.

Total slate: 8 agents, 6 model families.

## The seven-agent slate (initial Round 3)

| Slot | Framework | Editor | Hyper | Func | Bundle | Collab v1 |
|---|---|---|---|---|---|---|
| claude-opus-main | Inferno 8 | CM 6 | Kept | Kept | ~75 KB | Yes |
| claude-sonnet-plan | SolidJS | CM 6 | Dropped | Kept | ~90–100 KB | Yes |
| claude-frontend-design | SolidJS | CM 6 | Dropped | Partial | ~82 KB | Yes |
| codex | Mithril | textarea | Kept | Partial | ~37 KB | No |
| gemini-3-1 | SolidJS + `solid-js/h` | CM 6 | Kept | Partial | ~65 KB | Yes |
| claude-haiku-4-5 | SvelteKit 5 | CM 6 | Dropped | Dropped | ~54 KB | Yes |
| qwen-25-coder | SolidJS + TanStack Query + Tailwind | CM 6 | Dropped | Partial | ~65 KB | No |

## Patterns at 7 agents

- SolidJS is consensus framework (4/7). Inferno, Mithril, Svelte each have one advocate.
- Hyperscript split tightened to 3/4. Narrower than 2/2 at 4 agents, not decisively.
- CodeMirror 6 is 6/7. Codex with textarea is the lone editor-library outlier.
- Collab-in-v1: 5 yes, 2 no. Codex and qwen are the "decline the invitation" pair.
- Bundle spread: 37 KB (codex) to 100 KB (sonnet-plan). 2.7x range.

## Five observations

### 1. The CLI invocation pattern is portable

Three different runners, same shape. Invoke with a single prompt, get file output.

- Codex: `codex exec -s workspace-write 'PROMPT'`
- Gemini: `gemini --approval-mode yolo -p 'PROMPT'`
- Ollama: `echo PROMPT | ollama run qwen2.5-coder:14b`

Ollama doesn't have filesystem tools, but its stdout can be redirected to disk. All three produce schema-compliant proposals.

Adding a model is cheap once the template is locked. Every new runner is a ~10-line invocation change, not a new orchestration subsystem.

### 2. Output fidelity is a runner property, not a model property

First-party CLIs (Codex, Gemini) produce clean markdown ready for disk.

Ollama's local inference polluted output with ANSI escape codes and Braille spinner characters. The raw file needed a `sed` or Python cleanup pass before the markdown was valid.

```
⠙ ⠹ ⠸ ⠴ ⠦ ⠧ ⠇ ⠏ ⠙ ⠹ [...]```markdown
# Proposal: Modern Markdown Notes Editor
```

After stripping the `U+2800..U+28FF` Braille range and `\x1b\[.*[A-Za-z]` ANSI escapes, the content underneath was fine.

The orchestration tax is specifically on the local-inference path, not on open-weight models per se. A remote Qwen via a hosted API would probably behave like Gemini. Any future Ollama-driven run should pipe through a stripping filter by default.

### 3. Model capability shows up as depth, not schema compliance

All 7 agents hit all 11 required section headers. All addressed both required carryovers and both pinned action traces. Schema was a floor, not a discriminator.

Depth discriminator:

- Qwen 14B. 1,126 words, generic carryover reasoning ("JSX is more widely used").
- Gemini 3.1 Pro. ~2,000 words, specific hyperscript-via-`solid-js/h` engagement.
- Claude Opus / Sonnet. 2,000–2,500 words with named tradeoffs and alternatives considered.

Word counts aren't the measure. Specificity is. Qwen's "Functional approach: Partial — SolidJS supports functional AND class components" is technically on-schema and technically correct. It's also hollow. It doesn't engage with the baseline's actual functional lineage (pure reducers, point-free helpers, immutable list ops via funkia/list).

Future bakeoffs should grade on schema + depth jointly. A proposal hitting 11 headers with paragraph-level engagement per carryover is not the same artifact as one hitting 11 headers with one-sentence replies. Both pass the spot-check. Only one does the comparison work.

### 4. Smaller / older models pick "trendy and shallow" over "engaged and specific"

Qwen picked TanStack Query for localStorage (usually a server-state library, repurposed) and Tailwind (no other agent picked it). Neither wrong. Both frictionlessly plausible. Choices that sound like answers without being answers to the specific questions the brief asked.

Codex, by contrast, picked `textarea` + `micromark`. Contrarian against the CodeMirror consensus, but the reasoning is specific. "The required editor isn't an IDE, and the collaboration story is explicitly optional." Engagement with the brief's shape, not just its words.

A bakeoff with too many small or older models risks producing majority-shallow proposals that meet schema without producing comparison signal. The 7-agent slate is well-balanced because 4 of 7 are current-frontier Claude or Gemini. One more shallow-depth slot would tip the average.

### 5. Diminishing returns on slate surprise

Round 1 (4 agents): three distinct framework picks, 2/2 hyperscript split.

Round 2 adds Gemini: one new distinctive configuration (SolidJS with hyperscript via `solid-js/h`, a combination no other agent chose).

Round 3 adds Haiku (SvelteKit — new framework) and Qwen (echoes sonnet-plan's shape with different styling and state libs).

Slate diversity saturated between 4 and 7 agents for this brief. A 12-agent slate wouldn't produce 3x the new findings of a 4-agent slate. Most of the signal is in the early agents. Late additions mostly confirm or slightly reshape the splits.

For your own bakeoff: four agents is the minimum interesting, six is the sweet spot, eight is thorough. Beyond that is noise. Drop slots that won't change the consensus-or-disagreement shape.

## Three operational risks

### Model ID churn is real-time

The slate-research doc from that same afternoon recommended Qwen3-Coder-Next. My local Ollama had only Qwen 2.5-Coder. Ran 2.5. That represents Qwen's September 2024 generation, not April 2026. Gemini is on 3.1, not 3.0 (the 3 Preview silently deprecated within weeks). Qwen's OAuth endpoint was discontinued three days before the research ran.

A bakeoff needs a model-ID-at-run-time field. Not just which slot a proposal occupies, but which specific model snapshot produced it. Otherwise a year later, "the Qwen proposal" is just "Qwen of some indeterminate era."

### Subagent permission walls keep returning

Every round, some fresh permission edge case blocks subagents from running the thing they need.

- Round 1 3-day/1-week. `pnpm install` denied.
- Round 2 Act 2 instrumented. `pnpm build` wall despite allowlist patches.
- Round 3 Qwen orchestration subagent. Bash tool denied outright.

Orchestrator-in-main-thread is the reliable workaround, but adds toil. A proper bakeoff runner would need to either run everything from a process with full Bash scope, or use a permission model that routes allowlists to subagents predictably.

### Open-weight is cost-free but slow

Qwen 14B on CPU took ~10 minutes to produce 1,126 words. Scaling to similar models means ~30 minutes per proposal, ~2 hours for a 4-agent open-weight round. Tractable. Also means open-weight slots lag first-party-CLI slots by an order of magnitude in wall-clock.

## Update — Round 3 closed at 8 agents

Written hours after the main post. Two more runs attempted.

### Devstral ran

Via `curl` against `api.mistral.ai/v1/chat/completions`. Same bakeoff prompt template used for Qwen. One-shot, no retries. Clean markdown with a leading ` ```markdown ` fence that stripped trivially.

973 words. The same "shorter than frontier Claude/OpenAI" pattern Qwen exhibited. A two-data-point pattern, not a one-off.

Devstral's picks:

- Lexical as the editor library. Nobody else picked it. Second editor-library outlier after codex.
- SolidJS 2.0, a speculative version. Actual SolidJS is at 1.9.x. Another small confident-wrong hallucination, matching codex's non-existent `@vanilla-extract/vite-plugin@^4.0.21` in Round 1.
- Bundle estimate 56 KB, third-lowest in the slate.

### Kimi K2.5 attempted, didn't ship

User provided a Moonshot key. The `/models` endpoint returned HTTP 200. The chat completion endpoint returned HTTP 429 with body:

> Your account is suspended due to insufficient balance, please recharge your account or check your plan and billing details.

Moonshot's public API requires prepaid credits. No free tier for chat completions. A valid-looking key from an unfunded account returns 429 (not 401), which is misleading. Exponential backoff through five attempts and ~5 minutes of waiting. Every retry hit the same suspension. Closed Kimi as deferred.

### API keys don't always mean API access

A valid authentication token doesn't guarantee a callable endpoint. Payment-gate errors can look like rate limits in the response code (`429`) while being operationally different (account suspension, quota exhaustion, plan limits).

A production bakeoff runner should inspect the response body, not just the status code. Budget for the fact that some slate candidates will fail at the billing gate rather than the model gate.

## Final slate (8 agents, closed)

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

## Working assumptions for your own bakeoff

- Four to six agents in the slate.
- One proposal per agent, same brief, schema with required-specific carryovers.
- Prefer first-party CLIs where they exist. Ollama for open-weight, with a cleanup filter.
- Grade on schema + depth, not schema alone.
- Pin model IDs explicitly. Expect them to drift within months.
- Inspect response bodies, not just status codes.

Full slate artifacts: [proposals/](https://github.com/acald-creator/agent-bakeoff/tree/main/proposals). All eight proposals and the slate research doc in the repo.
