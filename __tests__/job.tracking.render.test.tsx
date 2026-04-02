import React from 'react';
import { render } from '@testing-library/react-native';
import JobTrackingScreen from '../app/job/tracking'; // Try named import if default fails
import { JobsProvider } from '../context/JobsContext';

// Mock router + params
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ jobId: 'j1' })),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}), { virtual: true });

jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }), { virtual: true });




import { JobsProvider } from '../context/JobsContext';
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '123',
      name: 'Test User',
      email: 'testuser@example.com',
      phone: '123-456-7890',
      area: 'Test Area',
      role: 'tradesperson',
      pricing_default: 'fixed',
      hourly_rate: 50,
      bio: 'Experienced tradie',
      areas_covered: ['Area 1', 'Area 2'],
      portfolio_photos: [],
      trade_categories: ['Plumbing', 'Electrical'],
    },
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }),
}));

// Mock for `constants/theme`
jest.mock('constants/theme', () => ({
  Colors: {
    primary: '#000',
    accent: '#2563EB',
  },
  Spacing: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  BorderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
}), { virtual: true });

// Extend the mock for @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: {
    loadFont: jest.fn(),
  },
}), { virtual: true });

// Mock for `supabase` configuration
import { supabase } from 'lib/supabase';
jest.mock('lib/supabase', () => ({
  supabase: {
    auth: {
      signIn: jest.fn(() => Promise.resolve({ user: { id: '123', name: 'Test User' } })),
      signOut: jest.fn(() => Promise.resolve()),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { id: '1', name: 'Job 1' } })) })) })),
      insert: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { id: '2', name: 'Job 2' } })) })),
    })),
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('JobTrackingScreen render', () => {
  test('renders header, map preview and ETA for on_the_way', async () => {
    const { findByText } = render(
      <JobTrackingScreen />
    );

    // Header
    const header = await findByText('Job Tracking');
    expect(header).toBeTruthy();

    // Map preview
    const map = await findByText('Map Preview');
    expect(map).toBeTruthy();

    // ETA card should be visible for on_the_way
    const eta = await findByText('Estimated arrival');
    expect(eta).toBeTruthy();
  });
});
