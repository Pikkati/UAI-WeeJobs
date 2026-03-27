**Assets Contribution Guidelines**

- Keep icons in `assets/icons/` as individual SVGs named kebab-case. Run `node scripts/icon-sprite.js` to generate `assets/sprite/sprite.svg`.
- Export app icons at 1024x1024 source, and generate platform sizes via automated scripts (TODO: add generation script using `sharp`).
- For Lottie animations, commit the `.json` source under `assets/lottie/` and include a static PNG fallback in `assets/lottie/fallbacks/`.
- When adding raster images, include an entry in `assets/manifest.json` with usage tags (e.g. `splash`, `avatar`, `feature`) and allow the optimizer CI to compress on PR.
- Localization: include RTL-aware variations for directional assets when necessary, naming them `icon-name.rtl.svg`.

See `docs/GRAPHICS_REQUIREMENTS.md` for detailed designer handoff specs.
