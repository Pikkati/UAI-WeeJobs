import { supabase } from '../lib/supabase';

// Simple test that verifies the supabase client is exported
describe('Supabase Client', () => {
  it('should export a supabase client', () => {
    expect(supabase).toBeDefined();
  });

  it('should have auth methods', () => {
    expect(supabase.auth).toBeDefined();
    expect(typeof supabase.auth.signInWithPassword).toBe('function');
    expect(typeof supabase.auth.signUp).toBe('function');
    expect(typeof supabase.auth.signOut).toBe('function');
  });

  it('should have database query methods', () => {
    expect(supabase.from).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });

  it('should create a chainable query interface', () => {
    const query = supabase.from('test_table');
    expect(query).toBeDefined();
    expect(typeof query.select).toBe('function');
    expect(typeof query.insert).toBe('function');
    expect(typeof query.update).toBe('function');
    expect(typeof query.delete).toBe('function');
  });

  it('should support method chaining', async () => {
    // Test that method chaining works without throwing errors
    const queryChain = supabase
      .from('users')
      .select('*');
    
    expect(queryChain).toBeDefined();
    expect(typeof queryChain.eq).toBe('function');
    expect(typeof queryChain.order).toBe('function');
  });
});
