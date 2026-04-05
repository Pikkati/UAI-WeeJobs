# Complete the WeeJobs graphics suite and ship a dedicated preview surface

## Objective

Complete the full WeeJobs graphics suite so design and frontend can work in parallel with a shared source of truth, a dedicated in-app graphics preview surface, and an export/import workflow that keeps Figma-editable source assets aligned with the development branch.

## Current state

### Verified repo state

- The app already has route-based UI flows under `app/` for onboarding, customer, tradie, and admin experiences.
- Visual assets are already in use, especially `assets/images/weejobs-logo.png` and `assets/images/hero-handyman.png`.
- Graphics requirements are documented in `docs/GRAPHICS_REQUIREMENTS.md`.
- Asset contribution rules are documented in `docs/ASSETS.md` and `docs/ASSETS_GUIDELINES.md`.
- `assets/manifest.json` exists but is minimally populated.
- `assets/icons/`, `assets/images/`, and `assets/sprite/` exist, but the asset system is not yet complete.
- Storybook/preview infrastructure is not currently present in the repo state being referenced here, so the preview surface should be implemented deliberately and documented.
- Current native Android instability is unrelated to graphics completion and should not block parallel asset/design work.

### Branch/reference policy

- `origin/main` exists and should remain the stable release baseline.
- `origin/UAI-Development` exists and is the active development branch described in the repo documentation.
- For graphics and frontend synchronization, the design workflow should treat `UAI-Development` as the primary branch to watch for interface changes, while `main` remains the release/reference baseline.

## Problem statement

We need a complete graphics system rather than ad hoc image files. That means:

1. A full asset inventory for logos, icons, illustrations, hero images, badges, avatars, empty states, and animations.
2. A dedicated preview surface inside the app so graphics can be reviewed without navigating the whole product.
3. A Figma-friendly workflow so source assets remain editable while exported assets remain aligned with the codebase.
4. A branch-aware update process so frontend interface changes on the main development branch are reflected in design assets and preview screens.

## Deliverables

### 1. Full graphics suite

- Final logo set: horizontal, stacked, mark/icon, monochrome dark/light, app icon source, favicon set.
- Core icon system on a consistent 24px grid with RTL-aware directional variants.
- Splash, onboarding, hero, illustration, and empty-state assets.
- Avatar placeholders, badge graphics, state graphics, and loading/animation assets.
- Lottie JSON files with PNG fallbacks where animation is used.
- Dark-mode compatible graphics where recoloring is not enough.

### 2. Source-of-truth asset structure

- Expand `assets/manifest.json` to include all shipped assets, metadata, variants, intended usage, accessibility copy, dark-mode/RTL support, and design-source linkage.
- Add or formalize folders such as:
  - `assets/source/figma-exports/`
  - `assets/logos/`
  - `assets/icons/`
  - `assets/images/`
  - `assets/lottie/`
  - `assets/lottie/fallbacks/`
  - `assets/favicons/`
- Ensure naming follows the kebab-case conventions already documented.

### 3. Dedicated graphics preview surface

Create a dedicated in-app preview area, for example under `app/dev/graphics-preview.tsx` or a similar dev-only route, that can render and validate:

- logos
- icons
- raster images
- empty states
- avatar placeholders
- badges
- Lottie animations with fallback behavior
- component skin states (default, pressed, disabled, error, success)
- dark/light variants
- RTL variants
- responsive breakpoints where graphics scale differently

### 4. Figma integration workflow

Establish a documented workflow that allows:

- importing vector/raster exports into Figma for further editing
- linking every exported asset to a Figma component/frame or source reference
- watching the main development branch (`UAI-Development`) for frontend changes that affect layout, spacing, art direction, or graphical states
- periodically syncing `main` as the release-approved baseline

### 5. Frontend/design synchronization process

Define a repeatable process so that when UI changes land in the development branch, design is prompted to evaluate:

- changed screen layouts
- new button/input states
- altered spacing or density
- changed iconography requirements
- new empty/error states
- theme changes affecting contrast or variants
- new Lottie or illustration opportunities

## Actionable implementation plan

## Phase 1 — inventory and gap analysis

- [ ] Audit all current asset usage in `app/`, `components/`, and shared UI modules.
- [ ] Build a list of every currently referenced asset path.
- [ ] Identify missing or duplicated assets, inconsistent naming, and PNG-only graphics that should become SVG or structured asset entries.
- [ ] Expand `assets/manifest.json` to represent the current reality before adding new assets.
- [ ] Create a gap table covering:
  - logos
  - app icons
  - favicons
  - navigation icons
  - CTA/button states
  - onboarding and splash graphics
  - empty states
  - badges/notifications
  - form validation states
  - avatar placeholders
  - Lottie animations and fallbacks
  - dark-mode variants
  - RTL variants

## Phase 2 — source asset system

- [ ] Create or formalize `assets/source/` as the editable-source landing area.
- [ ] Add a convention for storing Figma-exported source bundles or links in a repo-friendly way.
- [ ] Add a metadata field in `assets/manifest.json` for each asset’s source reference, such as a Figma frame/component key, file URL, or documented source token.
- [ ] Document export presets for SVG, PNG/WebP, hero images, and Lottie fallbacks.
- [ ] Add validation rules for required metadata: asset id, type, path, variants, source reference, usage, accessibility text, dark-mode support, RTL support.

