import React from 'react';
import { render } from '@testing-library/react-native';
import { useAuth } from '../context/AuthContext';

function TestComponent() {
  useAuth();
  return null;
}

describe('useAuth hook', () => {
  test('throws when used outside AuthProvider', () => {
    // The repo adds a Jest-only fallback `global.__TEST_USE_AUTH__` in jest-setup.js
    // to make tests more robust. Temporarily remove it for this test so
    // `useAuth()` will throw when not wrapped in a provider.
    const orig = (global as any).__TEST_USE_AUTH__;
    try {
      try {
        // delete may fail in some environments so guard it
        delete (global as any).__TEST_USE_AUTH__;
      } catch (_) {
        (global as any).__TEST_USE_AUTH__ = undefined;
      }
      expect(() => render(<TestComponent />)).toThrow(
        'useAuth must be used within an AuthProvider',
      );
    } finally {
      (global as any).__TEST_USE_AUTH__ = orig;
    }
  });
});
