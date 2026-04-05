Assets folder structure

Place design sources and exported assets here. Maintain subfolders: `source`, `logos`, `icons`, `images`, `lottie`, `favicons`.

Do not commit large source PSD/AI files without approval. Use `assets/manifest.json` to register new assets.

Useful workflow commands:

- `npm run assets:audit` — scan source files for asset usage and compare against the manifest
- `npm run assets:check-rtl` — flag obvious missing RTL variants
- `npm run assets:icon-sprite` — regenerate the SVG sprite from the repo-owned icon pack
- `npm run assets:partner-package` — generate the curated editable package for an external graphics partner
- `npm run assets:validate` — validate manifest metadata and referenced asset paths
- `npm run optimize:assets` — optimize raster/vector assets with the existing scripts
