// Mock native AsyncStorage for Jest so the supabase client can import safely.
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => null),
    removeItem: jest.fn(async () => null),
  },
}));

// Mock the supabase client factory so we don't attempt to validate real URLs.
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
  })),
}));

// Ensure test environment has supabase env vars so createClient doesn't throw.
process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

import { supabase } from '../lib/supabase';

describe('supabase client', () => {
  test('exports a supabase client with query methods', () => {
    expect(supabase).toBeDefined();
    expect(typeof (supabase as any).from).toBe('function');
  });
});
