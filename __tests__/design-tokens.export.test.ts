import DT, { Colors, Spacing, BorderRadius } from '../constants/design-tokens';

describe('design tokens export', () => {
  it('exports Colors, Spacing and BorderRadius', () => {
    expect(Colors).toBeDefined();
    expect(Spacing).toBeDefined();
    expect(BorderRadius).toBeDefined();
    // default export should include the named exports
    expect(DT.Colors).toBe(Colors);
  });

  it('Colors contain expected keys', () => {
    expect(typeof Colors.background).toBe('string');
    expect(typeof Colors.text).toBe('string');
  });
});
