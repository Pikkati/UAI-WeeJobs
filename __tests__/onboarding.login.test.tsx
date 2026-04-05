import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Static mocks that we will configure per-test
jest.mock(
  'expo-router',
  () => ({
    useLocalSearchParams: jest.fn(),
    router: { replace: jest.fn(), back: jest.fn() },
  }),
  { virtual: true },
);
jest.mock(
  'react-native-safe-area-context',
  () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }),
  { virtual: true },
);
jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }), {
  virtual: true,
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('LoginScreen flows', () => {
  test('shows correct tagline for customer role', async () => {
    const expo = require('expo-router');
    expo.useLocalSearchParams.mockReturnValue({ role: 'customer' });

    const auth = require('../context/AuthContext');
    auth.useAuth.mockReturnValue({
      login: jest.fn(),
      signup: jest.fn(),
      resendVerification: jest.fn(),
    });

    const LoginScreen = require('../app/onboarding/login').default;
    const { getByText } = render(<LoginScreen />);

    expect(getByText('Get jobs done\nby local pros')).toBeTruthy();
  });

  test('shows validation error when email missing on sign in', async () => {
    const expo = require('expo-router');
    expo.useLocalSearchParams.mockReturnValue({ role: 'customer' });

    const auth = require('../context/AuthContext');
    auth.useAuth.mockReturnValue({
      login: jest.fn(),
      signup: jest.fn(),
      resendVerification: jest.fn(),
    });

    const LoginScreen = require('../app/onboarding/login').default;
    const { getByTestId, findByText } = render(<LoginScreen />);

    fireEvent.press(getByTestId('signin-button'));

    const err = await findByText('Please enter your email');
    expect(err).toBeTruthy();
  });

  test('displays rate-limit retry message from login result', async () => {
    const expo = require('expo-router');
    expo.useLocalSearchParams.mockReturnValue({ role: 'customer' });

    const mockLogin = jest
      .fn()
      .mockResolvedValue({
        isRateLimited: true,
        retryAfter: 120,
        error: undefined,
      });
    const auth = require('../context/AuthContext');
    auth.useAuth.mockReturnValue({
      login: mockLogin,
      signup: jest.fn(),
      resendVerification: jest.fn(),
    });

    const LoginScreen = require('../app/onboarding/login').default;
    const { getByTestId, getByPlaceholderText, findByText } = render(
      <LoginScreen />,
    );

    fireEvent.changeText(
      getByPlaceholderText('Email address'),
      'u@example.com',
    );
    fireEvent.changeText(getByPlaceholderText('Password'), 'pass1234');
    fireEvent.press(getByTestId('signin-button'));

    const err = await findByText(/Try again in 2 minutes/);
    expect(err).toBeTruthy();
  });

  test('successful sign in navigates to customer route', async () => {
    const expo = require('expo-router');
    const replaceSpy = expo.router.replace;
    expo.useLocalSearchParams.mockReturnValue({ role: 'customer' });

    const mockLogin = jest
      .fn()
      .mockResolvedValue({ success: true, user: { role: 'customer' } });
    const auth = require('../context/AuthContext');
    auth.useAuth.mockReturnValue({
      login: mockLogin,
      signup: jest.fn(),
      resendVerification: jest.fn(),
    });

    const LoginScreen = require('../app/onboarding/login').default;
    const { getByTestId, getByPlaceholderText } = render(<LoginScreen />);

    fireEvent.changeText(
      getByPlaceholderText('Email address'),
      'u@example.com',
    );
    fireEvent.changeText(getByPlaceholderText('Password'), 'pass1234');
    fireEvent.press(getByTestId('signin-button'));

    // await for router.replace call
    await new Promise((res) => setTimeout(res, 50));
    expect(replaceSpy).toHaveBeenCalledWith('/customer');
  });
});
