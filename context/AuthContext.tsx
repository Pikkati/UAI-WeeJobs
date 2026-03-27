import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, User } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
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

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        return { success: false, error: 'Unable to sign in with those details.' };
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
    } catch (error) {
      return { success: false, error: 'Unable to sign in right now. Please try again.' };
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: User['role'] | 'tradie'
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    const normalizedRole = normalizeUserRole(role);

    try {
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError || !signupData.user || !signupData.session) {
        const message = signupError?.message?.toLowerCase() || '';

        if (message.includes('already registered') || message.includes('already been registered')) {
          return { success: false, error: 'An account with this email already exists.' };
        }

        if (message.includes('password')) {
          return { success: false, error: 'Password does not meet the required security rules.' };
        }

        return { success: false, error: 'Unable to create your account right now. Please try again.' };
      }

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
