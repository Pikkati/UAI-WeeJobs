import React from 'react';
import { render } from '@testing-library/react-native';

// Mock AuthContext to avoid routing side effects
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null, isLoading: true, hasSeenOnboarding: false }),
  AuthProvider: ({ children }: any) => children,
}));

// Mock expo-router to prevent navigation calls
jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
}));

describe('SplashScreen (app/index)', () => {
  test('renders splash elements without triggering navigation', () => {
    const Splash = require('../app/index').default;
    const { getByText } = render(<Splash />);
    expect(getByText(/No Job Too Wee/i)).toBeTruthy();
  });
});
