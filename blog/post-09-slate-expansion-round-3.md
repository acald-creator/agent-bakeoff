# Slate Expansion — Post 9

*The first post where the series extends past the original 8-post arc. Not because the story asked for a sequel — because the methodology did.*

---

The original series landed at 8 posts. Posts 0–7 covered Act 1 (the design-off with 4 agents) and Act 2 (the build-off with 3 time budgets). Post 8, added after the instrumented round, sharpened the Act 2 claim into a sweet-spot finding. That was supposed to be the ending.

Then the question of whether the bakeoff *format* itself was model-portable started to matter more than whatever individual finding came out of any round. This post is about running that experiment.

## The setup

Same brief (v1.4). Same 11-section proposal schema. Same pinned carryovers. Three new slots added to the original 4-agent slate:

- **gemini-3-1** — Gemini 3.1 Pro via first-party `gemini-cli`
- **claude-haiku-4-5** — Anthropic's fast Claude variant, via subagent (same pattern as the existing Claude slots)
- **qwen-25-coder** — Qwen 2.5-Coder 14B via local Ollama (open-weight, self-hosted, CPU inference)

That brings the slate to 7 agents across 5 distinct model families. Slate research also surfaced Devstral 2 (Mistral, coding-specialized) and Kimi K2.5 (Moonshot AI) as high-value additions requiring API keys — deferred to a potential Round 4.

## The seven-agent slate at a glance

| Slot | Framework | Editor | Hyperscript | Functional | Bundle est. | Collab in v1 |
|---|---|---|---|---|---|---|
| claude-opus-main | Inferno 8 | CodeMirror 6 | **Kept** | Kept | 75 KB | Yes |
| claude-sonnet-plan | SolidJS | CodeMirror 6 | Dropped | Kept | 90–100 KB | Yes |
| claude-frontend-design | SolidJS | CodeMirror 6 | Dropped | Partial | 82 KB | Yes |
| codex | Mithril | textarea | **Kept** | Partial | 37 KB | No |
| gemini-3-1 | SolidJS + `solid-js/h` | CodeMirror 6 | **Kept** | Partial | 65 KB | Yes |
| claude-haiku-4-5 | SvelteKit 5 | CodeMirror 6 | **Dropped** | **Dropped** | 54 KB | Yes |
| qwen-25-coder | SolidJS + Tailwind + TanStack Query | CodeMirror 6 | Dropped | Partial | 65 KB | No |

Patterns at 7:
- **SolidJS is consensus** (4/7). Inferno, Mithril, and Svelte each have exactly one advocate.
- **Hyperscript splits 3/4** (kept/dropped) — the gap widened slightly from the original 2/2 but not decisively.
- **CodeMirror 6 is 6/7** — codex with textarea is the lone editor-library outlier.
- **Collab-in-v1: 5 yes / 2 no** — codex and qwen are the "decline the invitation" pair.
- **Bundle spread: 37 KB to 100 KB** — 2.7× range, driven almost entirely by whether an agent picked a dedicated editor library and what they imported from it.

## Five observations from running this

### 1. The CLI invocation pattern is genuinely model-portable

Three different runners, same shape: invoke with a single prompt, get file output. Codex (`codex exec -s workspace-write 'PROMPT'`) and Gemini (`gemini --approval-mode yolo -p 'PROMPT'`) both write files to disk via shell access. Ollama (`echo PROMPT | ollama run qwen2.5-coder:14b`) doesn't have filesystem tools, but its stdout can be redirected to disk directly. All three produce a schema-compliant proposal.

That matters for the bakeoff format's future use. **Adding a model is cheap once the template is locked.** Every new runner is a ~10-line invocation change, not a new orchestration subsystem.

### 2. Output fidelity is a runner property, not a model property

First-party CLIs (Codex, Gemini) produce clean markdown ready for disk. Ollama's local inference polluted output with ANSI escape codes and Braille spinner characters — the raw file needed a `sed` / Python cleanup pass before the markdown was valid. Before cleanup:

