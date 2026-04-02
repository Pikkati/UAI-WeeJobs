Figma import: figma-import assets

What this folder contains
- assets/: mock SVGs ready to import into Figma (logo, mark, icon, avatar)
- assets-manifest.json: mapping of logical IDs → file paths (use as a text node in Figma)
- screens-mapping.json: example frame → route mapping

How to open in Figma
Option A (quick, desktop):
1. Open Figma Desktop and create a new file (or open an existing team file).
2. Drag the `figma-import/assets` folder (or the files inside it) onto the Figma canvas. Figma will import each SVG as editable vector layers.

Option B (browser):
1. In Figma, go to File → Import and select the SVG files from `figma-import/assets`.

Add the manifest inside Figma (recommended)
1. Copy the contents of `figma-import/assets-manifest.json`.
2. In Figma create a text layer (press T), paste the JSON, and rename the layer to `assets-manifest.json`. Place it on a page named `01-Assets`.
3. Plugins or scripts can read that text node (via Figma plugin API) and map nodes to manifest IDs.

Tips for designers and developers
- Keep component and style names in Figma identical to manifest IDs and token names (e.g., `logo-primary`, `color.primary`).
- To export optimized SVGs from Figma: select the vector → Export → SVG and run SVGO if needed.
- Use the Figma Tokens plugin to sync colors/typography with your code tokens.

Next steps
- Replace mock SVGs with final design exports from the designer, keeping filenames and IDs stable.
- If you want, I can generate a small Figma plugin script or a Node script that reads `assets-manifest.json` and automates export/import steps.
