# Assets Checklist & Export Presets

This document complements `GRAPHICS_REQUIREMENTS.md` and provides concrete export presets, filenames, and a checklist designers/developers should follow when adding assets to the repo.

## Folder structure (recommended)

- `assets/source/` — Master design files (Figma exports, Sketch, PSD, AI).
- `assets/logos/` — Vector logos and PNG fallbacks.
- `assets/icons/` — SVG icon set and PNG fallbacks.
- `assets/images/` — Hero images, photos and raster illustrations.
- `assets/lottie/` — Lottie JSON files and static fallbacks.
- `assets/favicons/` — favicon and PWA icons.

## Filename conventions

- Lowercase, kebab-case. Prefix by type: `logo-`, `icon-`, `img-`, `lottie-`.
- Include scale suffix for PNG fallbacks: `@1x`, `@2x`, `@3x`.

## Export presets (design -> repo)

- Logos: export SVG + PNG @1x/2x/3x. Example sizes: mark 512×512, lockup 2400×600.
- Icons: export SVG with 24px viewBox. Provide PNG @1x/2x for native if needed.
- Hero images: export JPG/WebP at widths 2400, 1200, 800, 480 px. Use progressive JPEG or WebP.
- Avatars: export PNG circle masks at 80/48/32 px.

## Basic optimization commands

Install tools (developer):

```bash
npm install --save-dev svgo imagemin imagemin-mozjpeg imagemin-pngquant
```

Run SVGO on all SVGs:

```bash
npx svgo -f assets/icons -o assets/icons
```

Run image minification (example):

```bash
node scripts/optimize-assets.js
```

Run the asset usage audit against source routes/components and compare results to `assets/manifest.json`:

```bash
npm run assets:audit
```

Validate required manifest metadata and on-disk file references:

```bash
npm run assets:validate
```

Regenerate the SVG sprite from `assets/icons/*.svg`:

```bash
npm run assets:icon-sprite
```

Generate the curated external-partner editable graphics package:

```bash
npm run assets:partner-package
```

## Handoff checklist

- Attach source file and exported assets.
- Fill metadata in `assets/manifest.json` for new assets (name, path, variants, alt text).
- Include accessibility label and minimum size guidance in PR description.

## CI integration

- The repo contains a workflow `.github/workflows/image-optimization.yml` that runs asset optimization on pushes to `main` and opens a PR with optimized assets when improvements are found.

---

Keep `docs/ASSETS.md` in sync with `docs/GRAPHICS_REQUIREMENTS.md`.
