import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => 'Icon',
}));

jest.mock('expo-image', () => ({
  Image: (props: any) => null,
}));

// Mock useAuth provider
// eslint-disable-next-line no-undef
(global as any).__TEST_USE_AUTH__ = () => ({
  user: {
    id: 'u1',
    email: 'john@weejobs.test',
    name: 'John',
    role: 'tradesperson',
    trade_categories: ['Plumbing'],
    areas_covered: ['Portrush'],
    portfolio_photos: [],
  },
  logout: jest.fn(),
  refreshUser: jest.fn(),
});

// Do not override the default `__TEST_SUPABASE__` set by `jest-setup.js`.
// The default container provides a chainable, safe API for simple
// update/eq calls used in this screen.

describe('TradieProfileScreen', () => {
  it('renders basic profile info and allows toggling areas', async () => {
    const Screen = require('../app/tradie/profile').default;
    const { getByText, getByPlaceholderText, getAllByText } = render(
      <Screen />,
    );

    // Basic user info
    expect(getByText('Profile')).toBeTruthy();
    const johns = getAllByText('John');
    expect(johns.length).toBeGreaterThanOrEqual(1);

    // Open area picker and assert we're in the picker state
    fireEvent.press(getByText('Select areas you cover'));
    await waitFor(() => expect(getByText('Done selecting')).toBeTruthy());

    // Toggle the area picker item (pick the last match to avoid the info-card label)
    const porrs = getAllByText('Portrush');
    fireEvent.press(porrs[porrs.length - 1]);

    // Save areas and expect the picker to close (UI state change)
    fireEvent.press(getByText('Save Service Areas'));
    await waitFor(() =>
      expect(getByText('Select areas you cover')).toBeTruthy(),
    );
  });
});
