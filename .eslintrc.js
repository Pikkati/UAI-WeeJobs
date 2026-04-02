module.exports = {
  env: { node: true },
  extends: [
    'expo',
  ],
  ignorePatterns: ['dist/*'],
  settings: {
    'import/resolver': {
      typescript: { project: ['./tsconfig.json'], tsconfigRootDir: __dirname, alwaysTryTypes: true },
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'], paths: ['.'] },
    },
    // Ignore unresolved import errors for native/expo modules and static assets
    'import/ignore': [
      'node_modules',
      '\\.(png|jpe?g|svg|css|scss)$',
      '^expo(-.*)?',
      '^@stripe/',
      '^react-native(-.*)?',
      '^@react-navigation/.*',
      '^@/'
    ],
    'import/core-modules': [
      'expo-router',
      'expo-status-bar',
      'expo-image',
      '@stripe/stripe-react-native',
      'react-native-safe-area-context',
      'expo-image-picker',
      'expo-linear-gradient',
      'react-native-reanimated',
      '@react-navigation/bottom-tabs',
      '@react-navigation/elements',
      'expo-haptics',
      'expo-web-browser',
      'expo-symbols',
      'expo-blur'
    ],
  },
  rules: {
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint.no-wrapper-object-types': 'off',
  },
  overrides: [
    {
      files: ['app/**/*.ts', 'app/**/*.tsx', 'components/**/*.ts', 'components/**/*.tsx'],
      rules: {
        'import/no-unresolved': 'off'
      }
    }
    ,
    {
      files: ['supabase/functions/**/*.{ts,tsx,js,jsx}'],
      rules: {
        'import/no-unresolved': 'off'
      }
    }
    ,
    {
      files: ['**/__mocks__/**', '**/__tests__/**'],
      env: { jest: true },
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        'import/first': 'off',
        'react/display-name': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-unused-vars': 'off',
        'react-hooks/exhaustive-deps': 'off'
      }
    }
  ],
};
