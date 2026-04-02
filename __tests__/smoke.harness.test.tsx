import React from 'react';
import { render } from '@testing-library/react-native';

import PostJobScreen from '../app/customer/post-job';
import { LoadingProvider } from '../context/LoadingContext';

// Lightweight mocks for a quick smoke render of the Splash screen.
jest.mock('../lib/sentry', () => ({}));
jest.mock('expo-image', () => ({ Image: (props: any) => require('react').createElement('Image', props) }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: (props: any) => require('react').createElement('View', props) }));
jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: null, isLoading: false, hasSeenOnboarding: false }) }));
jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({}), useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }), router: { replace: jest.fn(), push: jest.fn() } }));
// Prevent loading the real supabase client / native async storage in this smoke test
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: (table: string) => ({
      insert: jest.fn(async () => ({ data: null, error: null })),
      select: jest.fn(async () => ({ data: null, error: null })),
    }),
  },
}));

test('PostJobScreen renders without crashing (smoke)', () => {
  const { getByText } = render(
    <LoadingProvider>
      <PostJobScreen />
    </LoadingProvider>
  );
  expect(getByText('Post a Job')).toBeTruthy();
});
