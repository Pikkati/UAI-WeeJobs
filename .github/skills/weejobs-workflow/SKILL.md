---
name: weejobs-workflow
description: 'WeeJobs repo workflow for GitHub Copilot. Use when working on graphics, asset manifests, Expo/React Native screens, branch policy, repo customization, or repo-aware automation in this workspace. Trigger words: WeeJobs, UAI-Development, graphics preview, assets, manifest, Copilot rules, repo settings.'
argument-hint: 'Describe the WeeJobs task, area, or workflow you want aligned with repo rules.'
user-invocable: true
disable-model-invocation: false
---

# WeeJobs Workflow

## When to Use

Use this skill when work needs to follow the repo's shared operating rules, especially for:

- graphics suite work
- asset inventory or `assets/manifest.json` changes
- Expo / React Native UI work under `app/` and `components/`
- repo-level Copilot customization files
- branch-aware automation or PR planning
- frontend changes that should stay aligned with the design workflow

## Core Repo Rules

- Treat `UAI-Development` as the default working branch for active development.
- Treat `main` as the stable release baseline; do not plan normal feature or upgrade work directly against `main`.
- Prefer existing repo docs over inventing conventions. Start with:
  - `docs/GRAPHICS_REQUIREMENTS.md`
  - `docs/ASSETS.md`
  - `docs/ASSETS_GUIDELINES.md`
  - `docs/GRAPHICS_SUITE_EXECUTION_PLAN.md`
  - `docs/BRANCH_POLICY.md`

## Asset and Graphics Workflow

When the task touches graphics or visual assets:

1. Check the current requirements and contribution docs listed above.
2. Keep filenames lowercase and kebab-case.
3. Keep icons in `assets/icons/` and directional variants with `.rtl` naming where needed.
4. Update `assets/manifest.json` whenever shipped assets or asset metadata change.
5. If a graphics preview surface exists or is added, treat it as the fastest QA route for visual verification.
6. Record dark-mode, RTL, fallback, and accessibility implications when they apply.

## App Code Workflow

When the task touches product UI:

1. Inspect the relevant route(s) under `app/` first.
2. Check shared UI/components before introducing new patterns.
3. Keep changes aligned with existing Expo Router and React Native patterns already in the repo.
4. Avoid touching extracted/generated directories unless the task explicitly targets them.

## Validation Commands

Prefer existing project scripts when verifying work:

- `npm run type`
- `npm run lint`
- `npm run test:q`
- `npm run test:ci`
- `npm run assets:check-rtl`
- `npm run optimize:assets`

Use the smallest relevant validation for the change first, then broaden if needed.

## Noise to Ignore Unless Requested

Do not treat these directories as primary coding targets unless the task explicitly asks for them:

- `tmp_apk_extracted/`
- `android/extracted_app/`
- coverage and temporary coverage output folders

They are useful for investigation, but they should not dominate normal code search or repo customization work.

## Copilot Customization Workflow

When updating repo customization files for Copilot:

1. Prefer a single workspace rules file under `.github/copilot-instructions.md`.
2. Keep workspace rules short, actionable, and linked to existing docs.
3. Keep skills task-specific and discoverable with keyword-rich descriptions.
4. Put repo-shared skills under `.github/skills/<name>/SKILL.md`.
5. Use `.vscode/settings.json` only for workspace-scoped editor/search/Copilot behavior that helps the whole team.
