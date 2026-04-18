# Why an Agent Bakeoff

A 2022 todo app was sitting in a repo I'd forked years ago. `functionalHyperscriptTodoList`, by Leonardo Saracini. Inferno 7, Redux 4, Webpack 5, about 15 small TypeScript files across 26 maintenance commits. Last commit was January 2022, pinned to Node 9.11.1. It wouldn't run on anything current.

Rather than modernize it in place, I wrote a brief and handed it to four AI agents. Independent runs, blind to each other, same question each time. How would you build a 2026 rebuild from scratch? Then planned to build the chosen design under three time budgets.

The comparison is the content. Not any one rebuild, not a winner. Where the agents agree, where they split, and what each model treats as obvious.

## Two acts

Act 1 is the design-off. Four agents, one brief, four proposals.

Act 2 is the build-off. Same design, same agent, three time budgets. What time pressure does to model code.

The 2022 codebase is a complexity reference, not a starting point. Agents don't modernize in place, they build something fresh of similar scope. The brief doesn't ask for another todo app either. Todo apps don't force a real editor-library decision, and the editor pick is where the interesting architectural differences live. The brief asks for a single-user markdown notes editor that could plausibly become collaborative. Markdown forces the pick between CodeMirror, ProseMirror, TipTap, or plain `<textarea>` into the open.

## The slate

Four agents, picked for what each brings.

- Codex via Codex CLI. Different model family from Claude, cleanest second-opinion signal in the slate. If three Claude variants agree and Codex disagrees, that disagreement carries weight.
- Claude Sonnet via the Plan subagent. Planning-first, fresh context, oriented toward architectural reasoning over implementation polish.
- Claude Opus on the main thread. My own proposal, written from the same context where the brief was drafted. Included because excluding it would hide the bias rather than disclose it.
- Claude plus the `frontend-design` skill. UX-first, a subagent with a design-leaning skill in scope.

Two axes mixed together. Model family (Codex vs Claude) and lens (planning, UX, insider). A design-space survey, not a controlled experiment. A controlled version would be one model across four prompt configurations, or four models on identical prompts. This is neither.

A fifth slot got considered and dropped: no framework, vanilla web components only. That's a brief variation, not a different agent. Queued for a future round.

## What this is not

Not benchmarks. No single-number scoring. The brief specifies five evaluation lenses (coherence, justification quality, honest tradeoffs, buildability, surprise value) and the verdict post applies them qualitatively.

Not "Claude beats Codex" or "Anthropic beats OpenAI." The verdict post picks one proposal to build in Act 2, but the reasoning is stated openly, the runner-up is named, and the biases are disclosed. Disagreeing with the pick is a reasonable response.

Not a prescription. The series doesn't claim to know which AI agent you should use.

## If you want to run one

The brief is public. The agents are reproducible. Codex CLI, Claude Sonnet via subagent, Claude Opus from the main thread, Claude with the frontend-design skill. Swap the baseline, swap the app, swap the slate. The format isn't tied to todo apps or notes apps.

Next: [What's in the Box](post-01-whats-in-the-box.md) walks the 2022 baseline.
