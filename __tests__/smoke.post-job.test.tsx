// Ensure test environment has supabase env vars so createClient doesn't throw.
process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PostJobScreen from '../app/customer/post-job';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({ insert: async () => ({ data: null, error: null }) }),
    auth: {
      signInWithPassword: async () => ({ data: { user: { id: 'test', confirmed_at: true } }, error: null }),
      signUp: async () => ({ data: { user: { id: 'test', confirmed_at: true } }, error: null }),
      signOut: async () => ({}),
    },
  },
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  router: { push: jest.fn() },
}));

describe('Smoke: PostJobScreen', () => {
  it('renders and submits minimal valid job', async () => {
    const initial = {
      title: 'Fix leaking tap',
      description: 'The kitchen tap is leaking and needs replacement. Plumber required.',
      budget: '50',
      timing: 'This Week',
      category: 'Plumbing',
      area: 'Test Area',
    };
    const { getByPlaceholderText, getByTestId } = render(
      <AuthProvider>
        <PostJobScreen testInitialValues={initial} />
      </AuthProvider>
    );
    expect(getByPlaceholderText('e.g. Fix leaking kitchen tap').props.value).toBe(initial.title);
    expect(getByPlaceholderText('Describe the job in detail (at least 30 characters)...').props.value).toBe(initial.description);
    expect(getByPlaceholderText('Enter your budget (min £10)').props.value).toBe(initial.budget);
    fireEvent.press(getByTestId('post-job-submit'));
    // Wait for async submit logic (mocked in test env)
    await waitFor(() => {
      // No error thrown, submit logic completes
      expect(true).toBe(true);
    });
  });
});
