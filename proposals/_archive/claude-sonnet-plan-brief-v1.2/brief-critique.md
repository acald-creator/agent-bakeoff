# Brief critique — claude-sonnet-plan

*Pilot feedback for patching v1.2 before the remaining agents receive it. ~500 words.*

---

## Ambiguity I had to resolve

**"Could plausibly become collaborative" is doing a lot of work.**
The phrase appears in the brief's framing but only the collab bonus section provides any concrete guidance. I had to guess how much this framing should influence the single-user architecture choices (editor library, state shape, persistence format). I leaned into it: the choice of CodeMirror 6 over a textarea is partly justified by the Y.js integration path. A different agent might read "plausibly collaborative" as flavor text and choose a simpler editor. This produces non-comparable proposals — one agent's architecture looks heavy for single-user use unless you know they were optimizing toward the collab path.

**Suggested patch:** Add one sentence to the "What the app must do" section clarifying whether the collab bonus is expected to influence v1 architecture decisions, or whether v1 should be built as if collab will never happen.

**The `Architecture sketch` section asks for "how a 'toggle complete' travels through the system."**
This is a direct callout to the baseline's todo-toggle action. The new app has no "toggle complete" — it's a notes editor. I substituted "rename note" as the equivalent user-action walkthrough. Other agents may walk through "create note" or "save to localStorage," producing structurally incomparable sections. The brief should update the example action to match the new app spec (e.g., "how saving a note travels through the system").

---

## Missing context

**No guidance on visual fidelity expectations.**
The brief is silent on whether this is a developer tool (dense, keyboard-driven, minimal chrome) or a consumer notes app (polished UI, animations, mobile-friendly). This is actually fine for the bakeoff — it's a legitimate axis of differentiation — but it means proposals will vary in a dimension that is about taste, not technical merit. Worth acknowledging in the verdict post framing.

**No minimum or maximum dependency count guidance.**
One agent might propose a zero-dependency vanilla implementation; another might include 25 packages. Both are valid under the brief. The evaluation criteria ("coherence") covers this somewhat, but the bundle-size estimate row in the stack table implies the grader cares about weight. Clearer guidance would help.

---

## Constraints that felt wrong

**1,500–2,500 word target for the README.**
The required section headers push toward a longer document — the stack table, file tree, five code sketches, tradeoffs, carryovers, and collab bonus each need meaningful content. I ended up around 2,400 words with the collab bonus included. Agents who skip the bonus will struggle to hit 1,500 without padding. The lower bound might be better set at 1,200 or the bonus section should count toward the target explicitly.

**"Supporting files are optional but recommended" is too weak.**
The `package.json` is necessary for the bundle-size estimate to be credible, as the brief itself notes ("so the bundle-size estimate has teeth"). Making it required would produce more comparable outputs.

---

## Schema friction

**The `## Agent` → `Independence` field is underspecified.**
High/medium/low independence from *what*? From the other agents? From the brief's implied answers? From my training data? I interpreted it as "did I have prior context about this specific bakeoff" (no) and rated it high. Another agent might rate it medium because their training data biases them toward certain stacks. A brief note on what the field is measuring would reduce variance.

**The `## Stack` table mixes concerns.**
The "Why this over alternatives" column is doing a lot of work — it conflates "why this tool" with "why not the other three specific tools I considered." For dense rows like Framework this is fine. For rows like Language (where TS is the obvious answer) it produces filler. Consider splitting into separate required vs. open-ended rows, or just accepting that some rows will be short.
