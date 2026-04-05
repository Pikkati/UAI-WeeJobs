module.exports = {
  root: true,
  extends: ['expo'],
  ignorePatterns: ['dist/*'],
  // Don't fail on unused eslint-disable comments (many tests/mocks include them)
  reportUnusedDisableDirectives: false,
  settings: {
    // Treat many native-only modules as core modules so lint doesn't try to resolve
    // them in a Node environment (reduces false positives for import/no-unresolved).
    'import/core-modules': [
      'react-native-safe-area-context',
      '@stripe/stripe-react-native',
      'expo-linear-gradient',
      'expo-web-browser',
      'expo-image',
      '@react-navigation/native',
      '@react-navigation/bottom-tabs',
      // Native / Expo modules used in the project but not resolvable in Node lint
      'react-native-reanimated',
      'expo-haptics',
      'expo-blur',
    ],
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    'import/no-unresolved': [
      'error',
      {
        ignore: [
          'expo-linear-gradient',
          'react-native-safe-area-context',
          '@stripe/stripe-react-native',
          'expo-status-bar',
          'expo-web-browser',
          'expo-image',
          'react-native-reanimated',
          'expo-haptics',
          'expo-blur',
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
      env: { jest: true, node: true },
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        'import/first': 'off',
        'no-console': 'off',
        // Tests intentionally reassign and use test-only patterns—relax hooks/import checks
        'react-hooks/globals': 'off',
        'react-hooks/refs': 'off',
        'react-hooks/preserve-manual-memoization': 'off',
        'import/no-unresolved': 'off',
      },
    },
    {
      // Mocks are plain JS files that use the `jest` global; enable jest env
      files: ['**/__mocks__/**', '**/*.mock.*'],
      env: { jest: true, node: true },
      rules: {
        'no-undef': 'off',
      },
    },
    {
      // Relax some React Hooks rules and certain checks in app and component code
      files: ['app/**', 'components/**', 'components/**/**'],
      rules: {
        'react-hooks/refs': 'off',
        'react-hooks/preserve-manual-memoization': 'off',
        'react-hooks/immutability': 'off',
        'react-hooks/static-components': 'off',
      },
    },
    {
      // Deno-based Supabase functions use remote imports that ESLint (node resolver)
      // cannot resolve; relax import rules for those files.
      files: ['supabase/**'],
      rules: {
        'import/no-unresolved': 'off',
        'import/first': 'off',
      },
    },
    {
      // Node scripts should be linted with Node globals enabled
      files: ['scripts/**'],
      env: { node: true },
    },
    {
      // Some custom hooks intentionally set state in an effect during hydration
      files: ['hooks/**'],
      rules: {
        'react-hooks/set-state-in-effect': 'off',
      },
    },
  ],
};
