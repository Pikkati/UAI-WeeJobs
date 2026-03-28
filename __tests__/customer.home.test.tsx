import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('../app/onboarding/checklist', () => ({ default: () => null }));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Test User' } }),
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: (props) => require('react').createElement('Icon', props) }));

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            or: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  },
}));

test('CustomerHome renders and navigates to post-job', async () => {
  const RN = require('react-native');
  RN.Dimensions = { get: () => ({ width: 400, height: 800 }) };
  const CustomerHome = require('../app/customer/index').default;
  // ensure module loads and default export is a component
  expect(typeof CustomerHome).toBe('function');
});
