# Graphics Requirements — WeeJobs

This document captures the requirements for all graphical assets used in the WeeJobs app: logos, icons, buttons, menus, hero images, avatars, badges, Lottie/animations, export rules and developer handoff.

## General rules
- Preferred formats: SVG for vectors (icons, logos), PNG/WebP for raster UI assets, JPG/WEBP for photos.
- Color profile: sRGB. Provide flattened exports.
- Naming: lowercase, kebab-case, prefix by type. Examples: `logo-primary.svg`, `icon-search.svg`, `btn-primary-filled@2x.png`.
- Source files: include master Figma/Sketch frames or layered PSD with clear layer names.
- Optimization: run SVGO for SVGs and mozjpeg/oxipng or imagemin for rasters.
- Provide `accessibilityLabel` suggestion and alt text for each asset in handoff notes.

## Logos
- Variants: horizontal lockup, stacked lockup, icon/mark, monochrome (black), monochrome (white), favicon.
- Formats: SVG (primary), PNG @1x/@2x/@3x (transparent), SVG favicon.
- Sizes: provide vector source; export examples: 2400×600 (horizontal), icon/mark: 512×512, 256×256, 128×128.
- Minimum clear space: 20% of logo height. Minimum display width: 120px for lockup, 32px for mark.
- Filenames: `logo-primary.svg`, `logo-stacked.svg`, `logo-mark.svg`, `logo-primary.white.svg`.

## App icon (mobile)
- iOS: provide 1024×1024 source and App Store asset sizes per Apple guidelines.
- Android: provide 512×512 adaptive icon layers (foreground and background) and launcher sizes (48/72/96/144/192 px).
- Provide foreground-only and background-only layers for adaptive icons.

## Favicons & PWA
- Provide 16×16, 32×32, 48×48, 192×192, 512×512 PNG and an SVG favicon.

## Buttons / CTAs
- Variants: primary filled, primary outlined, secondary, ghost, destructive, disabled, loading.
- Sizes: small 32px height, medium 44px, large 56px. Minimum tap target 44×44 logical px.
- Padding: min horizontal 16px. Icon-left gap 8px.
- Corner radius: use design token `BorderRadius.md` (8px typical).
- States: default, hover (web), pressed, focus-visible, disabled, loading. Provide color tokens and values for each.
- Motion: press scale to 0.98 over 100ms; focus ring 2–3px.

## Icon system
- Single-source SVG icon set on a 24px grid. Provide 16/20/24/32/48 px variants when needed.
- Standardize stroke vs fill; if stroke, use consistent stroke-width.
- Icons should be recolorable (single SVG) when possible. Provide white/black variants for static assets.
- File names: `icon-{name}.svg`.

## Navigation & Menus
- App bar heights: mobile 56px, tablet/desktop 72px.
- Drawer item height: 48–56px; avatar in header 56px.
- Dropdown min width 160px, max width 320px; item height 40–48px.
- Provide menu icons as SVG and PNG fallbacks if native requires.

## Hero images & backgrounds
- Provide 16:9, 4:3, 3:2 variants. Source large: 2400px width; downscale to 1200/800/480.
- Provide focal point metadata for responsive crops.
- Formats: optimized JPEG or WebP for photos; SVG for vector illustrations.

## Avatars & thumbnails
- Sizes: tiny 24px, small 32px, medium 48px, large 80px.
- Circular by default; include initials placeholder SVG/PNG.
- Status dot: 10×10 at bottom-right.

## Badges & notifications
- Dot badge 14×14, number bubble 20×20, truncate as `99+` for overflow.
- Color tokens for unread/critical states.

## Forms / Inputs
- Input icon sizes: 20px; ensure tap targets remain 44px.
- Validation icons: success (check), error (exclamation) — provide color tokens.

## Illustrations & empty states
- Provide SVG sources and PNG fallbacks; compact variants for small screens.
- Empty state illustration size example: 320×240.

## Animations / Lottie
- Use Lottie JSON for complex animations. Provide a static PNG fallback.
- Keep entry/exit under 1.5s when possible. Respect `prefers-reduced-motion`.

## Dark mode & theming
- Provide inverted or dedicated dark variants for assets that can't be recolored.
- Ensure text/icons over dynamic backgrounds meet WCAG AA contrast.

## Localization & RTL
- Provide mirrored directional icons (chevrons/arrows) for RTL.
- Avoid embedding hard-coded text inside images; if required, provide localized variants.

## Developer integration notes
- Prefer inline SVG components for icons to allow color control.
- Provide an `assets/manifest.json` mapping logical names to file paths and recommended usage.
- Provide usage example snippets and recommended `accessibilityLabel` strings.

## Designer handoff checklist
For each asset deliver:
- Source file (Figma/SKetch/PSD)
- Exported SVG and PNG @1x/@2x/@3x as needed
- Color tokens and usage guidance
- Minimum display size and clear space diagram
- Accessibility label and alt text suggestion
- Filename and path suggestion

---
Keep this document updated with any logo or asset changes. Designers should attach a short changelog entry when releasing updated assets.
