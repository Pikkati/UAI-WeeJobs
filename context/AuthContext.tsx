import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// Define the User type
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  role: string;
  pricing_default: string;
  hourly_rate: number;
  bio: string;
  areas_covered: string[];
  portfolio_photos: string[];
  trade_categories: string[];
  subscription_plan?: string;
  average_rating?: number;
  jobs_completed?: number;
}

// Define the AuthContextType interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
  login: (...args: any[]) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  refreshUser: () => void;
  signup: (...args: any[]) => Promise<{ success: boolean; user?: User; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setUser({
        id: '123',
        name: 'Test User',
        email: 'testuser@example.com',
        phone: '123-456-7890',
        area: 'Test Area',
        role: 'tradesperson',
        pricing_default: 'fixed',
        hourly_rate: 50,
        bio: 'Experienced tradie',
        areas_covered: ['Area 1', 'Area 2'],
        portfolio_photos: [],
        trade_categories: ['Plumbing', 'Electrical'],
        subscription_plan: 'payg',
        average_rating: 4.8,
        jobs_completed: 42,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const login = async (..._args: any[]) => {
    const fakeUser: User = {
      id: '123',
      name: 'Test User',
      email: 'testuser@example.com',
      phone: '123-456-7890',
      area: 'Test Area',
      role: 'tradesperson',
      pricing_default: 'fixed',
      hourly_rate: 50,
      bio: 'Experienced tradie',
      areas_covered: ['Area 1', 'Area 2'],
      portfolio_photos: [],
      trade_categories: ['Plumbing', 'Electrical'],
      subscription_plan: 'payg',
      average_rating: 4.8,
      jobs_completed: 42,
    };
    setUser(fakeUser);
    return { success: true, user: fakeUser };
  };

  const logout = () => {
    setUser(null);
  };

  const refreshUser = () => {};
  const signup = async (..._args: any[]) => {
    const fakeUser: User = {
      id: '123',
      name: 'Test User',
      email: 'testuser@example.com',
      phone: '123-456-7890',
      area: 'Test Area',
      role: 'tradesperson',
      pricing_default: 'fixed',
      hourly_rate: 50,
      bio: 'Experienced tradie',
      areas_covered: ['Area 1', 'Area 2'],
      portfolio_photos: [],
      trade_categories: ['Plumbing', 'Electrical'],
      subscription_plan: 'payg',
      average_rating: 4.8,
      jobs_completed: 42,
    };
    setUser(fakeUser);
    return { success: true, user: fakeUser };
  };
  const setHasSeenOnboardingWrapper = (seen: boolean) => setHasSeenOnboarding(seen);

  return (
    <AuthContext.Provider value={{ user, isLoading, hasSeenOnboarding, setHasSeenOnboarding: setHasSeenOnboardingWrapper, login, logout, refreshUser, signup }}>
      {children}
    </AuthContext.Provider>
  );
}
// ...existing code...

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
