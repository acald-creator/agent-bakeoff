# Why an Agent Bakeoff — Post 0

*The framing post for an 8-part series. If you land here cold, this is the one that explains what the series is and why it exists.*

---

I had a 2022 todo app rotting in a repo. The kind of fork-and-tinker thing that used Inferno because the author liked Inferno, hyperscript because the author liked hyperscript, and Webpack 5 because that's what 2022 had. Last commit January 2022. Pinned to Node 9.11.1. Wouldn't run on a current toolchain without intervention.

I could have just modernized it. Drop in Vite, bump everything to TypeScript 5, swap Webpack for Rolldown, push to Cloudflare Pages, ship a tweet. Two weekends, done.

I did the other thing. I wrote a brief, gave it to four AI agents, and asked each one — independently, without telling them what the others picked — how *they* would build a 2026 rebuild from scratch. Different framework, different state strategy, different build tool, different editor library, different deploy story. Then I'm reading the four proposals side-by-side and building the chosen one under three different time budgets.

This series is the writeup. Eight posts. You're reading post 0.

## What this is, exactly

It's not a "best AI agent" contest. The interesting thing about asking four agents the same open-ended design question isn't which one wins — it's where they agree, where they split, and what each model treats as obvious that the others don't.

The premise has three moves:

1. **Take a frozen 2022 codebase as a complexity reference.** Not a literal starting point. The bakeoff doesn't ask agents to modernize the existing app in place. It asks them to build something fresh of similar scope. The 2022 baseline anchors what "weekend scope" means without dictating the choices.

2. **Pivot the spec.** Todo apps are overrated as comparison fodder. The real spec is a single-user markdown notes editor that could plausibly become collaborative. Markdown editors surface the editor-library decision (CodeMirror? ProseMirror? TipTap? plain `<textarea>`?) as a real architectural choice, which a todo app doesn't.

3. **Run it as two acts.** Act 1 is a design-off — four agents, same brief, four proposals. Act 2 is a build-off — same chosen design, same agent, three time budgets. Act 1 surfaces what each model thinks is right. Act 2 surfaces what time pressure does to model code.

If you've read pieces about LLM coding by now, most of them are single-agent reports: "I built X with Claude" or "Cursor wrote this for me." Useful, but bounded by one model and one author. This series is structured to let the comparison itself be the content — you can't argue about whether SolidJS or Inferno is the right 2026 choice if you only ever read the SolidJS person's writeup.

## Why these four agents

The slate is deliberate, and each slot has a stated value.

- **Codex** (via the Codex CLI) — different model family. The cleanest "second opinion" signal in the slate. Codex is a non-Claude model, run from a fresh subagent context. If three Claude variants agree on something and Codex disagrees, that disagreement carries real weight.
- **Claude Sonnet via the Plan subagent** — planning-first. Fresh context, no orchestration history, oriented toward explicit architectural reasoning over implementation polish. The "what would a careful planner pick?" slot.
- **Claude Opus, main-thread (this conversation)** — informed insider. The orchestrator's own proposal, written from the same context where the brief was drafted. Named explicitly because excluding it would be dishonest about who's writing the series; including it discloses the bias rather than hiding it.
- **Claude + the `frontend-design` skill** — UX-first. A subagent run with a design-leaning skill in scope. The slot that treats user experience and visual design as primary inputs to the architecture decision rather than afterthoughts.

The slate mixes two axes: different *models* (Codex vs. Claude family) and different *lenses* (planning-first vs. UX-first vs. informed-insider). That's not a controlled experiment. It's a survey of the design space, disclosed as such. A controlled version would be the same model in four different prompt configurations, or four different models on identical prompts. This series is more honest about what's available and more interesting because of it.

There's also an open slot we *didn't* fill — a "no framework, vanilla web components only" constrained brief. We deliberately dropped it because that's a brief variation, not a different agent, and we'd rather run it as a future round than confound the slate.

## What's at stake

I went into this with one prediction: four agents would pick four different frameworks, and the comparison post would be a tour of 2026's framework landscape.

That prediction was partially wrong, in a way that's more interesting than if it had been right. (No spoilers — that's post 4.)

What I want this series to do, by the time you finish post 7:

- Give you a concrete, side-by-side read on how four agents reason through the same open architectural question
- Show what consensus and disagreement looks like across models when the choice is open
- Surface what time pressure does to LLM code in practice, not just in theory
- Be honest about the orchestration biases — including mine — that shape the result

I don't think this series will tell you which AI agent to use. I do think it'll tell you something about *how* to use multi-agent orchestration as a design tool, and what kinds of questions are worth asking more than one model about.

## The series shape

Eight posts. Two acts. Roughly:

| # | Act | Title | What it covers |
|---|---|---|---|
| 0 | — | Why an agent bakeoff | This post |
| 1 | — | What's in the box | Tour the 2022 baseline as it actually is |
| 2 | 1 | The brief | The prompt every agent gets — and the four iterations it took to survive contact |
| 3 | 1 | The proposals | All four proposals, side-by-side, on their own terms |
| 4 | 1 | The verdict | Comparison matrix + the chosen design |
| 5 | 2 | The build-off + 1-day build | Rules of Act 2 + the first time-pressure build |
| 6 | 2 | 3-day vs 1-week | The longer budgets, side-by-side with the 1-day |
| 7 | 2 | What time pressure does to LLM code | Meta-takeaways from the whole series |

Order of publishing won't strictly match order of work — posts 0, 1, and 2 can ship while the proposals are still being collected, and Act 2 doesn't start until the chosen proposal exists. But the read order is the listed order.

## A note on what this isn't

It's not benchmarks. There's no "agent X scored 8.4/10 on the proposal rubric" anywhere in this series. The brief specifies five evaluation lenses (coherence, justification quality, honest tradeoffs, buildability, surprise value) and the verdict post applies them, but no single-number scoring. That choice is deliberate: the comparison is more interesting as prose than as a leaderboard.

It's also not a "Claude beats Codex" or "Codex beats Claude" piece. The verdict post picks one proposal to build in Act 2, but the reasoning is openly stated, the runner-up is named, and the orchestration biases are disclosed. Disagreeing with the pick is supposed to be a reasonable response to reading the verdict post.

## What you can do as a reader

- Disagree with the pick. Comments are open on every post.
- Re-run any of the slots yourself if you have the appetite. The brief is published in full, the proposals are public, and the four agent identities (Codex, Claude Sonnet via Plan, Claude Opus main-thread, Claude + frontend-design) are reproducible.
- Treat the series as a template. The "agent-bakeoff" format isn't todo-specific or notes-app-specific. Future rounds could swap baselines, swap apps, or swap slates entirely.

The next post — [What's in the Box](post-01-whats-in-the-box.md) — walks the 2022 baseline. Then [The Brief](post-02-the-brief.md), then [The Proposals](post-03-the-proposals.md), then [The Verdict](post-04-the-verdict.md).

Settle in.

---

*Series: Post 0 of 8. Next: [What's in the Box](post-01-whats-in-the-box.md).*
