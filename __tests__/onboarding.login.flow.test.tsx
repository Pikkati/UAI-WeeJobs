import React from 'react';

import { render, fireEvent, act } from '@testing-library/react-native';
// Mock Animated APIs used by the login screen to avoid missing Value errors
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Animated = {
    Value: function (v) { this._value = v; this.setValue = (x) => { this._value = x; }; this.interpolate = () => ({ __getValue: () => 0, }); },
    spring: () => ({ start: () => {} }),
    timing: () => ({ start: () => {} }),
  };
  return RN;
});

// Mock expo/image and vector icons to simple elements for test environment
jest.mock('expo-image', () => ({
  Image: (props: any) => {
    const React = require('react');
    return React.createElement('Image', props);
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props: any) => {
    const React = require('react');
    return React.createElement('Icon', props);
  },
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(async () => ({ success: true, user: { role: 'customer' } })),
    signup: jest.fn(async () => ({ success: true, user: { role: 'customer' } })),
    resendVerification: jest.fn(async () => ({ success: true })),
  }),
}));

// Module-load style test to ensure onboarding login module imports without fatal errors
describe('Onboarding login module-load', () => {
  it('loads the module without throwing', () => {
    const mod = require('../app/onboarding/login');
    expect(typeof mod.default).toBe('function');
  });
});
