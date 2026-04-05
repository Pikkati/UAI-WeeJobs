import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  router: { replace: jest.fn(), back: jest.fn() },
}));

describe('SignUpScreen', () => {
  const { useLocalSearchParams, router } = require('expo-router');

  beforeEach(() => {
    // Default params
    useLocalSearchParams.mockReturnValue({ role: undefined, email: '' });
  });

  afterEach(() => {
    // Clear test override for useAuth
    // eslint-disable-next-line no-undef
    if (typeof global !== 'undefined' && global.__TEST_USE_AUTH__) {
      delete (global as any).__TEST_USE_AUTH__;
    }
    jest.clearAllMocks();
  });

  it('validates email and advances to details step', async () => {
    const SignUpScreen = require('../app/onboarding/signup').default;
    const { getByPlaceholderText, getByText, queryByText } = render(
      <SignUpScreen />,
    );

    const emailInput = getByPlaceholderText('you@email.com');

    // invalid email
    fireEvent.changeText(emailInput, 'not-an-email');
    fireEvent(emailInput, 'submitEditing');
    expect(getByText('Please enter a valid email address')).toBeTruthy();

    // valid email
    fireEvent.changeText(emailInput, 'me@example.com');
    fireEvent(emailInput, 'submitEditing');

    await waitFor(() => {
      expect(queryByText('Please enter a valid email address')).toBeNull();
      expect(getByText('Create Account')).toBeTruthy();
    });
  });

  it('shows verification message when signup requires verification', async () => {
    const SignUpScreen = require('../app/onboarding/signup').default;

    // Provide a test useAuth with a signup that requests verification
    // eslint-disable-next-line no-undef
    (global as any).__TEST_USE_AUTH__ = () => ({
      signup: async () => ({ success: true, needsVerification: true }),
    });

    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    const emailInput = getByPlaceholderText('you@email.com');

    // Advance to details
    fireEvent.changeText(emailInput, 'me@example.com');
    fireEvent(emailInput, 'submitEditing');

    // Fill details
    const nameInput = getByPlaceholderText('Your name');
    const passwordInput = getByPlaceholderText('Create a password');
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(passwordInput, 'supersecure');

    fireEvent.press(getByText('Create Account'));

    await waitFor(() => expect(getByText('Verify your email')).toBeTruthy());
  });

  it('routes to tradie home when signup returns tradesperson user', async () => {
    const SignUpScreen = require('../app/onboarding/signup').default;

    const mockReplace = router.replace;

    // eslint-disable-next-line no-undef
    (global as any).__TEST_USE_AUTH__ = () => ({
      signup: async () => ({
        success: true,
        user: { role: 'tradesperson', id: 'u1', email: 'a@b.c' },
      }),
    });

    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    const emailInput = getByPlaceholderText('you@email.com');

    // Advance to details
    fireEvent.changeText(emailInput, 'me@example.com');
    fireEvent(emailInput, 'submitEditing');

    // Fill details
    const nameInput = getByPlaceholderText('Your name');
    const passwordInput = getByPlaceholderText('Create a password');
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(passwordInput, 'supersecure');

    fireEvent.press(getByText('Create Account'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/tradie/home');
    });
  });
});
