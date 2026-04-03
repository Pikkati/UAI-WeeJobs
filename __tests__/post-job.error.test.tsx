// Ensure test env variables so createClient doesn't throw
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../context/AuthContext';
import PostJobScreen from '../app/customer/post-job';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({ insert: async () => ({ data: null, error: { message: 'db failure' } }) }),
  },
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  router: { push: jest.fn(), back: jest.fn() },
}));

describe('PostJobScreen — API error handling', () => {
  it('shows error alert when supabase.insert returns an error', async () => {
    const initial = {
      name: 'Test User',
      phone: '0123456789',
      title: 'Valid title more than ten chars',
      description: 'This description is long enough to satisfy validation requirements.',
      budget: '50',
      timing: 'This Week',
      category: 'Plumbing',
      area: 'Test Area',
    };

    const { getByTestId } = render(
      <AuthProvider>
        <PostJobScreen testInitialValues={initial} />
      </AuthProvider>
    );

    const { Alert } = require('react-native');
    jest.spyOn(Alert, 'alert');

    fireEvent.press(getByTestId('post-job-submit'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to post job. Please try again.');
    });
  });
});
