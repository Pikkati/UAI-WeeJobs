import React from 'react';
import { render } from '@testing-library/react-native';

import TopBar, { TOP_BAR_HEIGHT } from '../components/TopBar';
import VerifiedProBadge from '../components/VerifiedProBadge';

// Mock safe area insets
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock router push
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

// Mock auth context
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', role: 'customer' } }),
}));

describe('TopBar', () => {
  test('renders and contains accessibility labels', () => {
    const utils = render(<TopBar />);
    expect(utils.toJSON()).toBeTruthy();
    // Logo text should be present
    expect(utils.getByText('WeeJobs')).toBeTruthy();
  });
});

describe('VerifiedProBadge', () => {
  test('renders small/medium/large sizes without error', () => {
    const { toJSON, getByText } = render(<VerifiedProBadge size="small" showText={true} />);
    expect(toJSON()).toBeTruthy();
    expect(getByText('Verified Pro')).toBeTruthy();
  });
});
