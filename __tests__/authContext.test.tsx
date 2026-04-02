import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import the AuthContext and its components
import { AuthProvider, useAuth, normalizeUserRole, buildNormalizedUser } from '../context/AuthContext';

// Mock modules
jest.mock('../lib/supabase', () => ({
  createSupabaseClient: jest.fn(),
}));

jest.mock('../lib/analytics', () => ({
  trackEvent: jest.fn(),
}));

jest.mock('../lib/audit', () => ({
  auditAction: jest.fn(),
}));

jest.mock('../lib/rateLimiter', () => ({
  checkRateLimit: jest.fn(() => true),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    storage: {} as Record<string, string>,
    getItem: jest.fn(async (k: string) => ((global as any).__asyncStorage?.[k] ?? null)),
    setItem: jest.fn(async (k: string, v: string) => { 
      (global as any).__asyncStorage = (global as any).__asyncStorage || {}; 
      (global as any).__asyncStorage[k] = v; 
    }),
    removeItem: jest.fn(async (k: string) => { 
      (global as any).__asyncStorage = (global as any).__asyncStorage || {}; 
      delete (global as any).__asyncStorage[k]; 
    }),
    clear: jest.fn(async () => { (global as any).__asyncStorage = {}; }),
    getAllKeys: jest.fn(async () => Object.keys((global as any).__asyncStorage || {})),
    __INTERNAL_RESET: jest.fn(() => { (global as any).__asyncStorage = {}; })
  }
}));

// Mock constants
jest.mock('../constants/data', () => ({
  TEST_USERS: [
    { id: 'test-user-1', email: 'test@example.com', password: 'password123' },
    { id: 'test-user-2', email: 'tradie@example.com', password: 'password123' },
  ],
}));

describe('AuthContext', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    // Reset AsyncStorage
    jest.clearAllMocks();
    (global as any).__asyncStorage = {};
    (AsyncStorage as any).__INTERNAL_RESET();

    // Setup default Supabase client mock
    mockSupabaseClient = {
      from: jest.fn((table) => ({
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
      auth: {
        signUp: jest.fn().mockResolvedValue({ 
          data: { user: { id: '123', email: 'test@example.com', confirmed_at: '2024-01-01' } }, 
          error: null 
        }),
        signInWithPassword: jest.fn().mockResolvedValue({ 
          data: { user: { id: '123', email: 'test@example.com', confirmed_at: '2024-01-01' } }, 
          error: null 
        }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
      },
    };

    // Set global test supabase
    (global as any).__TEST_SUPABASE__ = mockSupabaseClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete (global as any).__TEST_SUPABASE__;
    (global as any).__asyncStorage = {};
  });

  // Helper function to render hook with provider
  const renderAuthHook = () => {
    return renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });
  };

  // Helper function to create mock user data
  const createMockUser = (overrides = {}) => ({
    id: '123',
    email: 'test@example.com',
    role: 'customer',
    name: 'Test User',
    confirmed_at: '2024-01-01',
    ...overrides,
  });

  describe('Helper Functions', () => {
    describe('normalizeUserRole', () => {
      it('should normalize "tradie" to "tradesperson"', () => {
        expect(normalizeUserRole('tradie')).toBe('tradesperson');
      });

      it('should keep other roles unchanged', () => {
        expect(normalizeUserRole('customer')).toBe('customer');
        expect(normalizeUserRole('admin')).toBe('admin');
      });

      it('should handle undefined role', () => {
        expect(normalizeUserRole(undefined as any)).toBe(undefined);
      });
    });

    describe('buildNormalizedUser', () => {
      it('should normalize user role', () => {
        const user = { id: '123', email: 'test@example.com', role: 'tradie' };
        const normalized = buildNormalizedUser(user);
        expect(normalized.role).toBe('tradesperson');
      });

      it('should preserve all user fields', () => {
        const user = { 
          id: '123', 
          email: 'test@example.com', 
          name: 'Test User',
          role: 'customer',
          avatar: 'avatar.jpg'
        };
        const normalized = buildNormalizedUser(user);
        expect(normalized).toEqual({
          ...user,
          role: 'customer' // Already normalized
        });
      });
    });
  });

  describe('AuthProvider', () => {
    it('should provide initial state', async () => {
      const { result } = renderAuthHook();

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(true); // Initially loading
    });

    it('should throw error when useAuth is called outside provider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    it('should load stored auth data on mount', async () => {
      const mockUser = createMockUser();
      (global as any).__asyncStorage['weejobs_user'] = JSON.stringify(mockUser);

      const { result } = renderAuthHook();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Authentication methods', () => {
    describe('login', () => {
      it('should login successfully with valid credentials', async () => {
        const mockUser = createMockUser();
        mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });
        mockSupabaseClient.from().single.mockResolvedValue({
          data: mockUser,
          error: null,
        });

        const { result } = renderAuthHook();

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        let loginResult;
        await act(async () => {
          loginResult = await result.current.login('test@example.com', 'password123');
        });

        expect(loginResult.success).toBe(true);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
        expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      it('should handle invalid credentials error', async () => {
        mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: null },
          error: { message: 'Invalid credentials' },
        });

        const { result } = renderAuthHook();

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        let loginResult;
        await act(async () => {
          loginResult = await result.current.login('test@example.com', 'wrongpassword');
        });

        expect(loginResult.success).toBe(false);
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });

      it('should handle unverified email error', async () => {
        mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: { id: '123', email: 'test@example.com', confirmed_at: null } },
          error: { message: 'Email not confirmed' },
        });

        const { result } = renderAuthHook();

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        let loginResult;
        await act(async () => {
          loginResult = await result.current.login('test@example.com', 'password123');
        });

        expect(loginResult.success).toBe(false);
        expect(loginResult.needsVerification).toBe(true);
      });
    });

    describe('logout', () => {
      it('should logout successfully', async () => {
        const mockUser = createMockUser();
        (global as any).__asyncStorage['weejobs_user'] = JSON.stringify(mockUser);

        const { result } = renderAuthHook();

        // Wait for initial load
        await waitFor(() => {
          expect(result.current.user).toEqual(mockUser);
        });

        await act(async () => {
          await result.current.logout();
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
        
        // Verify AsyncStorage is cleared
        expect((global as any).__asyncStorage['weejobs_user']).toBeUndefined();
      });

      it('should handle logout error gracefully', async () => {
        mockSupabaseClient.auth.signOut.mockResolvedValue({
          error: { message: 'Logout failed' },
        });

        const mockUser = createMockUser();
        (global as any).__asyncStorage['weejobs_user'] = JSON.stringify(mockUser);

        const { result } = renderAuthHook();

        await waitFor(() => {
          expect(result.current.user).toEqual(mockUser);
        });

        // Should not throw, just clear local state
        await act(async () => {
          await result.current.logout();
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  describe('Onboarding management', () => {
    describe('setOnboardingProgress', () => {
      it('should have setOnboardingProgress method', async () => {
        const { result } = renderAuthHook();

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(typeof result.current.setOnboardingProgress).toBe('function');
      });
    });

    describe('clearOnboardingProgress', () => {
      it('should have clearOnboardingProgress method', async () => {
        const { result } = renderAuthHook();

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(typeof result.current.clearOnboardingProgress).toBe('function');
      });
    });

    describe('setHasSeenOnboarding', () => {
      it('should have setHasSeenOnboarding method', async () => {
        const { result } = renderAuthHook();

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(typeof result.current.setHasSeenOnboarding).toBe('function');
      });
    });
  });
});
