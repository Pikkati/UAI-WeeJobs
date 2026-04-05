# Graphics Preview Surface

Last updated: 2026-04-05

## Route

- `app/dev/graphics-preview.tsx`

## Purpose

This route is the fastest in-app QA surface for reviewing the current graphics system without navigating the entire product.

## Current sections

- coverage snapshot
- preview controls
- shipped assets
- legacy/scaffold assets
- starter icon gallery
- missing standardization work
- parallel work split notes

## What it renders today

- raster assets through `expo-image`
- starter vector graphics families through `components/dev/GraphicsVectorPreview.tsx`
- starter WeeJobs icon set through `components/icons/Icon.tsx`

## What it should be used for

- visual QA of newly registered assets
- dark/light review
- RTL review marker checks
- reduced-motion review preparation
- partner handoff verification alongside the manifest

## Current limitation

The preview is manifest-driven, but it still uses handcrafted vector previews for starter families rather than fully generic SVG ingestion. That is enough for the current scaffold, but a richer runtime renderer could be added later.
