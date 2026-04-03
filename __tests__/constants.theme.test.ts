import { Colors, setThemeMode } from '../constants/theme';

describe('theme constants', () => {
  test('setThemeMode switches Colors values to light', () => {
    setThemeMode('light');
    expect(Colors.background).toBe('#FFFFFF');
    expect(Colors.text).toBe('#0F172A');
  });

  test('setThemeMode switches Colors values to dark', () => {
    setThemeMode('dark');
    expect(Colors.background).toBe('#000000');
    expect(Colors.text).toBe('#ffffff');
  });
});
