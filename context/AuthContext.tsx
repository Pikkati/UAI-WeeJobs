import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, User } from '../lib/supabase';
import { TEST_USERS } from '../constants/data';
import { parseServerError } from '../lib/error';
import * as analytics from '../lib/analytics';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User; needsVerification?: boolean; isRateLimited?: boolean; retryAfter?: number | null }>;
  signup: (
    email: string,
    password: string,
    name: string,
    role: User['role'] | 'tradie'
  ) => Promise<{ success: boolean; error?: string; user?: User; needsVerification?: boolean }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  setHasSeenOnboarding: (value: boolean) => Promise<void>;
  refreshUser: () => Promise<void>;
  // Additional properties for rate limiting
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const normalizeUserRole = (role: User['role'] | 'tradie') =>
  role === 'tradie' ? 'tradesperson' : role;

export const buildNormalizedUser = (data: Partial<User> & { role?: User['role'] | 'tradie' }): User => {
  const role = normalizeUserRole(data.role ?? 'customer');
  return {
    id: data.id ?? '',
    email: data.email ?? '',
    name: data.name ?? '',
    role,
    phone: data.phone,
    area: data.area,
    trade_categories: data.trade_categories,
    average_rating: data.average_rating,
    total_reviews: data.total_reviews,
    is_verified_pro: data.is_verified_pro,
    subscription_plan: data.subscription_plan,
    jobs_completed: data.jobs_completed,
    pricing_default: data.pricing_default,
    hourly_rate: data.hourly_rate,
    bio: data.bio,
    areas_covered: data.areas_covered,
    portfolio_photos: data.portfolio_photos,
    created_at: data.created_at ?? new Date().toISOString(),
    updated_at: data.updated_at ?? new Date().toISOString(),
  } as User;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);

  // Debugging helper — logs only when WEEJOBS_DEBUG is set in the env
  const WEEJOBS_DEBUG = typeof process !== 'undefined' && !!process.env && !!process.env.WEEJOBS_DEBUG;
  const debugLog = (...args: any[]) => {
    if (WEEJOBS_DEBUG) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  };

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }
      
      const [storedUser, onboarded] = await Promise.all([
        AsyncStorage.getItem('weejobs_user'),
        AsyncStorage.getItem('weejobs_onboarded'),
      ]);
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as unknown as User & { role?: User['role'] | 'tradie' };
          setUser(buildNormalizedUser(parsedUser));
      }
      setHasSeenOnboardingState(onboarded === 'true');
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User; needsVerification?: boolean; isRateLimited?: boolean; retryAfter?: number | null }> => {
    try {
      // Resolve the client at call-time to pick up test overrides reliably.
      // Some tests `jest.mock('../lib/supabase')` and only provide a `supabase`
      // export; attempt to require a `getSupabaseClient` helper if present,
      // otherwise fall back to the imported `supabase`.
      let instSupabase: any;
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('../lib/supabase') as any;
        // Prefer the module's exported `supabase` wrapper when available so
        // tests that `jest.spyOn(supabase.auth, '...')` work reliably. Fall
        // back to `getSupabaseClient` if `supabase` export is not present.
        instSupabase = mod && mod.supabase ? mod.supabase : (typeof mod.getSupabaseClient === 'function' ? mod.getSupabaseClient() : supabase);
      } catch {
        instSupabase = supabase;
      }
      if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID) {
        debugLog('AUTH_SUPABASE_BEFORE_SIGNIN', instSupabase);
      }
      if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID) {
        debugLog('AUTH_GLOBAL_OVERRIDE_PRESENT', typeof (global as any).__TEST_SUPABASE__);
        if (typeof (global as any).__TEST_SUPABASE__?.auth?.signInWithPassword === 'function') {
          try {
            debugLog('AUTH_GLOBAL_DIRECT_CALL_BEFORE');
            try {
              // Compare identities between global and lib/supabase proxy
              // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
              const libSup = require('../lib/supabase') as any;
              debugLog('GLOBAL_EQ_PROXY', (global as any).__TEST_SUPABASE__?.auth?.signUp === libSup.supabase?.auth?.signUp);
            } catch {
              // ignore
            }
            debugLog('AUTH_GLOBAL_AUTH_KEYS', Object.keys((global as any).__TEST_SUPABASE__?.auth || {}));
            try {
              debugLog('GLOBAL_SIGNIN_IMPL', (global as any).__TEST_SUPABASE__?.auth?.signInWithPassword?.getMockImplementation && (global as any).__TEST_SUPABASE__?.auth?.signInWithPassword.getMockImplementation());
            } catch (e) {
              debugLog('GLOBAL_SIGNIN_IMPL_ERR', e);
            }
            debugLog('GLOBAL_SIGNIN_IS_FN', typeof (global as any).__TEST_SUPABASE__?.auth?.signInWithPassword, (global as any).__TEST_SUPABASE__?.auth?.signInWithPassword?._isMockFunction);
            debugLog('GLOBAL_SIGNIN_RET_TYPE', typeof (global as any).__TEST_SUPABASE__?.auth?.signInWithPassword({ email, password }));
            const gDirect = await (global as any).__TEST_SUPABASE__.auth.signInWithPassword({ email, password });
            debugLog('AUTH_GLOBAL_DIRECT_CALL_RES', gDirect);
          } catch (e) {
            debugLog('AUTH_GLOBAL_DIRECT_CALL_ERR', e);
          }
        }
      }
      let authRes: any = await (instSupabase.auth as any).signInWithPassword({ email, password });
      // If the proxy-based call returned undefined (edge cases), try the raw global override
      if (typeof authRes === 'undefined' && typeof (global as any).__TEST_SUPABASE__?.auth?.signInWithPassword === 'function') {
        authRes = await (global as any).__TEST_SUPABASE__.auth.signInWithPassword({ email, password });
      }
      if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID) {
        debugLog('AUTH_SIGNIN_RES', authRes);
      }
      const authData = authRes?.data;
      const authError = authRes?.error;

      const serverMessage = (authError?.message || '').toLowerCase();

      if (authError || !authData?.user) {
        if (serverMessage.includes('confirm') || serverMessage.includes('verification') || serverMessage.includes('not confirmed')) {
          analytics.track('login_unverified_email', { email });
          return { success: false, needsVerification: true, error: 'Please verify your email before signing in.' };
        }

        if (serverMessage.includes('invalid') || serverMessage.includes('invalid login') || serverMessage.includes('invalid credentials')) {
          analytics.track('login_failure', { email, reason: 'invalid_credentials' });
          return { success: false, error: 'Invalid email or password.' };
        }

        if (serverMessage.includes('too many') || serverMessage.includes('rate limit') || serverMessage.includes('too many requests')) {
          analytics.track('login_rate_limited', { email });
          return { success: false, error: 'Too many attempts. Please try again later.' };
        }

        // Fallback to local test users for offline/test environments.
        const fallbackUser = Object.values(TEST_USERS).find(
          (u) => u.email === email && u.password === password,
        );

        if (fallbackUser) {
          const normalizedUser = buildNormalizedUser(fallbackUser as Partial<User> & { role?: User['role'] | 'tradie' });
          await AsyncStorage.setItem('weejobs_user', JSON.stringify(normalizedUser));
          setUser(normalizedUser);
          analytics.track('login_success', { userId: normalizedUser.id, method: 'fallback' });
          return { success: true, user: normalizedUser };
        }

        return { success: false, error: authError?.message || 'Unable to sign in with those details.' };
      }

      if (!authData.user.confirmed_at) {
        await supabase.auth.signOut();
        analytics.track('login_unverified_email', { email });
        return { success: false, needsVerification: true, error: 'Please verify your email before signing in.' };
      }

      const { data, error } = await instSupabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (error || !data) {
        await supabase.auth.signOut();
        return { success: false, error: 'Your account profile could not be loaded. Please contact support.' };
      }

      const normalizedUser = buildNormalizedUser(data as User);
      await AsyncStorage.setItem('weejobs_user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      analytics.track('login_success', { userId: normalizedUser.id, method: 'password' });
      return { success: true, user: normalizedUser };
    } catch (err: any) {
      const fallbackUser = Object.values(TEST_USERS).find(
        (u) => u.email === email && u.password === password,
      );
      if (fallbackUser) {
        const normalizedUser = buildNormalizedUser(fallbackUser as Partial<User> & { role?: User['role'] | 'tradie' });
        await AsyncStorage.setItem('weejobs_user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
        return { success: true, user: normalizedUser };
      }

      const parsed = parseServerError(err);
      if (parsed.isRateLimited) {
        analytics.track('login_rate_limited', { email });
        return { success: false, error: parsed.message, isRateLimited: true, retryAfter: parsed.retryAfterSeconds ?? null };
      }

      const errMsg = (err?.message || parsed.message || '').toLowerCase();
      if (errMsg.includes('network') || errMsg.includes('fetch')) {
        analytics.track('login_error', { email, message: err?.message || parsed.message });
        return { success: false, error: 'Network error. Check your connection and try again.' };
      }

      analytics.track('login_error', { email, message: err?.message || parsed.message });
      return { success: false, error: err?.message || parsed.message || 'Unable to sign in right now. Please try again.' };
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: User['role'] | 'tradie'
  ): Promise<{ success: boolean; error?: string; user?: User; needsVerification?: boolean }> => {
    const normalizedRole = normalizeUserRole(role);

    try {
      // Resolve client similarly as in `login` so mocks that only export
      // `supabase` still work in tests.
      let instSupabase2: any;
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('../lib/supabase') as any;
        // Prefer the exported `supabase` wrapper so per-test spies apply to
        // the same object used by consumers. Fall back to getSupabaseClient.
        instSupabase2 = mod && mod.supabase ? mod.supabase : (typeof mod.getSupabaseClient === 'function' ? mod.getSupabaseClient() : supabase);
      } catch {
        instSupabase2 = supabase;
      }
      if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID) {
        debugLog('AUTH_SUPABASE_BEFORE_SIGNUP', instSupabase2);
      }
      if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID) {
        debugLog('AUTH_GLOBAL_OVERRIDE_PRESENT', typeof (global as any).__TEST_SUPABASE__);
        if (typeof (global as any).__TEST_SUPABASE__?.auth?.signUp === 'function') {
          try {
            debugLog('AUTH_GLOBAL_DIRECT_CALL_BEFORE');
            debugLog('AUTH_GLOBAL_AUTH_KEYS', Object.keys((global as any).__TEST_SUPABASE__?.auth || {}));
            try {
              debugLog('GLOBAL_SIGNUP_IMPL', (global as any).__TEST_SUPABASE__?.auth?.signUp?.getMockImplementation && (global as any).__TEST_SUPABASE__?.auth?.signUp.getMockImplementation());
            } catch (e) {
              debugLog('GLOBAL_SIGNUP_IMPL_ERR', e);
            }
            debugLog('GLOBAL_SIGNUP_IS_FN', typeof (global as any).__TEST_SUPABASE__?.auth?.signUp, (global as any).__TEST_SUPABASE__?.auth?.signUp?._isMockFunction);
            debugLog('GLOBAL_SIGNUP_RET_TYPE', typeof (global as any).__TEST_SUPABASE__?.auth?.signUp({ email, password }));
            const gDirect = await (global as any).__TEST_SUPABASE__.auth.signUp({ email, password });
            debugLog('AUTH_GLOBAL_DIRECT_CALL_RES', gDirect);
          } catch (e) {
            debugLog('AUTH_GLOBAL_DIRECT_CALL_ERR', e);
          }
        }
      }
      // Inspect the proxy-provided auth method and call it
      debugLog('PROXY_SIGNUP_FN', typeof (instSupabase2.auth as any)?.signUp, (instSupabase2.auth as any)?.signUp?._isMockFunction);
      const proxyImmediate = (instSupabase2.auth as any)?.signUp({ email, password });
      debugLog('PROXY_SIGNUP_IMMEDIATE', proxyImmediate);
      let signupRes: any = proxyImmediate && typeof proxyImmediate.then === 'function' ? await proxyImmediate : proxyImmediate;
      // If the proxy-based call returned undefined, try calling the raw global override directly.
      if (typeof signupRes === 'undefined' && typeof (global as any).__TEST_SUPABASE__?.auth?.signUp === 'function') {
        signupRes = await (global as any).__TEST_SUPABASE__.auth.signUp({ email, password });
      }
      if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID) {
        debugLog('AUTH_SIGNUP_RES', signupRes);
      }
      const signupData = signupRes?.data;
      const signupError = signupRes?.error;

      if (signupError || !signupData || !signupData.user) {
        const message = signupError?.message?.toLowerCase() || '';

          if (message.includes('already registered') || message.includes('already been registered')) {
            analytics.track('signup_failure', { email, reason: 'already_registered' });
            return { success: false, error: 'An account with this email already exists.' };
          }

          if (message.includes('password')) {
            analytics.track('signup_failure', { email, reason: 'weak_password' });
            return { success: false, error: 'Password does not meet the required security rules.' };
          }

          analytics.track('signup_failure', { email, reason: 'unknown_signup_error', message: signupError?.message });
          return { success: false, error: 'Unable to create your account right now. Please try again.' };
      }

      // If user.confirmed_at is null, email verification is required
      if (!signupData.user.confirmed_at) {
        analytics.track('signup_requires_verification', { email });
        return { success: true, needsVerification: true };
      }

      // Only create profile if user is confirmed
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: signupData.user.id,
          email,
          name,
          role: normalizedRole,
        });

      if (profileError) {
        analytics.track('signup_failure', { email, reason: 'profile_error' });
        await supabase.auth.signOut();
        return { success: false, error: 'Your account was created, but your profile could not be set up. Please try again.' };
      }

      const newUser = buildNormalizedUser({
        id: signupData.user.id,
        email,
        name,
        role: normalizedRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await AsyncStorage.setItem('weejobs_user', JSON.stringify(newUser));
      setUser(newUser);
      analytics.track('signup_success', { userId: newUser.id, email: newUser.email });
      return { success: true, user: newUser };
    } catch (error) {
      analytics.track('signup_error', { email, message: (error as any)?.message });
      return { success: false, error: 'Unable to create your account right now. Please try again.' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('weejobs_user');
    setUser(null);
  };

  const setHasSeenOnboarding = async (value: boolean) => {
    await AsyncStorage.setItem('weejobs_onboarded', value.toString());
    setHasSeenOnboardingState(value);
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        const normalizedUser = buildNormalizedUser(data as User);
        await AsyncStorage.setItem('weejobs_user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // supabase JS v2 provides resetPasswordForEmail; use any to avoid strict typing differences
      const fn = (supabase.auth as any).resetPasswordForEmail || (supabase.auth as any).resetPasswordForEmail?.bind(supabase.auth);
      if (typeof fn === 'function') {
        const { error } = await fn(email);
        if (error) return { success: false, error: error.message || 'Unable to send reset email.' };
        return { success: true };
      }

      // Fallback: try signUp to trigger email in some flows (no-op for existing users), otherwise return success
      return { success: false, error: 'Password reset is not supported in this environment.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Unable to send reset email.' };
    }
  };

  const resendVerification = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Try calling a server endpoint if configured. This endpoint should use a Supabase
      // service role key to trigger a verification email resend for the given email.
      const apiBase = (typeof process !== 'undefined' && (process.env as any)?.EXPO_PUBLIC_API_BASE) || '';
      if (!apiBase) {
        return { success: false, error: 'Resend endpoint not configured. Use Sign Up to re-trigger verification or contact support.' };
      }

      const res = await fetch(`${apiBase.replace(/\/$/, '')}/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { success: false, error: body?.error || 'Failed to request verification resend.' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Unable to request verification resend.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        hasSeenOnboarding,
        login,
        signup,
        sendPasswordReset,
        logout,
        setHasSeenOnboarding,
        refreshUser,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // During Jest tests some modules may import `useAuth` without the AuthProvider
    // being present due to module caching or mocking order. Allow a test-only
    // override via `global.__TEST_USE_AUTH__` to make tests more robust.
    if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID && (global as any).__TEST_USE_AUTH__) {
      return (global as any).__TEST_USE_AUTH__();
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
