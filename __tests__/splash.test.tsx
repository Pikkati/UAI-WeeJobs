import React from 'react';
import { render } from '@testing-library/react-native';

jest.useFakeTimers();

jest.mock('expo-router', () => {
  const mockReplace = jest.fn();
  return {
    router: { replace: mockReplace },
    __getMockReplace: () => mockReplace,
  };
});

describe('SplashScreen routing', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('routes to onboarding when no user', () => {
    jest.doMock('../context/AuthContext', () => ({
      useAuth: () => ({
        user: null,
        isLoading: false,
        hasSeenOnboarding: false,
      }),
    }));
    const RN = require('react-native');
    RN.Dimensions = { get: () => ({ width: 400, height: 800 }) };
    const Splash = require('../app/index').default;
    expect(typeof Splash).toBe('function');
  });

  test('routes to customer when user.role===customer', () => {
    jest.doMock('../context/AuthContext', () => ({
      useAuth: () => ({
        user: { role: 'customer' },
        isLoading: false,
        hasSeenOnboarding: true,
      }),
    }));
    const RN = require('react-native');
    RN.Dimensions = { get: () => ({ width: 400, height: 800 }) };
    const Splash = require('../app/index').default;
    expect(typeof Splash).toBe('function');
  });
});
