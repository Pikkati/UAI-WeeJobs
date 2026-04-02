import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient } from '../lib/supabase';
import { SupabaseError, handleSupabaseResult } from '../lib/supabase-error';

// Mock the @supabase/supabase-js module
const mockAuth = {
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  resetPasswordForEmail: jest.fn(),
};

const mockFrom = jest.fn(() => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn(),
}));

const mockSupabaseClient = {
  auth: mockAuth,
  from: mockFrom,
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
}));

// Mock optional error tracking
jest.mock('../lib/audit', () => ({
  auditAction: jest.fn(),
}));

describe('Supabase Client Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    delete (global as any).__TEST_SUPABASE__;
    
    // Reset environment variables
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    delete (global as any).__TEST_SUPABASE__;
  });

  describe('Client Initialization & Configuration', () => {
    it('should create real client when environment variables are present', () => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      // Re-require the module after setting env vars
      jest.resetModules();
      require('../lib/supabase');

      expect(createClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          auth: expect.objectContaining({
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
          })
        })
      );
    });

    it('should provide fallback client when environment variables are missing', async () => {
      // No env vars set
      jest.resetModules();
      const { supabase } = require('../lib/supabase');

      // Should not throw when calling methods on fallback client
      const result = await supabase.from('test').select('*').single();
      
      expect(result).toEqual({ data: null, error: null });
      expect(createClient).not.toHaveBeenCalled();
    });

    it('should use TEST_SUPABASE override when available', () => {
      const testClient = {
        auth: { signIn: jest.fn() },
        from: jest.fn(() => ({ select: jest.fn() })),
      };

      (global as any).__TEST_SUPABASE__ = testClient;

      jest.resetModules();
      const { supabase } = require('../lib/supabase');

      expect(supabase.auth.signIn).toBe(testClient.auth.signIn);
      expect(supabase.from).toBe(testClient.from);
    });
  });

  describe('Authentication Methods', () => {
    beforeEach(() => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      jest.resetModules();
    });

    it('should handle successful sign up', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { supabase } = require('../lib/supabase');
      const result = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.data.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle sign up errors', async () => {
      const mockError = { message: 'Email already registered' };
      mockAuth.signUp.mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const { supabase } = require('../lib/supabase');
      const result = await supabase.auth.signUp({
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(result.data.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should handle successful sign in', async () => {
      const mockUser = { id: '123', email: 'test@example.com', confirmed_at: '2024-01-01' };
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token123' } },
        error: null,
      });

      const { supabase } = require('../lib/supabase');
      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.data.user).toEqual(mockUser);
      expect(result.data.session.access_token).toBe('token123');
      expect(result.error).toBeNull();
    });

    it('should handle invalid credentials', async () => {
      const mockError = { message: 'Invalid credentials' };
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const { supabase } = require('../lib/supabase');
      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.data.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('Database Query Operations', () => {
    beforeEach(() => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      jest.resetModules();
    });

    it('should handle select queries', async () => {
      const mockData = [{ id: 1, name: 'Test Job' }, { id: 2, name: 'Another Job' }];
      mockFrom().single.mockResolvedValue({ data: mockData, error: null });

      const { supabase } = require('../lib/supabase');
      const result = await supabase.from('jobs').select('*').single();

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith('jobs');
      expect(mockFrom().select).toHaveBeenCalledWith('*');
    });

    it('should handle insert operations', async () => {
      const newJob = { title: 'Fix sink', description: 'Kitchen sink not working' };
      const createdJob = { id: 3, ...newJob };
      mockFrom().single.mockResolvedValue({ data: createdJob, error: null });

      const { supabase } = require('../lib/supabase');
      const result = await supabase.from('jobs').insert(newJob).single();

      expect(result.data).toEqual(createdJob);
      expect(mockFrom().insert).toHaveBeenCalledWith(newJob);
    });

    it('should handle database query errors', async () => {
      const mockError = { message: 'Relation does not exist', code: '42P01' };
      mockFrom().single.mockResolvedValue({ data: null, error: mockError });

      const { supabase } = require('../lib/supabase');
      const result = await supabase.from('nonexistent_table').select('*').single();

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('Error Handling', () => {
    describe('SupabaseError class', () => {
      it('should create error with message and context', () => {
        const error = new SupabaseError('Database error', { table: 'users', operation: 'select' });
        
        expect(error.message).toBe('Database error');
        expect(error.context).toEqual({ table: 'users', operation: 'select' });
        expect(error.name).toBe('SupabaseError');
      });
    });

    describe('handleSupabaseResult', () => {
      it('should return data on success', () => {
        const successResponse = { data: { id: 1, name: 'Test' }, error: null };
        const result = handleSupabaseResult(successResponse);
        
        expect(result).toEqual({ id: 1, name: 'Test' });
      });

      it('should throw SupabaseError on error response', () => {
        const errorResponse = { data: null, error: { message: 'Not found' } };
        
        expect(() => handleSupabaseResult(errorResponse)).toThrow(SupabaseError);
        expect(() => handleSupabaseResult(errorResponse)).toThrow('Not found');
      });

      it('should handle null data without error', () => {
        const nullResponse = { data: null, error: null };
        const result = handleSupabaseResult(nullResponse);
        
        expect(result).toBeNull();
      });
    });
  });

  describe('Fallback Chain Behavior', () => {
    it('should provide chainable interface when no client available', async () => {
      // No env vars, no TEST_SUPABASE
      jest.resetModules();
      const { supabase } = require('../lib/supabase');

      // Should not throw and return expected format
      const result = await supabase
        .from('any_table')
        .select('*')
        .eq('column', 'value')
        .order('created_at')
        .limit(10)
        .single();

      expect(result).toEqual({ data: null, error: null });
    });

    it('should handle auth methods in fallback mode', async () => {
      jest.resetModules();
      const { supabase } = require('../lib/supabase');

      const signInResult = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password',
      });

      expect(signInResult).toEqual({ data: { user: null, session: null }, error: null });
    });
  });
});
