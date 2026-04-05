Storybook scaffold for WeeJobs (React Native - Expo)

What this adds
- A minimal Storybook entry at `storybook/index.tsx` that loads stories via `storybook/storyLoader.ts`.
- One example story: `storybook/stories/Button.stories.tsx`.

Next steps (install and run)
1. Install required dev dependencies:

```bash
npm install --save-dev @storybook/react-native @storybook/addon-ondevice-actions @storybook/addon-ondevice-knobs
```

2. To render Storybook inside the app during development, temporarily update `index.js` to import the Storybook UI instead of the app entry. Example:

```js
// index.js (dev only)
if (process.env.STORYBOOK === 'true') {
  module.exports = require('./storybook').default;
} else {
  import './app/_routesManifest';
  import 'expo-router/entry';
}
```

3. Start Metro/Expo as you normally would (or set `STORYBOOK=true` when launching). For example:

```bash
STORYBOOK=true expo start
```

Notes
- This scaffold intentionally avoids changing `index.js` automatically — edit it when you want to run Storybook.
- If you prefer on-device Storybook CLI integration or a web Storybook, follow the official docs: https://github.com/storybookjs/react-native
