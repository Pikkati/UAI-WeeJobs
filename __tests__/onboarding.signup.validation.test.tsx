import React from 'react';
import {
  render,
  fireEvent,
  findByText,
  waitFor,
} from '@testing-library/react-native';

// Mocks
jest.mock(
  'react-native-safe-area-context',
  () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }),
  { virtual: true },
);
jest.mock(
  'expo-router',
  () => ({
    useLocalSearchParams: jest.fn(),
    router: { replace: jest.fn(), back: jest.fn() },
  }),
  { virtual: true },
);
jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }), {
  virtual: true,
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('LoginScreen sign-up validation', () => {
  test('shows error when name is missing', async () => {
    const expo = require('expo-router');
    expo.useLocalSearchParams.mockReturnValue({ role: 'customer' });

    const auth = require('../context/AuthContext');
    auth.useAuth.mockReturnValue({
      signup: jest.fn(),
      login: jest.fn(),
      resendVerification: jest.fn(),
    });

    const LoginScreen = require('../app/onboarding/login').default;
    const { getByText, findByText, getAllByText } = render(<LoginScreen />);

    fireEvent.press(getAllByText('Sign Up')[0]);
    fireEvent.press(getByText('Create Account'));

    const err = await findByText('Please enter your name');
    expect(err).toBeTruthy();
  });

  test('shows error when email is missing on signup', async () => {
    const expo = require('expo-router');
    expo.useLocalSearchParams.mockReturnValue({ role: 'customer' });

    const auth = require('../context/AuthContext');
    auth.useAuth.mockReturnValue({
      signup: jest.fn(),
      login: jest.fn(),
      resendVerification: jest.fn(),
    });

    const LoginScreen = require('../app/onboarding/login').default;
    const { getByText, getByPlaceholderText, findByText, getAllByText } =
      render(<LoginScreen />);

    fireEvent.press(getAllByText('Sign Up')[0]);
    fireEvent.changeText(getByPlaceholderText('Full name'), 'Alice');
    fireEvent.press(getByText('Create Account'));

    const err = await findByText('Please enter your email');
    expect(err).toBeTruthy();
  });

  test('shows error for invalid email format on signup', async () => {
    const expo = require('expo-router');
    expo.useLocalSearchParams.mockReturnValue({ role: 'customer' });

    const auth = require('../context/AuthContext');
    auth.useAuth.mockReturnValue({
      signup: jest.fn(),
      login: jest.fn(),
      resendVerification: jest.fn(),
    });

    const LoginScreen = require('../app/onboarding/login').default;
    const { getByText, getByPlaceholderText, findByText, getAllByText } =
      render(<LoginScreen />);

    fireEvent.press(getAllByText('Sign Up')[0]);
    fireEvent.changeText(getByPlaceholderText('Full name'), 'Alice');
    fireEvent.changeText(getByPlaceholderText('Email address'), 'notanemail');
    fireEvent.press(getByText('Create Account'));

    const err = await findByText('Please enter a valid email address');
    expect(err).toBeTruthy();
  });

  test('shows error when password missing on signup', async () => {
    const expo = require('expo-router');
    expo.useLocalSearchParams.mockReturnValue({ role: 'customer' });

    const auth = require('../context/AuthContext');
    auth.useAuth.mockReturnValue({
      signup: jest.fn(),
      login: jest.fn(),
      resendVerification: jest.fn(),
    });

    const LoginScreen = require('../app/onboarding/login').default;
    const { getByText, getByPlaceholderText, findByText, getAllByText } =
      render(<LoginScreen />);

    fireEvent.press(getAllByText('Sign Up')[0]);
    fireEvent.changeText(getByPlaceholderText('Full name'), 'Alice');
    fireEvent.changeText(getByPlaceholderText('Email address'), 'a@b.com');
    fireEvent.press(getByText('Create Account'));

    const err = await findByText('Please create a password');
    expect(err).toBeTruthy();
  });

  test('shows password length and mismatch errors', async () => {
    const expo = require('expo-router');
    expo.useLocalSearchParams.mockReturnValue({ role: 'customer' });

    const auth = require('../context/AuthContext');
    auth.useAuth.mockReturnValue({
      signup: jest.fn(),
      login: jest.fn(),
      resendVerification: jest.fn(),
    });

    const LoginScreen = require('../app/onboarding/login').default;
    const { getByText, getByPlaceholderText, findByText, getAllByText } =
      render(<LoginScreen />);

    fireEvent.press(getAllByText('Sign Up')[0]);
    fireEvent.changeText(getByPlaceholderText('Full name'), 'Alice');
    fireEvent.changeText(getByPlaceholderText('Email address'), 'a@b.com');

    // short password
    fireEvent.changeText(getByPlaceholderText('Create password'), 'short');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'short');
    fireEvent.press(getByText('Create Account'));
    const lenErr = await findByText('Password must be at least 8 characters');
    expect(lenErr).toBeTruthy();

    // mismatch
    fireEvent.changeText(getByPlaceholderText('Create password'), 'longenough');
    fireEvent.changeText(
      getByPlaceholderText('Confirm password'),
      'notmatching',
    );
    fireEvent.press(getByText('Create Account'));
    const matchErr = await findByText('Passwords do not match');
    expect(matchErr).toBeTruthy();
  });

  test('successful signup navigates to tradie route', async () => {
    const expo = require('expo-router');
    const replaceSpy = expo.router.replace;
    expo.useLocalSearchParams.mockReturnValue({ role: 'tradie' });

    const mockSignup = jest
      .fn()
      .mockResolvedValue({ success: true, user: { role: 'tradesperson' } });
    const auth = require('../context/AuthContext');
    auth.useAuth.mockReturnValue({
      signup: mockSignup,
      login: jest.fn(),
      resendVerification: jest.fn(),
    });

    const LoginScreen = require('../app/onboarding/login').default;
    const { getByText, getByPlaceholderText, getAllByText } = render(
      <LoginScreen />,
    );

    fireEvent.press(getAllByText('Sign Up')[0]);
    fireEvent.changeText(getByPlaceholderText('Full name'), 'Alice');
    fireEvent.changeText(getByPlaceholderText('Email address'), 'a@b.com');
    fireEvent.changeText(
      getByPlaceholderText('Create password'),
      'longpassword',
    );
    fireEvent.changeText(
      getByPlaceholderText('Confirm password'),
      'longpassword',
    );
    fireEvent.press(getByText('Create Account'));

    await waitFor(() => expect(replaceSpy).toHaveBeenCalled());
  });
});
