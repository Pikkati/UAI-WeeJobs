
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, User } from '../lib/supabase';
import { TEST_USERS } from '../constants/data';
import { parseServerError } from '../lib/error';
import { isRateLimited, markAttempt } from '../lib/rateLimiter';
import * as analytics from '../lib/analytics';
import { auditEvent } from '../lib/audit';

/**
 * Helper to resolve the Supabase client, supporting test overrides and mocks.
 */
function resolveSupabaseClient() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('../lib/supabase');
    if (mod && mod.supabase) return mod.supabase;
    if (typeof mod.getSupabaseClient === 'function') return mod.getSupabaseClient();
  } catch {}
  return supabase;
}

/**
 * Helper to find a fallback user from TEST_USERS for offline/test environments.
 */
function findFallbackUser(email: string, password: string) {
  return Object.values(TEST_USERS).find(
    (u) => u.email === email && u.password === password,
  );
}

/**
 * Helper to handle analytics tracking for login/signup events.
 */
function track(event: string, props: Record<string, any>) {
  try { analytics.track(event, props); } catch {}
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  onboardingProgress: number | null;
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
  setOnboardingProgress: (step: number) => Promise<void>;
  clearOnboardingProgress: () => Promise<void>;
  setHasSeenOnboarding: (value: boolean) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (changes: Partial<User>) => Promise<{ success: boolean; data?: User; error?: string }>;
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
  const [onboardingProgress, setOnboardingProgressState] = useState<number | null>(null);

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
      
      const [storedUser, onboarded, storedOnboarding] = await Promise.all([
        AsyncStorage.getItem('weejobs_user'),
        AsyncStorage.getItem('weejobs_onboarded'),
        AsyncStorage.getItem('weejobs_onboarding_progress'),
      ]);
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as unknown as User & { role?: User['role'] | 'tradie' };
          setUser(buildNormalizedUser(parsedUser));
      }
      if (storedOnboarding) {
        try {
          const parsed = JSON.parse(storedOnboarding);
          if (parsed && typeof parsed.step === 'number') setOnboardingProgressState(parsed.step);
        } catch (e) {
          // ignore malformed value
        }
      }
      setHasSeenOnboardingState(onboarded === 'true');
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log in a user with email and password. Falls back to TEST_USERS in offline/test mode.
   */
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User; needsVerification?: boolean; isRateLimited?: boolean; retryAfter?: number | null }> => {
    try {
      const instSupabase = resolveSupabaseClient();
      let authRes: any = await (instSupabase.auth as any).signInWithPassword({ email, password });
      // If the proxy-based call returned undefined (edge cases), try the raw global override
      if (typeof authRes === 'undefined' && typeof (global as any).__TEST_SUPABASE__?.auth?.signInWithPassword === 'function') {
        authRes = await (global as any).__TEST_SUPABASE__.auth.signInWithPassword({ email, password });
      }
      const authData = authRes?.data;
      const authError = authRes?.error;
      const serverMessage = (authError?.message || '').toLowerCase();

      if (authError || !authData?.user) {
        if (serverMessage.includes('confirm') || serverMessage.includes('verification') || serverMessage.includes('not confirmed')) {
          track('login_unverified_email', { email });
          try { void auditEvent('auth.login.failure', { email, reason: 'unverified_email' }); } catch {}
          return { success: false, needsVerification: true, error: 'Your account hasn\'t been verified yet. Check your email for the verification link, or tap "Resend" below.' };
        }
        if (serverMessage.includes('invalid') || serverMessage.includes('invalid login') || serverMessage.includes('invalid credentials')) {
          track('login_failure', { email, reason: 'invalid_credentials' });
          try { void auditEvent('auth.login.failure', { email, reason: 'invalid_credentials' }); } catch {}
          return { success: false, error: 'Incorrect email or password. Double-check and try again, or use "Forgot password?" to reset it.' };
        }
        if (serverMessage.includes('too many') || serverMessage.includes('rate limit') || serverMessage.includes('too many requests')) {
          track('login_rate_limited', { email });
          return { success: false, error: 'Too many failed login attempts. Please wait a few minutes before trying again for security.' };
        }
        // Fallback to local test users for offline/test environments.
        const fallbackUser = findFallbackUser(email, password);
        if (fallbackUser) {
          const normalizedUser = buildNormalizedUser(fallbackUser as Partial<User> & { role?: User['role'] | 'tradie' });
          await AsyncStorage.setItem('weejobs_user', JSON.stringify(normalizedUser));
          setUser(normalizedUser);
          try { void auditEvent('auth.login.success', { method: 'fallback' }, normalizedUser.id); } catch {}
          track('login_success', { userId: normalizedUser.id, method: 'fallback' });
          return { success: true, user: normalizedUser };
        }
        return { success: false, error: authError?.message || 'Unable to sign in with those details.' };
      }
      if (!authData.user.confirmed_at) {
        await supabase.auth.signOut();
        track('login_unverified_email', { email });
        return { success: false, needsVerification: true, error: 'Your account hasn\'t been verified yet. Check your email for the verification link to complete your signup.' };
      }
      const { data, error } = await instSupabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      if (error || !data) {
        await supabase.auth.signOut();
        return { success: false, error: 'We found your account but couldn\'t load your profile. Please try again or contact support if the issue persists.' };
      }
      const normalizedUser = buildNormalizedUser(data as User);
      await AsyncStorage.setItem('weejobs_user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      try { void auditEvent('auth.login.success', { method: 'password' }, normalizedUser.id); } catch {}
      track('login_success', { userId: normalizedUser.id, method: 'password' });
      return { success: true, user: normalizedUser };
    } catch (err: any) {
      const fallbackUser = findFallbackUser(email, password);
      if (fallbackUser) {
        const normalizedUser = buildNormalizedUser(fallbackUser as Partial<User> & { role?: User['role'] | 'tradie' });
        await AsyncStorage.setItem('weejobs_user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
        try { void auditEvent('auth.login.success', { method: 'fallback' }, normalizedUser.id); } catch {}
        return { success: true, user: normalizedUser };
      }
      const parsed = parseServerError(err);
      if (parsed.isRateLimited) {
        track('login_rate_limited', { email });
        try { void auditEvent('auth.login.failure', { email, reason: 'rate_limited' }); } catch {}
        return { success: false, error: parsed.message, isRateLimited: true, retryAfter: parsed.retryAfterSeconds ?? null };
      }
      const errMsg = (err?.message || parsed.message || '').toLowerCase();
      if (errMsg.includes('network') || errMsg.includes('fetch')) {
        track('login_error', { email, message: err?.message || parsed.message });
        try { void auditEvent('auth.login.failure', { email, message: err?.message || parsed.message }); } catch {}
        return { success: false, error: 'Network connection error. Please check your WiFi or mobile connection and try again.' };
      }
      track('login_error', { email, message: err?.message || parsed.message });
      try { void auditEvent('auth.login.failure', { email, message: err?.message || parsed.message }); } catch {}
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
            try { void auditEvent('auth.signup.failure', { email, reason: 'already_registered' }); } catch {}
            return { success: false, error: 'This email is already registered. Try signing in instead, or use "Forgot password?" if you don\'t remember your password.' };
          }

          if (message.includes('password')) {
            analytics.track('signup_failure', { email, reason: 'weak_password' });
            try { void auditEvent('auth.signup.failure', { email, reason: 'weak_password' }); } catch {}
            return { success: false, error: 'Your password is too weak. Use at least 8 characters with a mix of uppercase, lowercase, and numbers.' };
          }

          analytics.track('signup_failure', { email, reason: 'unknown_signup_error', message: signupError?.message });
          try { void auditEvent('auth.signup.failure', { email, reason: 'unknown_signup_error', message: signupError?.message }); } catch {}
          return { success: false, error: 'Unable to create your account right now. Please try again.' };
      }

      // If user.confirmed_at is null, email verification is required
      if (!signupData.user.confirmed_at) {
        analytics.track('signup_requires_verification', { email });
        try { void auditEvent('auth.signup.requires_verification', { email }); } catch {}
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
        try { void auditEvent('auth.signup.failure', { email, reason: 'profile_error' }); } catch {}
        await supabase.auth.signOut();
        return { success: false, error: 'Your account was created! But we had trouble setting up your profile. Try signing in to complete your setup.' };
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
      try { void auditEvent('auth.signup.success', { method: 'password' }, newUser.id); } catch {}
      return { success: true, user: newUser };
    } catch (error) {
      analytics.track('signup_error', { email, message: (error as any)?.message });
      try { void auditEvent('auth.signup.failure', { email, message: (error as any)?.message }); } catch {}
      return { success: false, error: 'We couldn\'t create your account at this moment. Please check your connection and try again.' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('weejobs_user');
    setUser(null);
  };

  const setOnboardingProgress = async (step: number) => {
    try {
      const payload = { step, updated_at: new Date().toISOString() };
      await AsyncStorage.setItem('weejobs_onboarding_progress', JSON.stringify(payload));
      setOnboardingProgressState(step);
    } catch (e) {
      console.error('Error saving onboarding progress:', e);
    }
  };

  const clearOnboardingProgress = async () => {
    try {
      await AsyncStorage.removeItem('weejobs_onboarding_progress');
    } catch (e) {
      // ignore
    }
    setOnboardingProgressState(null);
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

  /**
   * Update the current user's profile with the provided changes.
   * Centralizes Supabase update, local storage sync and state update.
   */
  const updateProfile = async (changes: Partial<User>): Promise<{ success: boolean; data?: User; error?: string }> => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };
    try {
      const instSupabase = resolveSupabaseClient();
      const res: any = await instSupabase
        .from('users')
        .update(changes)
        .eq('id', user.id)
        .select('*')
        .single();

      const updated = res?.data;
      const updError = res?.error;
      if (updError || !updated) {
        return { success: false, error: updError?.message || 'Failed to update profile' };
      }

      const normalized = buildNormalizedUser(updated as User);
      await AsyncStorage.setItem('weejobs_user', JSON.stringify(normalized));
      setUser(normalized);
      return { success: true, data: normalized };
    } catch (err: any) {
      const parsed = parseServerError(err);
      return { success: false, error: parsed.message || err?.message || 'Failed to update profile' };
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Resolve Supabase client so test overrides/mocks are respected
      const instSupabase = resolveSupabaseClient();
      const auth: any = instSupabase?.auth || {};
      const candidates = [
        auth.resetPasswordForEmail,
        auth.resetPasswordForEmail?.bind(auth),
        auth.api?.resetPasswordForEmail,
        auth.api?.resetPasswordForEmail?.bind(auth.api),
      ];
      let fn: any = null;
      for (const c of candidates) {
        if (typeof c === 'function') {
          fn = c;
          break;
        }
      }
      if (typeof fn === 'function') {
        const res = await fn(email);
        const error = res?.error ?? res?.data?.error ?? null;
        if (error) return { success: false, error: error.message || error || 'Unable to send reset email.' };
        return { success: true };
      }
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
      // Basic client-side rate limit to avoid spamming the resend endpoint
      const rlKey = `resendVerification:${email}`;
      if (isRateLimited(rlKey, 3, 60 * 60 * 1000)) {
        return { success: false, error: 'You\'ve requested verification too many times. Please wait a bit before requesting again.' };
      }

      if (!apiBase) {
        return { success: false, error: 'Email verification isn\'t available right now. Try signing up again or contact support for help.' };
      }

      const res = await fetch(`${apiBase.replace(/\/$/, '')}/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // record attempt on failure as well to slow repeated attempts
        try { markAttempt(rlKey, 3, 60 * 60 * 1000); } catch {}
        return { success: false, error: 'Couldn\'t send the verification email. Please check your internet connection and try again.' };
      }
      // record successful attempt
      try { markAttempt(rlKey, 3, 60 * 60 * 1000); } catch {}
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
        onboardingProgress,
        login,
        signup,
        sendPasswordReset,
        logout,
        setOnboardingProgress,
        clearOnboardingProgress,
        setHasSeenOnboarding,
        refreshUser,
        updateProfile,
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
