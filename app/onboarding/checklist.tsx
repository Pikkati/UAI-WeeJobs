import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'weejobs_onboarding_checklist';

const ITEMS = [
  {
    id: 'profile',
    title: 'Complete profile',
    description: 'Add name, photo, and a short bio.',
  },
  {
    id: 'verify',
    title: 'Verify email',
    description: 'Confirm your email address so you can receive messages.',
  },
  {
    id: 'payment',
    title: 'Add payment method',
    description: 'Add a card or payment method for transactions.',
  },
  {
    id: 'first-job',
    title: 'Post your first job',
    description: 'Create a listing to attract applicants.',
  },
];

export default function OnboardingChecklist() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setCompleted(JSON.parse(raw));
      } catch {
        // ignore
      }
    })();
  }, []);

  const toggle = async (id: string) => {
    const next = { ...completed, [id]: !completed[id] };
    setCompleted(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const markAll = async () => {
    const next: Record<string, boolean> = {};
    ITEMS.forEach((i) => (next[i.id] = true));
    setCompleted(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const reset = async () => {
    setCompleted({});
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Onboarding Checklist</Text>
      {ITEMS.map((it) => {
        const done = !!completed[it.id];
        return (
          <TouchableOpacity
            key={it.id}
            style={styles.row}
            onPress={() => toggle(it.id)}
          >
            <View style={[styles.checkbox, done && styles.checkboxDone]} />
            <View style={styles.meta}>
              <Text style={[styles.title, done && styles.titleDone]}>
                {it.title}
              </Text>
              <Text style={styles.description}>{it.description}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={markAll}>
          <Text style={styles.actionText}>Mark all complete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.reset]}
          onPress={reset}
        >
          <Text style={[styles.actionText, styles.resetText]}>Reset</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 12,
  },
  checkboxDone: { backgroundColor: '#0a84ff', borderColor: '#0a84ff' },
  meta: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  titleDone: { textDecorationLine: 'line-through', color: '#666' },
  description: { fontSize: 13, color: '#666', marginTop: 4 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#0a84ff',
    borderRadius: 6,
  },
  actionText: { color: '#fff', fontWeight: '600' },
  reset: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  resetText: { color: '#333' },
});
