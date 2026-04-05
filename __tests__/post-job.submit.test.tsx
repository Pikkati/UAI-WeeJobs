import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Configure the global test supabase container so the runtime resolver
// inside `lib/supabase` returns our test client. This avoids module-mocking
// edge-cases where the imported binding may not reflect the mock.
const insertMock = jest.fn(async () => ({ data: [{ id: 'j1' }], error: null }));
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

// Mock auth so component has a user
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'cust1', name: 'Test User', phone: '0700000000' },
    isLoading: false,
  }),
  AuthProvider: ({ children }: any) => children,
}));

// Mock router so we can assert navigation
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

const PostJobScreen = require('../app/customer/post-job').default;
const { router } = require('expo-router');

describe('PostJob submit flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Make Alert.alert call the first button's onPress so navigation occurs
    jest
      .spyOn(Alert, 'alert')
      .mockImplementation((title: any, msg: any, buttons: any) => {
        if (
          Array.isArray(buttons) &&
          buttons[0] &&
          typeof buttons[0].onPress === 'function'
        ) {
          buttons[0].onPress();
        }
      });
  });

  afterEach(() => {
    // @ts-ignore
    Alert.alert.mockRestore && Alert.alert.mockRestore();
  });

  it('submits a valid job and navigates to customer jobs', async () => {
    const initial = {
      name: 'Alice Tester',
      phone: '0712345678',
      email: 'alice@example.com',
      area: 'Test Area',
      category: 'Plumbing',
      title: 'Fix leaking kitchen tap',
      description:
        'There is a leak under the kitchen sink that needs fixing urgently. Please advise.',
      timing: 'ASAP',
      budget: '120',
      photos: [],
    };

    const { getByTestId } = render(
      <PostJobScreen testInitialValues={initial as any} />,
    );

    fireEvent.press(getByTestId('post-job-submit'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });

    expect(router.push).toHaveBeenCalledWith('/customer/jobs');
  });
});
