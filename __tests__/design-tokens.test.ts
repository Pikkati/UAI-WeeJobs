import DT, {
  Colors as DTColors,
  Spacing as DTSpacing,
  BorderRadius as DTBorder,
} from '../constants/design-tokens';
import tokens, {
  Colors,
  Spacing,
  BorderRadius,
} from '../constants/design-tokens';

describe('design-tokens', () => {
  test('exports Colors, Spacing, and BorderRadius', () => {
    expect(DTColors).toBeDefined();
    expect(DTSpacing).toBeDefined();
    expect(DTBorder).toBeDefined();
  });

  test('has expected color keys', () => {
    expect(DTColors).toHaveProperty('background');
    expect(DTColors).toHaveProperty('text');
    expect(DTColors).toHaveProperty('accent');
  });

  test('spacing values are numbers and increasing', () => {
    expect(typeof DTSpacing.md).toBe('number');
    expect(DTSpacing.xl).toBeGreaterThan(DTSpacing.md);
  });
});

describe('design-tokens', () => {
  test('default export contains Colors/Spacing/BorderRadius', () => {
    expect(tokens).toBeDefined();
    expect(tokens.Colors).toBe(Colors);
    expect(tokens.Spacing).toBe(Spacing);
    expect(tokens.BorderRadius).toBe(BorderRadius);
  });

  test('Colors has expected keys and color hexes', () => {
    expect(typeof Colors).toBe('object');
    expect(Colors).toHaveProperty('background');
    expect(Colors.background).toMatch(/^#/);
    expect(Colors).toHaveProperty('text');
    expect(Colors.text).toMatch(/^#/);
  });

  test('Spacing has numeric values', () => {
    expect(Spacing).toBeTruthy();
    expect(Spacing).toHaveProperty('sm');
    expect(typeof Spacing.sm).toBe('number');
    expect(Spacing.md).toBeGreaterThanOrEqual(0);
  });

  test('BorderRadius values are numeric', () => {
    expect(BorderRadius).toHaveProperty('md');
    expect(typeof BorderRadius.md).toBe('number');
    expect(BorderRadius.full).toBeGreaterThanOrEqual(0);
  });
});
