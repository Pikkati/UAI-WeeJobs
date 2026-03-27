import React from 'react';
import { render, act } from '@testing-library/react-native';

describe('SplashScreen navigation', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
    jest.resetModules();
  });

  test('module loads for customer user', () => {
    jest.resetModules();
    jest.doMock('expo-router', () => {
      const mockReplace = jest.fn();
      return { router: { replace: mockReplace }, __getMockReplace: () => mockReplace };
    });
    jest.doMock('../context/AuthContext', () => ({ useAuth: () => ({ user: { role: 'customer' }, isLoading: false, hasSeenOnboarding: false }) }));
    const RN = require('react-native');
    RN.Dimensions = { get: () => ({ width: 400, height: 800 }) };
    const Splash = require('../app/index').default;
    expect(typeof Splash).toBe('function');
  });

  test('module loads for no user', () => {
    jest.resetModules();
    jest.doMock('expo-router', () => {
      const mockReplace = jest.fn();
      return { router: { replace: mockReplace }, __getMockReplace: () => mockReplace };
    });
    jest.doMock('../context/AuthContext', () => ({ useAuth: () => ({ user: null, isLoading: false, hasSeenOnboarding: false }) }));
    const RN = require('react-native');
    RN.Dimensions = { get: () => ({ width: 400, height: 800 }) };
    const Splash = require('../app/index').default;
    expect(typeof Splash).toBe('function');
  });
});
