**RTL & Localization for Assets**

Checklist for directional assets and localization:

- Name directional assets with clear tokens: `icon-arrow-left.svg`, `icon-back.png`.
- Provide RTL variants with `.rtl` before the extension: `icon-arrow-left.rtl.svg`.
- For complex images that need mirroring, keep both LTR and RTL versions and list them in `assets/manifest.json` with a `rtl` tag.
- Use `node scripts/check-rtl-assets.js` to find likely missing RTL variants.

Developer usage:

```bash
# run quick scan
node scripts/check-rtl-assets.js
```

Designer notes:

- When creating directional icons, export both LTR and mirrored RTL assets when behavior differs. Mark the preferred size and format in the manifest.
