import { scorePassword } from '../components/PasswordStrength';

describe('scorePassword', () => {
  test('scores empty and simple passwords correctly', () => {
    expect(scorePassword('')).toBe(0);
    expect(scorePassword('short')).toBe(0);
    expect(scorePassword('longerpw')).toBe(1); // length >=8
  });

  test('detects mixed-case, digits and symbols', () => {
    expect(scorePassword('Abcd1234')).toBe(3);
    expect(scorePassword('Abcd1234!')).toBe(4);
    expect(scorePassword('abcd1234')).toBe(2);
  });
});
