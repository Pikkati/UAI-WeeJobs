import React from 'react';

describe('CustomerProfile module', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('module loads as a function', () => {
    jest.doMock('expo-router', () => ({ router: { replace: jest.fn() } }));
    // Mock supabase to avoid importing native modules; keep AuthContext mocked
    jest.doMock('../lib/supabase', () => ({
      supabase: {
        from: () => ({
          select: () => ({
            eq: () => ({ then: (fn: any) => fn({ data: [] }) }),
          }),
        }),
      },
    }));
    jest.doMock('../context/AuthContext', () => ({
      useAuth: () => ({
        user: { id: 'u1', name: 'Test User', email: 'a@b.com' },
        logout: jest.fn(),
      }),
    }));

    const RN = require('react-native');
    RN.Dimensions = { get: () => ({ width: 400, height: 800 }) };

    const Profile = require('../app/customer/profile').default;
    expect(typeof Profile).toBe('function');
  });
});
