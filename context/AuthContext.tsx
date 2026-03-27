import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, User } from '../lib/supabase';
import { TEST_USERS } from '../constants/data';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User; needsVerification?: boolean }>;
  signup: (
    email: string,
    password: string,
    name: string,
    role: User['role'] | 'tradie'
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  setHasSeenOnboarding: (value: boolean) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUserRole = (role: User['role'] | 'tradie') =>
  role === 'tradie' ? 'tradesperson' : role;

const buildNormalizedUser = (data: User & { role?: User['role'] | 'tradie' }): User => ({
  ...data,
  role: normalizeUserRole(data.role ?? 'customer'),
});

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

      if (authError || !authData?.user) {
        if (serverMessage.includes('confirm') || serverMessage.includes('verification') || serverMessage.includes('not confirmed')) {
          return { success: false, needsVerification: true, error: 'Please verify your email before signing in.' };
        }

        if (serverMessage.includes('invalid') || serverMessage.includes('invalid login') || serverMessage.includes('invalid credentials')) {
          return { success: false, error: 'Invalid email or password.' };
        }

        if (serverMessage.includes('too many') || serverMessage.includes('rate limit') || serverMessage.includes('too many requests')) {
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
          return { success: true, user: normalizedUser };
        }

        return { success: false, error: authError?.message || 'Unable to sign in with those details.' };
      }

      if (!authData.user.confirmed_at) {
        await supabase.auth.signOut();
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

      const errMsg = (err?.message || '').toLowerCase();
      if (errMsg.includes('network') || errMsg.includes('fetch')) {
        return { success: false, error: 'Network error. Check your connection and try again.' };
      }

      return { success: false, error: err?.message || 'Unable to sign in right now. Please try again.' };
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
          return { success: false, error: 'An account with this email already exists.' };
        }

        if (message.includes('password')) {
          return { success: false, error: 'Password does not meet the required security rules.' };
        }

        return { success: false, error: 'Unable to create your account right now. Please try again.' };
      }

      // If user.confirmed_at is null, email verification is required
      if (!signupData.user.confirmed_at) {
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
      return { success: true, user: newUser };
    } catch (error) {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        hasSeenOnboarding,
        login,
        signup,
        logout,
        setHasSeenOnboarding,
        refreshUser,
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
