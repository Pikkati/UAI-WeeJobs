import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

type LoadingContextType = {
  isLoading: boolean;
  setLoading: (v: boolean) => void;
  show: () => void;
  hide: () => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const value: LoadingContextType = {
    isLoading,
    setLoading: setIsLoading,
    show: () => setIsLoading(true),
    hide: () => setIsLoading(false),
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && (
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.white} />
          </View>
        </View>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  center: {
    padding: 18,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});
