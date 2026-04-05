# Graphics Audit — Current Repo State

Last updated: 2026-04-05

## What is already shipped

### Brand / logo

- `assets/images/weejobs-logo.png`
- `assets/logos/logo-primary.svg`
- `assets/logos/logo-stacked.svg`
- `assets/logos/logo-mark.svg`
- `assets/logos/logo-primary-white.svg`
- Used across splash/onboarding/customer/tradie/admin entry surfaces
- Status: **starter family implemented / not finalized**
- Main gap: real production exports and source linkage still need to replace the scaffold family

### Hero / illustration

- `assets/images/hero-handyman.png`
- `assets/images/img-empty-state-no-jobs.svg`
- `assets/images/img-empty-state-no-messages.svg`
- `assets/images/img-avatar-placeholder.svg`
- `assets/images/img-badge-verified-pro.svg`
- Used on splash and onboarding intro
- Status: **starter family implemented / partial**
- Main gap: more production-ready variants and app-wide scenario coverage are still needed

### Platform application assets

- `assets/images/icon.png`
- `assets/images/adaptive-icon.png`
- `assets/images/favicon.png`
- `assets/favicons/favicon.svg`
- `assets/images/splash-icon.png`
- Status: **shipped**
- Main gap: favicon/app-icon family still needs full export sizes and editable-source linkage

### Lottie / motion

- `assets/lottie/lottie-empty-state-pulse.json`
- `assets/lottie/fallbacks/lottie-empty-state-pulse.svg`
- Status: **starter scaffold implemented**
- Main gap: production animation coverage and runtime playback sections are still missing

### Icon system

- `assets/icons/placeholder.svg`
- `assets/icons/icon-search.svg`
- `assets/icons/icon-home.svg`
- `assets/icons/icon-briefcase.svg`
- `assets/icons/icon-chat-bubbles.svg`
- `assets/icons/icon-user-circle.svg`
- `assets/icons/icon-settings.svg`
- `assets/icons/icon-arrow-back.svg`
- `assets/icons/icon-arrow-back.rtl.svg`
- `assets/sprite/sprite.svg`
- Runtime UI is now partially migrated away from `Ionicons` on selected navigation and settings surfaces
- Status: **starter set implemented / migration in progress**
- Main gap: the repo now has a WeeJobs-owned SVG icon set, but the app is not yet fully migrated to it and the source-reference layer is still unpopulated

### Legacy scaffold visuals

- `assets/images/react-logo.png`
- `assets/images/react-logo@2x.png`
- `assets/images/react-logo@3x.png`
- `assets/images/partial-react-logo.png`
- Status: **legacy / scaffold**
- Recommendation: keep visible in the manifest until explicitly retired or replaced

## Highest-value missing items

### High priority

- vector logo family in `assets/logos/`
- continue migrating runtime UI from `Ionicons` to the WeeJobs SVG icon set in `assets/icons/`
- icon metadata including richer source references
- illustration family expansion beyond starter empty-state/avatar/badge scaffolds
- Figma/editable-source references for brand and app-store assets

### Medium priority

- additional hero and marketing illustration variants
- favicon export sizes under the dedicated `assets/favicons/` family
- Lottie animation inventory and runtime playback strategy

### Low priority

- retirement/cleanup plan for scaffold React logos once replacement assets are final

## Source-code usage notes

The most repeated visual asset reference in source routes is the WeeJobs PNG logo. The second core image currently in use is the handyman hero image. That means the repo already has enough visual consistency to support a preview surface, but not enough standardized source material to call the graphics suite complete.

## Preview-surface status

A dedicated preview route should be treated as the front door for graphics QA. The first implementation target is:

- `app/dev/graphics-preview.tsx`

This route is now implemented and currently supports:

- manifest-driven shipped/legacy asset review
- starter icon gallery review
- light/dark preview toggles
- RTL review marker
- reduced-motion review state

Main remaining preview gaps:

- direct Figma file/frame launching from source references
- broader production asset coverage beyond the starter families now registered
- true runtime Lottie playback once animation usage lands in product surfaces

This route should stay manifest-driven so new assets become reviewable as soon as they are registered.

## Figma/source status

The repo now has the beginnings of a Figma-ready source layer:

- `assets/source/`
- `assets/source/figma-exports/`
- `assets/source/figma-exports/source-map.template.json`

Current limitation:

- no real Figma file keys, frame IDs, URLs, or populated source references have been connected yet

That means the scaffold for Figma mapping exists, but live “open this asset in Figma” behavior is not wired up yet.

## Ownership split

Native Android build stabilization should remain on a **separate owner and branch/workstream** from graphics completion.

Recommended split:

- graphics / asset / preview-surface work → frontend + design workflow targeting `UAI-Development`
- Android native build fixes → dedicated owner, separate branch, separate validation loop

That separation keeps design progress moving even when native build work gets spicy.
