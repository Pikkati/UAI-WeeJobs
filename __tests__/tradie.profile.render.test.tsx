import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-router', () => ({ router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() } }), { virtual: true });
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }), { virtual: true });

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'u1',
      name: 'Test Tradie',
      email: 'tradie@example.com',
      pricing_default: 'fixed',
      hourly_rate: 30,
      portfolio_photos: [],
    },
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }),
}), { virtual: true });

describe('TradieProfileScreen render', () => {
  test('renders profile header and user name', () => {
    const TradieProfileScreen = require('../app/tradie/profile').default;
    const { getByText, getAllByText } = render(<TradieProfileScreen />);

    expect(getByText('Profile')).toBeTruthy();
    // Multiple occurrences of the name may exist (header, avatar area, etc.)
    expect(getAllByText('Test Tradie').length).toBeGreaterThan(0);
  });
});
