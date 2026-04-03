export const lightColors = {
  primary: '#000000',
  accent: '#2563EB',
  white: '#ffffff',
  background: '#FFFFFF',
  card: '#F6F6F8',
  border: '#E5E7EB',
  text: '#0F172A',
  textSecondary: '#6B7280',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',
};

export const darkColors = {
  primary: '#000000',
  accent: '#2563EB',
  white: '#ffffff',
  background: '#000000',
  card: '#1A1A1A',
  border: '#333333',
  text: '#ffffff',
  textSecondary: '#9CA3AF',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// Mutable Colors object used throughout the app. Call `setThemeMode` to switch.
export const Colors: any = { ...darkColors };

export function setThemeMode(mode: 'light' | 'dark') {
  const source = mode === 'light' ? lightColors : darkColors;
  Object.keys(source).forEach((k) => {
    // @ts-ignore
    Colors[k] = // @ts-ignore
      source[k];
  });
}

export const Typography = {
  heading: {
    fontWeight: '800' as const,
    fontStyle: 'italic' as const,
  },
  body: {
    fontWeight: '400' as const,
  },
  bold: {
    fontWeight: '700' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
