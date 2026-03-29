import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

// Some RN list components are virtualized and may not render items in the
// test renderer. Replace `FlatList` with a simple mapping implementation so
// items are rendered synchronously for assertions below.
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');
  return {
    ...RN,
    FlatList: (props: any) => {
      const { data, renderItem } = props || {};
      return React.createElement(RN.View, {}, data && data.map((item: any, index: number) => renderItem({ item, index })));
    },
  };
});

// Minimal expo-router stub used by the screen
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() }, useLocalSearchParams: () => ({}) }), { virtual: true });
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }), { virtual: true });

const mockFetchJobs = jest.fn();
const mockCloseApplications = jest.fn();

const mockJob = {
  id: 'job1',
  customer_id: 'u1',
  status: 'open',
  description: 'Fix sink',
  area: 'Test Area',
  timing: 'ASAP',
  category: 'plumbing',
  created_at: new Date().toISOString(),
};

jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1', role: 'customer' } }) }), { virtual: true });

jest.mock('../context/JobsContext', () => ({
  useJobs: () => ({
    jobs: [mockJob],
    loading: false,
    fetchJobs: mockFetchJobs,
    closeApplications: mockCloseApplications,
  }),
}), { virtual: true });

describe('CustomerJobsScreen render', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Seed job_interests so fetchInterestCounts produces non-zero counts
    // eslint-disable-next-line no-undef
    const g: any = typeof global !== 'undefined' ? global : (globalThis as any);
    if (g && g.__TEST_SUPABASE__ && typeof g.__TEST_SUPABASE__.setResponse === 'function') {
      g.__TEST_SUPABASE__.setResponse('job_interests', [{ job_id: 'job1' }, { job_id: 'job1' }]);
    }
  });

  test('renders job and shows interest banner when counts > 0', async () => {
    const CustomerJobsScreen = require('../app/customer/jobs').default;
    const { getByText, queryByText } = render(<CustomerJobsScreen />);

    expect(getByText('My Jobs')).toBeTruthy();
    expect(getByText('Fix sink')).toBeTruthy();

    await waitFor(() => {
      // Interest banner contains the word 'interested'
      expect(queryByText(/interested/)).toBeTruthy();
    });
  });
});
