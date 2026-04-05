# WeeJobs Copilot Rules

## Branch policy

- Use `UAI-Development` as the default target for active development work.
- Treat `main` as the stable release baseline, not the normal branch for feature or upgrade delivery.
- When describing branch strategy, keep `UAI-Development` as the frontend/design sync branch unless the task explicitly says otherwise.

## Repo docs to consult

- For graphics and assets, use `docs/GRAPHICS_REQUIREMENTS.md`, `docs/ASSETS.md`, `docs/ASSETS_GUIDELINES.md`, and `docs/GRAPHICS_SUITE_EXECUTION_PLAN.md`.
- For branch workflow, use `docs/BRANCH_POLICY.md`.
- Prefer linking to repo docs rather than duplicating them in responses or file comments.

## App and asset conventions

- This repo is an Expo / React Native app using file-based routing under `app/`.
- Reuse existing patterns in `app/`, `components/`, and shared libraries before adding new structures.
- Keep asset filenames lowercase and kebab-case.
- Keep SVG icons in `assets/icons/`; directional variants should use the documented RTL naming convention.
- When shipped assets change, update `assets/manifest.json` and relevant docs.

## Validation

Prefer existing package scripts for verification:

- `npm run type`
- `npm run lint`
- `npm run test:q`
- `npm run test:ci`
- `npm run assets:check-rtl`
- `npm run optimize:assets`

Use the smallest relevant validation first, then broaden if the change affects multiple surfaces.

## Search and edit focus

- Prefer normal source folders over generated or extracted artifact folders.
- Ignore `tmp_apk_extracted/`, `android/extracted_app/`, and coverage/temp output folders unless the task explicitly targets them.
- Do not let extracted native artifacts drive normal app or asset changes.