```
⠙ ⠹ ⠸ ⠴ ⠦ ⠧ ⠇ ⠏ ⠙ ⠹ [...]```markdown
# Proposal: Modern Markdown Notes Editor
```

After stripping the `U+2800..U+28FF` Braille range and `\x1b\[.*[A-Za-z]` ANSI escapes, the content underneath was perfectly fine.

**This is an orchestration tax specifically on the local-inference path, not on open-weight models per se.** A remote Qwen invocation via a hosted API would likely behave like Gemini. If the bakeoff goes public-facing, all future Ollama-driven runs should pipe through a stripping filter by default.

### 3. Model capability shows up as depth, not schema compliance

Every agent hit all 11 required section headers. Every agent addressed both required carryovers and both pinned action traces. *Schema was a floor, not a discriminator.*

The real discriminator was depth:

- Qwen 14B — 1,126 words, generic carryover reasoning ("JSX is more widely used")
- Gemini 3.1 Pro — ~2,000 words, specific hyperscript-via-`solid-js/h` engagement
- Claude Opus/Sonnet — 2,000–2,500 words with named tradeoffs and alternatives considered

The word counts aren't the measure; the specificity is. Qwen's "Functional approach: Partial — SolidJS supports functional AND class components" is technically on-schema and technically correct. It's also hollow — it doesn't engage with the baseline's actual functional lineage (pure reducers, point-free helpers, immutable list ops via funkia/list). The section is present; the *reasoning* isn't.

**Future bakeoffs should grade on schema + depth jointly.** A proposal that hits all 11 headers with paragraph-level engagement per carryover is not the same artifact as one that hits all 11 headers with one-sentence replies. Both pass the spot-check. Only one does the comparison work.

### 4. Smaller / older models pick "trendy and shallow" over "engaged and specific"

Qwen picked TanStack Query for localStorage (usually a server-state library, repurposed here) and Tailwind (no other agent picked it). Neither is wrong. Both are *frictionlessly plausible* — choices that sound like answers without being answers to the specific questions the brief asked.

Compare to Codex picking `textarea` + `micromark` for the editor: that's contrarian against the CodeMirror consensus, but the reasoning in the proposal was specific ("the required editor is not an IDE, and the collaboration story is explicitly optional"). That's engagement with the brief's shape, not just the brief's words.

This matters for slate design. **A bakeoff with too many small/older models risks producing majority-shallow proposals that meet schema but don't produce comparison signal.** The 7-agent slate is well-balanced because 4 of the 7 are current-frontier Claude or Gemini variants; the 2 specialist slots (Codex, Qwen) sit adjacent to real engagement thanks to their framing. One more shallow-depth slot would tip the average.

### 5. Each new model yields diminishing returns on slate surprise

Round 1's 4 agents produced 3 distinct framework picks and a 2/2 hyperscript split. Round 2 (adding Gemini) added *one* new distinctive configuration (SolidJS with hyperscript via `solid-js/h` — a combination no other agent chose). Round 3 (Haiku, Qwen) added one new framework pick (Svelte) and one near-duplicate (Qwen echoed the Sonnet-plan shape with different styling and state libs).

**The slate's diversity saturated somewhere between 4 and 7 agents for this specific brief.** A 12-agent slate wouldn't produce 3× the new findings of a 4-agent slate. Most of the signal is in the early agents; the late additions mostly confirm or slightly reshape the splits the first few revealed.

If you're designing your own bakeoff: **four agents is the minimum interesting slate; six is the sweet spot; eight is thorough; beyond that is noise.** Drop slots that aren't going to change the consensus-or-disagreement shape.

## What this round didn't test

- **Frontier competitors outside OpenAI/Anthropic/Google** — Devstral 2 (Mistral) and Kimi K2.5 (Moonshot AI) both scored within range of the existing frontier agents on SWE-bench Verified. Both were deferred for API-key reasons, not technical ones. They remain the most promising Round 4 additions.
- **Act 2 instrumented mode with the expanded slate.** Round 2's instrumented build-off used only the `claude-frontend-design` proposal. Testing whether Gemini or Haiku produce different Act-2 behavior (fewer cross-cutting vanilla-extract errors? smaller bundles under time pressure?) is an obvious next experiment.
- **Cross-runner parity of "agent behavior."** The Gemini slot's proposal was one-shot from the CLI; the Qwen slot's was one-shot-then-cleanup. Whether that affected the content is impossible to say from a single run each. Multiple runs per model to establish variance is a real missing piece.

## Operational risks learned

### Model ID churn is real-time

The slate-research document from earlier this afternoon recommended Qwen3-Coder-Next; my local Ollama has Qwen 2.5-Coder. The 2.5 model ran fine but represents Qwen's September 2024 generation, not April 2026. Gemini is now on 3.1, not 3.0 (the 3 Preview was silently deprecated within weeks). Qwen's OAuth endpoint was discontinued three days before the research was run.

**The bakeoff needs a "model-ID-at-run-time" field** — not just which slot a proposal occupies, but which specific model snapshot produced it. Otherwise a year later, the "Qwen proposal" is just "Qwen of some indeterminate era."

### Subagent permission walls keep returning

Every round, some fresh permission edge-case blocks subagents from running the thing they need. Round 1 3-day/1-week: pnpm install denied. Round 2 Act 2 instrumented: pnpm build wall despite allowlist patches. Round 3 Qwen orchestration subagent: Bash tool denied outright. Orchestrator-in-main-thread is the reliable workaround but adds toil — the user ends up reimplementing the permission-elevated call themselves.

A proper bakeoff runner (for anyone wanting to reproduce this format) would need to either run everything from a process with full Bash scope, or use a permission model that routes allowlists to subagents predictably.

### Open-weight = cost-free but slow

Qwen 14B on CPU took ~10 minutes to produce 1,126 words. Scaling to Devstral 2 via Ollama (similar size) and similar models would mean ~30 min per proposal, ~2 hours for a 4-agent open-weight round. That's tractable; it also means open-weight slots should be expected to lag first-party-CLI slots by an order of magnitude in wall-clock.

## Where this leaves the series

Nine posts. Two rounds of Act 2. One slate expansion. A clean finding at each stage.

The series' central claim from post 7 — *"within write-only methodology, iteration headroom without verification headroom produces strictly worse outcomes"* — stands. Post 8 refined it with the sweet-spot observation from Round 2's instrumented builds. This post refines the *format itself* into something reproducible.

If you're building an LLM coding-comparison experiment of your own, take these as working assumptions:

- 4–6 agents in the slate
- 1 proposal per agent, same brief, schema with required-specific carryovers
- Prefer first-party CLIs where they exist; Ollama for open-weight with a cleanup filter
- Grade on schema + depth, not schema alone
- Pin model IDs explicitly; expect them to drift within months

The repo has all the evidence. Slate expansion to Devstral 2 and Kimi K2.5 is queued for whenever API keys are available.

---

*Series: Post 9 of an originally-8-post arc. Previous: [Act 2, Again — With Feedback](post-08-act-2-instrumented.md).*

*Full slate artifacts: [proposals/](../proposals/). Seven proposals, one brief, four CLI patterns demonstrated portable.*

*Slate research doc: [slate-research-2026-04.md](slate-research-2026-04.md). Round 4 candidates (Devstral 2, Kimi K2.5) documented and awaiting API keys.*

---

## Update — Round 3 closed at 8 agents

*Written hours after the main post. Two more runs attempted after publication. Including for the record.*

**Devstral (Mistral) ran.** The user provided a Mistral API key; I called `devstral-medium-latest` (pinned as `devstral-medium-2512`) via `curl` against `api.mistral.ai/v1/chat/completions` with the same bakeoff prompt template I'd used for Qwen. One-shot; no retries; came back clean markdown with a leading `\`\`\`markdown` fence that stripped trivially. Produced the slate's eighth proposal at 973 words — the same "shorter than frontier Claude/OpenAI" pattern Qwen exhibited, so now a *two-data-point* pattern rather than a one-off.

Devstral's distinctive picks: **Lexical** as the editor library (nobody else picked Meta's newer editor), a speculative `SolidJS 2.0` version number (SolidJS is actually at 1.9.x — another small confident-wrong hallucination, matching the pattern codex hit in Round 1 with a non-existent `@vanilla-extract/vite-plugin@^4.0.21`). Bundle estimate 56 KB, third-lowest in the slate.

