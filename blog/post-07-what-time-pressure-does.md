# What Time Pressure Does to LLM Code — Post 7

*The last post of the series. Three builds, three budgets, one meta-finding. And a couple of things we didn't expect to learn.*

---

I started this series thinking the interesting question was: *what do different AI agents pick when given the same open architectural brief?* The proposals were the answer to that question. They're good answers — four agents, four coherent positions, patterns worth a comparison post.

Then Act 2 happened, and the interesting question shifted. The three-build experiment wasn't supposed to produce a meta-finding about LLM coding behavior under time pressure. It was supposed to produce a clean progression: less budget ⇒ less polish, more budget ⇒ more polish. I would compare the three builds, pick favorite details from each, note some patterns, and move on.

That prediction was wrong in a way that's more informative than if it had been right.

## The finding, stated plainly

**Within Act 2's methodology — write-only, no live build feedback — adding iteration headroom without adding verification headroom produces strictly worse outcomes.**

The budget curve wasn't monotonic:

- 1-day: builds. 219 KB bundle. 2.8× over target.
- 3-day: doesn't build. Three independent API mistakes.
- 1-week: builds after an orchestrator rename. 533 KB bundle. 6.5× over target.

The 1-day agent had the least time and produced the only shippable artifact. The 1-week agent had the most time and produced the largest bundle, the most unbuilt dependencies, and the same category of API mistakes the 3-day agent made. The extra budget did not translate into either more polish or more correctness. It translated into more code.

This is not a claim about LLMs in general. It's a claim about LLMs when their only feedback channel is their own inspection of their own output. Which is exactly the constraint Act 2's methodology imposed, and the reason it imposed it.

## Why "write-only" happened

The original Act 2 plan had each builder agent run `pnpm install` and `pnpm build` itself. Verify its own work. Measure its own bundle. Iterate against real errors. The original Act 2 rules even said so.

That plan survived three permission walls and died. The Bash permission system in Claude Code's subagent context resolves against the primary project's settings file, and the session I was running Act 2 from had its primary project set elsewhere. Three 1-day pilot attempts hit the wall. I wrote explicit allow rules into `.claude/settings.local.json`. They didn't apply. I moved them. They still didn't apply.

Rather than delay Act 2 indefinitely while I solved the permission routing, I pivoted the methodology:

> The agent writes code self-paced. The orchestrator runs `pnpm install` + `pnpm build` and measures the bundle after the agent stops. No verification feedback reaches the agent mid-run.

This is a cleaner experiment design — it isolates "LLM coding behavior under time pressure" from "build infrastructure friction." But it's also a *more restrictive* experiment. A production LLM coding agent — Cursor, Codex, Claude Code itself — has some form of live feedback, whether through compilation errors surfaced in the IDE, a watch mode, or the developer running the code after each change. Act 2 removed all of that.

The data that came out is specifically data about agents without that feedback. Keep that in mind while reading the rest of this post.

## What three budgets look like

The 1-day agent writes plain, safe code. It cuts vanilla-extract because the extra build plugin is "failure surface." It cuts tests because "tests earn their keep at 3-day+." It picks `@codemirror/language-data` (the generic "all languages" import) over `@codemirror/lang-markdown` (the minimal correct one) because flexibility is the more available reflex when you don't have time to think. It ships code that runs, with a bundle 2.8× over target. The aesthetic is recognizable, not fully realized.

Honest self-disclosure: strong. The 1-day agent's `build-notes.md` calls its own bundle estimate "unverified" and its functional verbs "5/5 coded, cannot confirm without running." The agent was right that it didn't know. It was wrong about what it would measure.

The 3-day agent takes the time the 1-day agent didn't have and spends it on tools it doesn't fully understand. It reaches for vanilla-extract but doesn't remember that the file has to end in `.css.ts`. It reaches for `globalStyle()` and conflates its API with `style()`. It picks a version pin for `@vanilla-extract/vite-plugin` that isn't a real version. It ships code that doesn't build.

Honest self-disclosure: false. The 3-day agent's final message claimed *"Everything looks correct. The build is complete."* Both statements were structurally unverifiable.

The 1-week agent does everything the 3-day agent did, plus tests, plus manual chunk configuration, plus mobile responsive, plus six "evolved beyond the proposal" improvements, plus 27 source files total. It makes the same `tokens.ts` vs `tokens.css.ts` mistake the 3-day agent made. It adds 11 TypeScript errors on top. It uses `manualChunks` to produce a bundle 2.4× larger than the 1-day version's bundle.

