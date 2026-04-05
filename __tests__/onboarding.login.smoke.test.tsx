import React from 'react';
import { render } from '@testing-library/react-native';

// Mock AuthContext to provide safe functions
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: async () => ({ success: false }),
    signup: async () => ({ success: false }),
    resendVerification: async () => ({ success: false }),
  }),
  AuthProvider: ({ children }: any) => children,
}));

// Mock expo-router search params and router
jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

// Mock safe area insets
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('LoginScreen (app/onboarding/login)', () => {
  test('module loads and exports a component', () => {
    const Login = require('../app/onboarding/login').default;
    expect(typeof Login).toBe('function');
  });
});
