// Ensure required env vars so createClient doesn't throw
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PostJobScreen from '../app/customer/post-job';
import { AuthProvider } from '../context/AuthContext';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({ insert: async () => ({ data: null, error: null }) }),
  },
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  router: { push: jest.fn(), back: jest.fn() },
}));

describe('PostJob validation', () => {
  it('shows title validation error when title is too short', async () => {
    const initial = {
      name: 'Alice',
      phone: '0123456789',
      title: 'short',
      description:
        'This description is long enough to pass the description validation.',
      budget: '50',
      timing: 'This Week',
      category: 'Plumbing',
      area: 'Test Area',
    };

    const { getByTestId, getByText } = render(
      <AuthProvider>
        <PostJobScreen testInitialValues={initial} />
      </AuthProvider>,
    );
    fireEvent.press(getByTestId('post-job-submit'));

    await waitFor(() => {
      expect(getByText('Title must be at least 10 characters')).toBeTruthy();
    });
  });

  it('shows description validation error when description is too short', async () => {
    const initial = {
      name: 'Bob',
      phone: '0987654321',
      title: 'A valid title here',
      description: 'short',
      budget: '50',
      timing: 'This Week',
      category: 'Plumbing',
      area: 'Test Area',
    };

    const { getByTestId, getByText } = render(
      <AuthProvider>
        <PostJobScreen testInitialValues={initial} />
      </AuthProvider>,
    );
    fireEvent.press(getByTestId('post-job-submit'));

    await waitFor(() => {
      expect(
        getByText('Description must be at least 30 characters'),
      ).toBeTruthy();
    });
  });
});