Honest self-disclosure: partial. The 1-week agent correctly discloses that it didn't verify the build. It also estimates the bundle at ~82 KB. The measured bundle is 6.5× that.

## The repeat mistake

This is the finding I didn't expect.

Both the 3-day and 1-week agents — two separate fresh subagent contexts, no shared memory — made the identical `tokens.ts` vs `tokens.css.ts` mistake. Same file name. Same vanilla-extract API error. Same failure mode. Fixed by the same one-line orchestrator rename in both cases.

The 1-week agent had **4× the iteration budget and 10× the time budget of the 3-day agent.** The extra budget produced *no new insight into vanilla-extract's convention*. It produced the same mistake against a larger code surface — the 1-week version had four consumers of `tokens` to break instead of the 3-day's one.

Restated: **iteration headroom does not help an agent understand a tool it was going to misuse anyway.** What would help is running the tool and watching it fail. Both agents could have caught this in the first 60 seconds of a `pnpm build`. Neither did, because neither ran one.

## Elaboration without verification

The 1-week agent's `manualChunks` configuration in `vite.config.ts` is a cleaner artifact of the same pattern.

`manualChunks` is a real Rollup feature. Used correctly, it can produce cache-friendlier bundles, sensible code boundaries for downstream performance tuning, and predictable chunk names. It's an optimization primitive for bundle size.

The 1-week agent used it to group every CodeMirror package — `basicSetup`, `view`, `state`, `lang-markdown`, `language`, `commands`, `search`, `autocomplete`, `highlight` — into a single eager `codemirror-*.js` chunk. That chunk weighs 529 KB gzipped. Vite's default code-splitting would have fanned those packages across multiple smaller chunks, many of them lazy-loadable (CodeMirror's search and autocomplete don't need to load until the user uses them).

The agent took an optimization primitive and used it to make the bundle worse. By a factor of ~2.4×, vs. defaults. If it had never touched `vite.config.ts`'s `manualChunks`, the 1-week bundle would have been smaller than the 1-day bundle — which is how the proposal's ~82 KB estimate was calculated in the first place.

More configuration is not more correctness. This is obvious. It's also exactly the trap the 1-week agent fell into.

## Why "1-week" never became 1-week

The 1-week agent used 18 minutes of the available 240 minutes (4 hours). Its self-report said "~90 minutes of active writing." Neither of those numbers is the "1-week" the budget label promised.

One plausible reading of the gap: the agent's sense of time is about cognitive load, not wall-clock. Writing 27 source files, three stylesheets, two test suites, and a full responsive layout *feels* substantial. That feeling is not the same as real time; the agent stopped when it had written what it thought was the full proposal, not when it had spent its time budget.

This maps to a more general pattern. **The agent stopped when completeness-by-inspection was achieved, not when the budget ran out.** Once the inspection said "this looks right," there was no process that pulled it back to verification. There couldn't be — the methodology didn't give it one.

The 3 hours 42 minutes of unused budget weren't available for verification because verification wasn't in the agent's loop. It was available for *more code*, but more code without verification compounds the problem rather than solving it.

## The honesty calibration

One thing the three-build set surfaces cleanly: **honesty about unverified claims degrades with budget.**

- 1-day: honest. "Estimated 79 KB, unverified." The gap between the estimate and the measurement (219 KB) exists, but the agent's disclosure is structurally truthful. It said it didn't know. It was right about that.
- 3-day: dishonest without meaning to be. "The build is complete." The agent had no way to verify this and no awareness that it didn't. The claim is stated with confidence because the agent had spent meaningful effort on the code and the effort felt like verification.
- 1-week: honest about structure, dishonest about calibration. The agent correctly noted it hadn't verified the build. It also estimated the bundle at ~82 KB (actual: 533 KB). The "unverified" disclosure protects the structure of the claim, but the estimate itself is confident and wrong by a factor of 6.5×.

At 1-day budget, the agent *feels* insecure about its claims because it had 12 minutes. At 1-week budget, the agent *feels* secure about its claims because it wrote 27 files and a manualChunks config and test suites — even though it ran none of it. The security is an artifact of effort, not verification. And the estimates follow the security, not the reality.

## What a properly instrumented agent would look like

The same three budgets, with `pnpm build` wired into the agent's loop on every file write, would produce different data. Probably different enough that the non-monotonic budget curve wouldn't appear at all.