**Kimi K2.5 (Moonshot AI) attempted, didn't ship.** User provided a Moonshot key; probing the API returned `HTTP 429` with the body: *"Your account is suspended due to insufficient balance, please recharge your account or check your plan and billing details."* Moonshot's public API requires prepaid credits — no free tier for chat completions, and a valid-looking key from an unfunded account returns 429 (not 401), which is misleading. Tried exponential backoff through five attempts and ~5 minutes of waiting; every retry hit the same suspension message. Closed Kimi as deferred.

This is actually a new operational finding worth flagging alongside the "model ID churn" and "subagent permission walls" risks post 9 named above:

**API keys don't always mean API access.** A valid authentication token doesn't guarantee a callable endpoint. Payment-gate errors on free tiers can look like rate limits in the response code (`429`) while being something operationally different (account suspension, quota exhaustion, plan limits). Any production bakeoff runner should inspect the response body, not just the status code — and budget for the fact that some slate candidates will fail at the billing gate rather than the model gate.

**The slate stays at 8 agents** for this round's story. Adding Kimi would require ~$5-10 of prepaid Moonshot credits, which is cheap but out-of-scope for the run; it's queued for a Round 4 if the series continues.

The post-9 claim about diminishing returns on slate surprise held up across Devstral's addition. The framework mix didn't grow (SolidJS tightened to 5/8); the editor-library spread widened by one (Lexical joined textarea as an outlier against the CodeMirror consensus); the carryover splits stayed roughly balanced. None of these move the central observations from post 9 — they just add one more data point behind each.

**Final slate (8 agents, closed):**

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
