import React from 'react';
import { render } from '@testing-library/react-native';
import { useAuth } from '../context/AuthContext';

function TestComponent() {
  useAuth();
  return null;
}

describe('useAuth hook', () => {
  test('throws when used outside AuthProvider', () => {
    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');
  });
});
