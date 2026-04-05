import React from 'react';
import { render } from '@testing-library/react-native';

import PasswordStrength from '../components/PasswordStrength';

describe('PasswordStrength', () => {
  test('shows Weak for empty or short passwords', () => {
    const { getByText } = render(<PasswordStrength password="" />);
    expect(getByText(/Weak/)).toBeTruthy();
  });

  test('shows Fair for moderate password', () => {
    const { getByText } = render(<PasswordStrength password="abcd1234" />);
    expect(getByText(/Fair/)).toBeTruthy();
  });

  test('shows Strong for complex password', () => {
    const { getByText } = render(<PasswordStrength password="Abcdef1!" />);
    expect(getByText(/Strong|Good/)).toBeTruthy();
  });
});
