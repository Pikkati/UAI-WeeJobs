import React from 'react';
import { render } from '@testing-library/react-native';

// Mock router + params
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ jobId: 'job1', recipientName: 'Alice', jobCategory: 'Plumbing' }),
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
}), { virtual: true });

jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }), { virtual: true });

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', role: 'customer' },
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }),
}), { virtual: true });

describe('ChatScreen render', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // seed test supabase responses when available
    // eslint-disable-next-line no-undef
    const g: any = typeof global !== 'undefined' ? global : (globalThis as any);
    if (g && g.__TEST_SUPABASE__ && typeof g.__TEST_SUPABASE__.setResponse === 'function') {
      g.__TEST_SUPABASE__.clearResponses?.();
      g.__TEST_SUPABASE__.setResponse('jobs', [
        { id: 'job1', tradie_id: 't1', customer_id: 'c1', name: 'Seed Job', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ]);

      g.__TEST_SUPABASE__.setResponse('messages', [
        { id: 'm1', job_id: 'job1', sender_id: 'u1', receiver_id: 't1', content: 'Hello from user', created_at: new Date().toISOString(), read: true },
        { id: 'm2', job_id: 'job1', sender_id: 't1', receiver_id: 'u1', content: 'Reply from tradie', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: false },
      ]);
    }
  });

  test('renders header and seeded messages', async () => {
    const ChatScreen = require('../app/chat/[jobId]').default;
    const { findByText } = render(<ChatScreen />);

    // header should show recipientName once loading completes
    const header = await findByText('Alice');
    expect(header).toBeTruthy();

    // seeded messages should appear
    const m = await findByText('Hello from user');
    expect(m).toBeTruthy();
    const r = await findByText('Reply from tradie');
    expect(r).toBeTruthy();
  });
});
