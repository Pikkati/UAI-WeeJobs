// Ensure test environment has supabase env vars so createClient doesn't throw.
import React from 'react';
import { render } from '@testing-library/react-native';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
const PostJobScreen = require('../app/customer/post-job').default;

jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'cust1', name: 'Alice', phone: '012345' }, isLoading: false }),
  AuthProvider: ({ children }: any) => children,
}));
jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({}), useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }), router: { push: jest.fn() } }));

describe('PostJob photo limit UI', () => {
  it('does not show Add Photo when photos length >= 5', () => {
    const initial = { photos: ['a', 'b', 'c', 'd', 'e'] };
    const { queryByText } = render(<PostJobScreen testInitialValues={initial} />);
    expect(queryByText('Add Photo')).toBeNull();
  });
});
