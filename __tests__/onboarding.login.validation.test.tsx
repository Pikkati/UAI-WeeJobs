import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    signup: jest.fn(),
    resendVerification: jest.fn(),
  }),
  AuthProvider: ({ children }: any) => children,
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

const LoginScreen = require('../app/onboarding/login').default;

describe('LoginScreen validation', () => {
  test('shows error when email is missing on sign in', () => {
    const { getByTestId, getByText } = render(<LoginScreen />);
    fireEvent.press(getByTestId('signin-button'));
    getByText('Please enter your email');
  });

  test('shows error for invalid email format', () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(
      <LoginScreen />,
    );
    const email = getByPlaceholderText('Email address');
    fireEvent.changeText(email, 'not-an-email');
    fireEvent.press(getByTestId('signin-button'));
    getByText('Please enter a valid email address');
  });

  test('shows error when password is missing', () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(
      <LoginScreen />,
    );
    const email = getByPlaceholderText('Email address');
    fireEvent.changeText(email, 'x@y.com');
    fireEvent.press(getByTestId('signin-button'));
    getByText('Please enter your password');
  });
});
