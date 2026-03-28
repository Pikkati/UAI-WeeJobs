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
        const parsedUser = JSON.parse(storedUser) as User & { role?: User['role'] | 'tradie' };
        setUser(buildNormalizedUser(parsedUser));
      }
      setHasSeenOnboardingState(onboarded === 'true');
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User; needsVerification?: boolean }> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      const serverMessage = (authError?.message || '').toLowerCase();
      const parsed = parseServerError(authError);

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
          const normalizedUser = buildNormalizedUser(fallbackUser as User & { role?: User['role'] | 'tradie' });
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

      const { data, error } = await supabase
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
        const normalizedUser = buildNormalizedUser(fallbackUser as User & { role?: User['role'] | 'tradie' });
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
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError || !signupData.user) {
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