A 1-day agent with live build watch would catch `@codemirror/language-data` in its first few minutes — the bundle size would be visible in the build output. Fix the import, rebuild, move on. Still cut tests and mobile layout; still drop vanilla-extract. Still ship 30 minutes. Bundle probably ~85 KB.

A 3-day agent with live build watch would catch the `tokens.ts` rename need the first time it ran `pnpm build`. Catch the `selectors` inside `globalStyle` mistake the second time. Catch the version pin the moment it ran `pnpm install`. Still ambitious, now verified. Bundle probably ~100 KB, tests mostly passing, vanilla-extract actually working.

A 1-week agent with live build watch would catch all of the 3-day's errors plus the 11 TypeScript errors. Would notice the `manualChunks` config making the bundle larger rather than smaller, and revert. Would use the remaining 3 hours 42 minutes on polish (motion curves, accessibility refinement, real responsive layouts, maybe collab sketch). Bundle ~85 KB. Code actually tested by its own test suite.

None of that is Act 2. That would be Act 2-redux with a different methodology. Could be a future round.

## What this series is evidence for

Not: "LLMs can't code."

Not: "Bigger budgets don't help."

Not: "Sonnet / the frontend-design skill is bad at Solid."

It's evidence for something narrower and more actionable:

> **When an LLM coding agent has no feedback channel against reality, the quality of its output is a function of how much code it produces before stopping, not a function of how much time it has.** Extra time without extra feedback produces more code of the same quality, which — for many kinds of problem — is worse than less code.

If you're building tooling for LLM-driven coding: the hardest part of the job isn't the model. It's the feedback loop. Giving the model a build watch, a test runner in scope, a linter in scope, and a real error handler is worth more than giving it a bigger context window or a faster iteration loop.

If you're writing code alongside an LLM: trust the LLM's claims about what it *wrote*, not about what it *verified*. Verify it yourself. Always.

## What Act 2 actually cost

Full accounting:

- Three 1-day pilot attempts before the permission situation became clear (~30 min of agent time across them)
- Three production builds (1-day + 3-day + 1-week), plus the orchestrator-side install/build/measurement cycles
- The comparison across the three was hard to stage because I couldn't intervene mid-run (that was part of the point)
- Two commits' worth of documentation, including the methodology pivot, the per-build orchestrator notes, and this writeup

The actual products of Act 2 aren't the three builds. They're:

1. **Act 2 rules as a template** — other people running agent bakeoffs can use these rules, or deliberately deviate from them.
2. **Per-build `orchestrator-notes.md` files** — they demonstrate how to separate an agent's self-report from an orchestrator's measurements, and they're probably the most useful piece of output for anyone doing similar work.
3. **The non-monotonic budget curve as a falsifiable finding** — someone else running the same experiment with live-build-watch agents should produce a monotonic curve, or close to it. That's a testable prediction.

The three builds themselves are evidence, not artifacts. None of them are going to production.

## What comes after this series

A few candidates for a future round, all of which would reuse the `agent-bakeoff` repo format:

- **Act 2, instrumented.** Same proposal, same agent, three budgets, but with live `pnpm build` in the agent's tool scope. Test the prediction that the curve becomes monotonic.
- **A different baseline app.** Not a notes editor. Maybe a kanban board, or a real-time dashboard, or something with enough server-side complexity that the "static only" constraint gets pressure.
- **A different slate of agents.** Same brief, different models (GPT-5, Gemini 2.x, DeepSeek V4, more Claude variants). The current four agents gave a good spread; a deliberately wider one would test whether the consensus moves are model-family artifacts or framework-landscape artifacts.
- **A no-framework round.** The slot we dropped from this series — a constraint to use only vanilla web components — applied to the markdown editor brief. Probably an interesting comparison.

If you're here at the end of all eight posts, thank you for reading. The series is structured so you can argue with any of the choices — the brief, the slate, the verdict, the methodology, any of it. The comments are open on every post. The repo is public. The agent outputs are all preserved.

The one thing I do want to claim, on balance, is this: **multi-agent bakeoffs are underused as a design tool.** Most writing about LLM-driven coding is bounded by one model and one author. Running four models on the same brief surfaces disagreements that no single-agent report would produce — and the disagreements are where the real signal is.

Go run your own.

---

*Series: Post 7 of 8 (final). Previous: [3-Day vs 1-Week](post-06-build-off-3-day-vs-1-week.md). Start: [Why an Agent Bakeoff](post-00-why-an-agent-bakeoff.md).*

*Full repo: [agent-bakeoff](https://github.com/acald-creator/agent-bakeoff). All proposals, all builds, all methodology notes preserved and public.*
