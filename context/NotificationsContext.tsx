import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'undetermined';

type NotificationsContextType = {
  isOptedIn: boolean;
  permissionStatus: PermissionStatus;
  expoPushToken: string | null;
  requestPermission: () => Promise<{ success: boolean; token?: string; error?: string }>;
  optIn: () => Promise<{ success: boolean; token?: string; error?: string }>;
  optOut: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const PUSH_OPT_IN_KEY = 'weejobs_push_opt_in';
const PUSH_TOKEN_KEY = 'weejobs_push_token';

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('unknown');
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [opt, token] = await Promise.all([
          AsyncStorage.getItem(PUSH_OPT_IN_KEY),
          AsyncStorage.getItem(PUSH_TOKEN_KEY),
        ]);
        if (opt === 'true') setIsOptedIn(true);
        if (token) setExpoPushToken(token);

        try {
          // Dynamically require so projects without expo-notifications still build
          // @ts-ignore
          const Notifications = require('expo-notifications');
          const perm = await Notifications.getPermissionsAsync?.();
          const status = perm?.status ?? (perm?.granted ? 'granted' : 'denied');
          setPermissionStatus(status === 'granted' ? 'granted' : (status === 'denied' ? 'denied' : 'undetermined'));
        } catch (e) {
          // ignore if module missing
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const requestPermission = async (): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
      // @ts-ignore
      const Notifications = require('expo-notifications');
      if (!Notifications) return { success: false, error: 'Notifications not supported' };

      const existing = await Notifications.getPermissionsAsync?.();
      let finalStatus = existing?.status;
      if (finalStatus !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync?.();
        finalStatus = requested?.status || finalStatus;
      }
      if (finalStatus !== 'granted') {
        setPermissionStatus('denied');
        return { success: false, error: 'Permission not granted' };
      }
      setPermissionStatus('granted');

      const tokenRes = await Notifications.getExpoPushTokenAsync?.();
      const token = tokenRes?.data ?? tokenRes?.token ?? tokenRes ?? null;
      if (token) {
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, String(token));
        await AsyncStorage.setItem(PUSH_OPT_IN_KEY, 'true');
        setExpoPushToken(String(token));
        setIsOptedIn(true);
      }
      return { success: true, token: token ? String(token) : undefined };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to request permission' };
    }
  };

  const optIn = async () => {
    return await requestPermission();
  };

  const optOut = async () => {
    try {
      await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
      await AsyncStorage.setItem(PUSH_OPT_IN_KEY, 'false');
      setIsOptedIn(false);
      setExpoPushToken(null);
      setPermissionStatus('denied');
    } catch (e) {
      // ignore
    }
  };

  return (
    <NotificationsContext.Provider value={{ isOptedIn, permissionStatus, expoPushToken, requestPermission, optIn, optOut }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
