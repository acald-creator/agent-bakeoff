# Brief critique — v1.3

## Did the three v1.3 patches land cleanly?

**Collab-in-v1 declaration (patch a):** Landed cleanly. The required "Collab considered in v1 design: yes / no" field in the Agent header is unambiguous and forces a specific claim rather than a vague "we thought about collab." One minor friction: the brief says to declare which decisions it influenced, but the field label says only "yes / no — and if yes, which v1 decisions." The "and if yes" qualifier is well-placed, but the output schema table shows the field on a single line — agents may truncate it to a bare "yes" in the table and omit the influenced-decisions detail. Recommend the schema example show a multi-line field or move the "which decisions" clause to a separate required bullet.

**Pinned architecture-trace actions (patch b):** Landed cleanly. "Save an edit to a note" and "switch to a different note" are well-chosen: they probe different concerns (persistence pipeline vs. state/editor coordination) and are specific enough to produce structurally diff-able answers across agents. The old "toggle complete" placeholder was obviously wrong for a notes app, so this is a clear improvement. No new ambiguity introduced.

**Removed Independence field (patch c):** Landed cleanly. Self-rated independence is meaningless (agents have no ground truth about what the others are proposing), so removing it is the right call. No gap created — the orchestrator fills it in post-comparison.

## New ambiguities introduced by v1.3

**"Which v1 decisions it influenced" is under-specified.** The declaration asks agents to name influenced decisions, but there is no guidance on granularity. An agent that picked CodeMirror 6 "partly for Y.js" and picked a string-based note schema "partly for CRDT compatibility" should list both. But what about framework choice? If you picked SolidJS over Svelte partly because SolidJS's effect model makes sync adapters cleaner, is that collab-influenced? The line between "informed by collab" and "coincidentally compatible with collab" is blurry. This could produce incomparable answers even with the declaration present.

**Editor library justification interacts with the collab declaration.** The brief says to "name [the editor library] and justify it." It separately asks for the collab declaration. An agent that picked CodeMirror 6 for purely editor-quality reasons (excellent accessibility, extension API, performance) but notes it also has a Y.js path must distinguish between the reason for the pick and the happy side effect. Without an explicit instruction to separate "primary reason" from "collab compatibility," agents may conflate them and the comparison post will mix pure-editor arguments with collab-motivated arguments.

## Still missing or unclear

**Bundle size estimate methodology** is unanchored. The brief asks for "Estimated bundle size (gzipped)" but gives no guidance on what to include (full app? just JS? JS + CSS? excluding editor libraries?). Different agents will estimate different things and the numbers will not be comparable. A one-sentence note like "estimate your JS-only gzipped production bundle including all dependencies" would make the column diff-able.

**Search behavior for the split-view toggle** is absent. The spec says the editor should have "live preview (split-view, toggle, or your call)" but does not say whether the toggle state persists across note switches or across sessions. This is genuinely open and agents will make different default choices. Not a fatal ambiguity — the brief explicitly says "your call" — but worth flagging as a source of natural divergence in the proposals.

**No word on accessibility.** The brief lists no accessibility requirement. For a comparative post, this means agents can entirely ignore it without penalty, which seems like an unintentional omission for a 2026 app. Worth a one-liner in "hard constraints" or "open choices" either way (required or explicitly not required).
