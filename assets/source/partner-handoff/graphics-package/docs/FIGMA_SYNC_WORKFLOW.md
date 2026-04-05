# Figma Sync Workflow

Last updated: 2026-04-05

## Current capability level

The repository is **Figma-ready at the metadata/scaffold level**, but **not yet Figma-connected at the live workflow level**.

What exists now:

- `assets/source/` for source-side asset tracking
- `assets/source/figma-exports/` for Figma export metadata
- `assets/source/figma-exports/source-map.template.json` as the mapping template
- `assets/manifest.json` as the runtime-side source of truth for shipped asset metadata
- `app/dev/graphics-preview.tsx` as the in-app review surface
- starter logo, favicon, illustration, icon, and Lottie scaffold families registered in the manifest

What is not wired yet:

- actual Figma file keys
- actual Figma node/frame IDs
- real Figma URLs
- automatic import/export or API sync
- preview deep links from manifest entries to Figma sources

## What "open in Figma" requires next

To open assets in Figma from the repo or preview surface, each relevant manifest entry needs a populated source reference.

Minimum useful fields per asset family:

- Figma file key
- Figma node/frame ID
- frame/component name
- exported repo paths
- optional direct file/frame URL

## Recommended next implementation

### Phase 1 — populate source map

Create a real file based on:

- `assets/source/figma-exports/source-map.template.json`

Fill it with the actual asset-to-Figma mappings for:

- logo family
- app icon / adaptive icon
- favicon bundle
- hero/illustration exports
- icon set

### Phase 2 — mirror source references into manifest

For every asset entry in `assets/manifest.json`, replace `sourceReference: null` with either:

- a Figma file/frame URL, or
- a structured token that can be resolved through the source map

### Phase 3 — preview deep linking

Enhance `app/dev/graphics-preview.tsx` to display source-reference metadata and eventually offer an "Open in Figma" action for mapped assets.

## Readiness summary

- In-app graphics playground: **implemented**
- Manifest-driven asset review: **implemented**
- Starter icon review: **implemented**
- Figma source scaffolding: **implemented**
- Real Figma linkage: **not started**
- Full graphics suite coverage: **in progress**

## Practical interpretation

You can already:

- view a growing graphics scaffold in-app
- review shipped assets and starter icons
- review starter logo, favicon, illustration, avatar, badge, and Lottie fallback scaffolds
- organize source-side design metadata in the repo

You cannot yet:

- open the real assets directly in Figma from the repo
- sync exports automatically
- review the entire final graphics suite, because the suite itself is not fully authored/exported yet
