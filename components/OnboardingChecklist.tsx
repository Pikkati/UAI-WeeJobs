import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { useRouter } from 'expo-router';

const STORAGE_KEY = 'weejobs_onboarding_checklist_v1';

const defaultItems = [
  { id: 'profile', label: 'Add your name and photo', route: '/settings' },
  { id: 'payment', label: 'Add a payment method', route: '/settings' },
  { id: 'verify', label: 'Verify phone or email', route: '/onboarding/verify' },
  { id: 'post_job', label: 'Post your first job', route: '/customer/post-job' },
  { id: 'notifications', label: 'Review notification settings', route: '/settings' },
];

export default function OnboardingChecklist() {
  const [items, setItems] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setItems(JSON.parse(raw));
        } else {
          const withState = defaultItems.map(i => ({ ...i, done: false, skipped: false }));
          setItems(withState);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(withState));
        }
      } catch (e) {
        setItems(defaultItems.map(i => ({ ...i, done: false, skipped: false })));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = async (next: any[]) => {
    try {
      setItems(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  };

  const toggleDone = (id: string) => {
    const next = items.map(i => i.id === id ? { ...i, done: !i.done, skipped: false } : i);
    persist(next);
  };

  const skipItem = (id: string) => {
    const next = items.map(i => i.id === id ? { ...i, skipped: true } : i);
    persist(next);
  };

  const openItem = (route: string) => {
    router.push(route);
  };

  if (!ready) return null;

  const completed = items.filter(i => i.done).length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Onboarding</Text>
      <Text style={styles.progress}>{completed} of {items.length} complete</Text>
      {items.map(item => (
        <View key={item.id} style={[styles.row, item.done && styles.rowDone]}>
          <View style={styles.rowText}>
            <Text style={[styles.label, item.done && styles.labelDone]}>{item.label}</Text>
            {item.skipped && <Text style={styles.skipped}>Skipped</Text>}
          </View>
          <View style={styles.rowActions}>
            <TouchableOpacity onPress={() => openItem(item.route)} style={styles.linkButton}>
              <Text style={styles.linkText}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleDone(item.id)} style={styles.actionButton}>
              <Text style={styles.actionText}>{item.done ? 'Undo' : 'Done'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => skipItem(item.id)} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  title: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  progress: {
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  row: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowDone: {
    opacity: 0.7,
  },
  rowText: {
    flex: 1,
    marginRight: Spacing.md,
  },
  label: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  labelDone: {
    textDecorationLine: 'line-through',
  },
  skipped: {
    color: Colors.textSecondary,
    marginTop: 4,
  },
  rowActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  actionText: {
    color: Colors.white,
    fontWeight: '700',
  },
  skipButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  skipText: {
    color: Colors.textSecondary,
  },
  linkButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  linkText: {
    color: Colors.accent,
    fontWeight: '600',
  },
});
