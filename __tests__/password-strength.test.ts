import { scorePassword } from '../components/PasswordStrength';

describe('scorePassword()', () => {
  test('returns 0 for empty or very weak passwords', () => {
    expect(scorePassword('')).toBe(0);
    expect(scorePassword('abc')).toBe(0);
  });

  test('counts length and mixed case', () => {
    // length >= 8 and mixed case => 2
    expect(scorePassword('abcdABCD')).toBe(2);
  });

  test('counts digits as an extra point', () => {
    // length + mixed case + digits => 3
    expect(scorePassword('abcABC12')).toBe(3);
  });

  test('counts special characters for max score', () => {
    // length + mixed case + digits + special => 4
    expect(scorePassword('Abc12$xy')).toBe(4);
  });
});
