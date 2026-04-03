import React from 'react';
import { render } from '@testing-library/react-native';

// Mock AuthContext to return a user
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Test User' } }),
  AuthProvider: ({ children }: any) => children,
}));

// Mock router to avoid navigation
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn() } }));

describe('CustomerHome (app/customer/index)', () => {
  test('module loads and exports a component', () => {
    const Customer = require('../app/customer/index').default;
    expect(typeof Customer).toBe('function');
  });
});
