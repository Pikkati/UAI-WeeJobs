Icon assets

- Place individual SVG icons in this folder. Files should be named kebab-case, e.g. `search-outline.svg`.
- Keep icons to 24x24 viewBox when possible; the `scripts/icon-sprite.js` expects viewBox-compatible SVGs.
- After adding icons, run `node scripts/icon-sprite.js` to generate `assets/sprite/sprite.svg`.