## Phase 3 — complete the shipped graphics suite

- [ ] Finalize the logo family and export all required variants.
- [ ] Replace one-off or placeholder branding assets where necessary.
- [ ] Build the core icon set with naming, sizing, and RTL rules.
- [ ] Generate or refresh the SVG sprite from icons.
- [ ] Create the full set of empty-state and status illustrations.
- [ ] Add avatar placeholders and badge graphics.
- [ ] Add onboarding/splash variants sized for app usage.
- [ ] Add any missing photos/hero assets in responsive sizes.
- [ ] Add Lottie JSON animations plus PNG fallbacks and reduced-motion notes.

## Phase 4 — dedicated graphics preview surface

- [ ] Create a dedicated route for previewing graphics in isolation.
- [ ] Make the screen safe for local/dev usage and optionally hide it from production navigation.
- [ ] Drive the preview from `assets/manifest.json` so new assets can appear automatically.
- [ ] Group sections by asset type.
- [ ] Show metadata inline: asset id, file path, variants, theme support, RTL support, accessibility label.
- [ ] Add controls/toggles for:
  - light/dark mode
  - LTR/RTL
  - reduced motion on/off
  - screen width presets
  - platform hints (mobile/web)
- [ ] Add a “frontend surface references” section showing where the asset is used in the app.
- [ ] Add placeholder/fallback handling for missing assets so the screen becomes a QA tool instead of a crash generator.

## Phase 5 — frontend interface sync with development branch

- [ ] Create a documented branch policy for design sync:
  - `UAI-Development` = main development branch to watch for UI changes
  - `main` = stable release baseline for approved visuals
- [ ] Add a simple script or workflow that reports changed frontend files likely to affect graphics, such as files under `app/`, `components/`, `constants/`, and theme/token modules.
- [ ] Produce a change summary format for design review, for example: screen changed, component changed, likely graphics impact, required asset review.
- [ ] Add a recurring review checklist for PRs that alter UI-facing files.

## Phase 6 — Figma workflow and round-trip editing

- [ ] Document how designers import exported assets into Figma while preserving editability.
- [ ] Keep editable vector sources in Figma and mirror export artifacts in the repo.
- [ ] Add a mapping from Figma component/frame names to repo asset IDs.
- [ ] Define an update loop:
  1. frontend changes land on `UAI-Development`
  2. changed screens/components are flagged for design review
  3. design updates the corresponding Figma frames/components
  4. exports are regenerated into the repo
  5. preview surface verifies the result in-app
- [ ] Add versioning/changelog notes for graphics changes in PR descriptions or a graphics changelog section.

## Phase 7 — automation and CI checks

- [ ] Add asset validation to ensure every shipped asset is present in `assets/manifest.json`.
- [ ] Add a check for missing dark-mode or RTL variants where marked required.
- [ ] Add optimization checks using existing SVG/image tooling.
- [ ] Add a preview-surface smoke test if feasible.
- [ ] Add linting or metadata validation for source-reference fields.

## Suggested file/work items

### Documentation

- `docs/GRAPHICS_SUITE_EXECUTION_PLAN.md` — this master plan.
- `docs/FIGMA_SYNC_WORKFLOW.md` — detailed design/dev round-trip workflow.
- `docs/GRAPHICS_PREVIEW_SURFACE.md` — how the preview route works and how to use it.

### App implementation

- `app/dev/graphics-preview.tsx` or equivalent dev route.
- `components/dev/GraphicsPreviewSection.tsx`
- `components/dev/GraphicsManifestRenderer.tsx`
- `lib/assets/getAssetManifest.ts`
- `lib/assets/validateAssetEntry.ts`

### Data/metadata

- `assets/manifest.json` — expanded to cover the complete asset suite.
- `assets/source/` — source export landing area and/or source-reference documentation.

### Tooling

- `scripts/audit-graphics-usage.js`
- `scripts/validate-assets-manifest.js`
- `scripts/report-ui-affecting-changes.js`

## Acceptance criteria

- Every shipped graphic used by the app is represented in `assets/manifest.json`.
- Every required graphic variant exists or is explicitly marked not applicable.
- A dedicated in-app preview surface renders all graphics without needing to navigate the full app.
- The preview surface can validate theme, RTL, and motion/fallback behavior.
- The design workflow clearly identifies `UAI-Development` as the primary interface-change branch and `main` as the release baseline.
- Designers can locate the repo asset corresponding to a Figma component/frame and vice versa.
- The graphics suite is maintainable through docs, metadata, and lightweight automation rather than tribal knowledge.

## Recommended issue breakdown

This can be delivered as one umbrella issue with sub-issues for:

1. asset inventory and manifest completion
2. icon and logo system completion
3. illustrations, badges, and Lottie completion
4. graphics preview surface implementation
5. Figma sync workflow and branch-aware automation
6. CI validation and asset QA

## Notes

- The dedicated preview surface should not depend on Android native build stabilization to start providing value.
- The current app already has enough UI structure to begin graphics review immediately.
- The preview surface should become the fastest way to review asset regressions and visual consistency during frontend work.
