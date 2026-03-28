import { Colors, setThemeMode, Typography } from '../constants/theme';

describe('theme utilities', () => {
  beforeEach(() => {
    // ensure deterministic starting state
    setThemeMode('dark');
  });

  test('Colors is mutable and reflects light mode', () => {
    setThemeMode('light');
    expect(Colors.background).toBe('#FFFFFF');
  });

  test('Typography contains heading and body styles', () => {
    expect(Typography).toHaveProperty('heading');
    expect(Typography.heading).toHaveProperty('fontWeight');
    expect(Typography.body.fontWeight).toBe('400');
  });
});
