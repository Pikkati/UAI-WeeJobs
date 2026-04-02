// Ensure test environment has supabase env vars so createClient doesn't throw.
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'cust1', name: 'Alice', phone: '012345' }, isLoading: false }),
  AuthProvider: ({ children }: any) => children,
}));

const insertMock = jest.fn(async (payload: any) => ({ data: null, error: null }));

// Use the global test override provided by `lib/supabase` so the component
// picks up the test client at runtime. This avoids module-mocking edge
// cases where the imported binding may not reflect the factory mock.
(global as any).__TEST_SUPABASE__ = {
  from: (table: string) => {
    if (table === 'jobs') return { insert: insertMock };
    return { insert: async () => ({ data: null, error: null }) };
  },
  auth: {
    signUp: async () => ({ data: null, error: null }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
  },
  functions: { invoke: async () => ({ data: null, error: null }) },
};

const PostJobScreen = require('../app/customer/post-job').default;
import { LoadingProvider } from '../context/LoadingContext';

describe('Post job photo handling', () => {
  it('includes photos in job insert payload', async () => {
    const initial = {
      name: 'Alice',
      phone: '012345',
      title: 'Fix leaking tap',
      description: 'The kitchen tap has been leaking for a while and needs replacement, please help.',
      budget: '60',
      timing: 'This Week',
      category: 'Plumbing',
      area: 'Test Area',
      photos: ['file://photo1.jpg', 'file://photo2.jpg'],
    };

    const { getByTestId } = render(
      <LoadingProvider>
        <PostJobScreen testInitialValues={initial} />
      </LoadingProvider>
    );

    fireEvent.press(getByTestId('post-job-submit'));

    await waitFor(() => {
      expect(insertMock).toHaveBeenCalled();
      const payload = insertMock.mock.calls[0][0];
      expect(payload.photos).toEqual(initial.photos);
    });
  });
});
