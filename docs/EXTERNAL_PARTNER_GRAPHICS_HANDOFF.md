# External Partner Graphics Handoff

Last updated: 2026-04-05

## Goal

Provide a repo-managed graphics package that an external partner can open, review, modify, and return without needing to reverse-engineer the whole application.

## Package location

Generated handoff package:

- `assets/source/partner-handoff/graphics-package/`

Generation command:

- `npm run assets:partner-package`

## What the package contains

### Editable source assets

These are the intended partner-editable formats:

- SVG logo family
- SVG favicon
- SVG icon family
- SVG illustration/avatar/badge scaffolds
- Lottie JSON motion scaffold
- SVG fallback for Lottie motion asset

### Reference outputs

These help partners see what is currently shipped in product-facing surfaces:

- current PNG logo
- hero image
- app icon / adaptive icon / favicon / splash PNG references

### Documentation

The package includes the graphics requirements and workflow docs needed for an external team to make changes safely.

## Editing rules for partners

1. Prefer editing SVG or JSON source files over PNG outputs.
2. Keep filenames lowercase and kebab-case.
3. Preserve the existing family structure:
   - `assets/logos/`
   - `assets/icons/`
   - `assets/images/`
   - `assets/lottie/`
   - `assets/favicons/`
4. If a directional icon changes, update the `.rtl` counterpart when required.
5. Update the included source map if the editable source location or ownership changes.

## Returning changes

When a partner returns updates, they should provide:

- modified editable source files
- any new exported variants required by the brief
- notes about changed accessibility labels or intended usage
- updated source-map metadata if assets were reorganized

## Current limitation

This package is repo-editable and partner-editable **before** live Figma deep-linking is wired up. It is a complete handoff scaffold, but not yet a live Figma-integrated package.
