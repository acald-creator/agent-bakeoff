# orchestrator-notes.md — 3-day build

*Notes from outside the agent's perspective. The agent's own self-report is in [build-notes.md](build-notes.md). This file records what the orchestrator did, observed, or had to compensate for.*

## Headline

The 3-day build **does not compile as delivered.** The agent's extra ambition (vanilla-extract, full accessibility, motion system) came with four separate build-breaking mistakes that a single `pnpm install && pnpm build` pass would have surfaced — but the agent did not run one (per the methodology: orchestrator handles build verification). The orchestrator attempted to salvage the build with minimal patches, fixed three issues, and stopped at the fourth because fixing it would have required meaningful code rewriting.

**Bundle size: not measured.** The build never produced a `dist/` output.

This is a clean time-pressure signal. The agent self-reported "The build is complete. Everything looks correct." That claim was structurally false and self-referential: the agent had no way to verify it had not run the build.

## Agent self-report summary

- ~35 iterations, ~45 minutes — under the 75-iteration / 90-minute budget
- Estimated ~105 KB gzipped (the "all lazy chunks loaded" figure from the proposal)
- Claimed full vanilla-extract design system, ARIA accessibility, motion system

## What the orchestrator did

1. Ran `pnpm install` in `builds/3-day/`. **Failed:** `@vanilla-extract/vite-plugin@^4.0.21` does not exist. Max 4.x version is 4.0.20; current stable is 5.2.2.
2. Patched `package.json`: changed the pin to `^5.0.0`. Re-ran `pnpm install`. **Succeeded.**
3. Ran `pnpm build`. **Failed:** vanilla-extract compiler reported that `globalStyle` was called inside `tokens.ts`, which is not a `.css.ts` file.
4. Patched: renamed `src/design/tokens.ts` → `src/design/tokens.css.ts`. Re-ran `pnpm build`. **Failed:** `global.css.ts` imports from `'./tokens'` which no longer resolves.
5. Patched: updated the import in `global.css.ts` to `'./tokens.css'`. Re-ran `pnpm build`. **Failed:** `Selectors are not allowed within "globalStyle"` — agent used `selectors: { '&:hover': {...}, '&:active': {...} }` inside multiple `globalStyle()` calls. That `selectors` key is valid on `style()` but not on `globalStyle()`; each global selector needs to be its own `globalStyle('.foo:hover', {...})` call.
6. **Stopped patching.** Fix would require rewriting ~12 `globalStyle` calls across the file — too invasive to count as an orchestrator typo-fix. Recorded the gap and moved on.

## The four mistakes, ranked by time-pressure signal strength

1. **`selectors` key inside `globalStyle()`** (strongest signal). The agent knew vanilla-extract's `style()` API well enough to use `selectors: { '&:hover': ... }` — but applied the same pattern to `globalStyle()`, where it's not supported. A single `pnpm build` would have surfaced this in the first minute.
2. **`tokens.ts` not `tokens.css.ts`.** Agent named every *other* vanilla-extract file with the `.css.ts` suffix correctly (`global.css.ts`). Missing it on `tokens.ts` reflects the file being written early before the convention was front-of-mind. Build would have surfaced it.
3. **`@vanilla-extract/vite-plugin@^4.0.21`.** The plausible-looking version pin that doesn't exist. Agent probably started from a remembered version number or intuition; `pnpm install` would have failed in the first 10 seconds.
4. **Import path `./tokens` after rename.** Technically caused by the orchestrator's rename, but the agent's original code used a path that would have worked *because* it also got the filename wrong — the mistakes were coherent if you accepted mistake #2. Fixing #2 created this one.

Mistakes #1 and #3 are independent. Mistake #2 cascades to #4 via the orchestrator's fix. So the agent made **three independent mistakes**, all discoverable by one build run.

## What's observable from outside

- **Iteration count was well under budget.** 35/75 iterations, 45/90 minutes. The agent stopped at ~45 minutes convinced the build was complete. Unused budget is not the issue; *verification* is.
- **Design-system ambition is real.** The `tokens.css.ts` file defines 100+ typed design tokens (colors, spacing, typography scales, z-index, motion curves). `global.css.ts` is ~440 lines of structured styles. This is a meaningful step up from 1-day's flat `global.css` file.
- **Accessibility scaffolding is present in the code.** ARIA roles in Sidebar (`role="listbox"`, `role="option"`, `aria-selected`), keyboard nav handlers, focus-visible rules. Not unique to this budget — a 1-day agent could do some of this — but the 3-day version actually wired it throughout.
- **Motion system exists as tokens.** Duration and easing curves are tokenized and referenced from `transition` declarations across the styles. Style consistency is genuinely higher than 1-day.
- **The ambition cost the verification.** A 1-day agent picks plainer tools partly because they know they can't verify a complex setup in 30 minutes. The 3-day agent reached for vanilla-extract *and* the full CM6 extension set *and* motion tokens — and lost the ability to spot-check any of it against a real build.

## Honesty gap

The agent's `build-notes.md` (once written) claims the bundle estimate is ~105 KB gzipped. That claim is unverifiable from the delivered code, because the delivered code does not build.

The agent's final message to the orchestrator included: "Everything looks correct. The build is complete." Both statements are structurally false given the three independent errors surfaced by the first pass.

This is not a malicious claim — the agent genuinely believed the code was correct, because it had reasoned about each file in isolation and could not run the cross-cutting verification a build provides. That's the lesson of Act 2's methodology: **self-verification through inspection does not substitute for execution**, and time-pressured LLM code is where the substitution fails hardest.

## Fix path (for reference, not applied)

To make 3-day actually build:

1. Split every `globalStyle('.foo', { selectors: {...} })` into multiple `globalStyle('.foo:hover', {...})` calls across `global.css.ts`. ~12 edits.
2. Rebuild. If Vite's `vite-plugin-solid` also has issues, address those.
3. Measure bundle via `gzip -c dist/assets/*.js | wc -c` summation on the entry chunks.

Estimated fix time for a human familiar with vanilla-extract: ~15 minutes. Not done here because the value of Act 2 is measuring the delivered artifact, not the orchestrator-rescued artifact.

## Files at this build

```
builds/3-day/
├── package.json           Agent (version pin patched by orchestrator: vanilla-extract vite-plugin ^4.0.21 → ^5.0.0)
├── vite.config.ts         Agent
├── tsconfig.json          Agent
├── index.html             Agent
├── public/                Agent
├── src/                   Agent (tokens.ts renamed to tokens.css.ts by orchestrator; one import path in global.css.ts updated)
├── build-notes.md         Agent
├── orchestrator-notes.md  Orchestrator (this file)
├── pnpm-lock.yaml         Generated by `pnpm install` (post-patch)
└── node_modules/          Generated by `pnpm install` (post-patch, gitignored)
```

Note: `dist/` does not exist. The build never succeeded.
