import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../constants/theme';
import { useLoading } from '../../context/LoadingContext';
import { supabase } from '../../lib/supabase';

export default function ForgotUsernameScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const { show, hide } = useLoading();

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address');
      return;
    }
    setLocalLoading(true);
    try {
      try { show(); } catch {}

      // Try to invoke a server function to email the username. Keep the
      // UX non-committal to avoid leaking account existence: always show
      // the same success message regardless of backend result.
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const runtimeLib: any = require('../../lib/supabase');
      const client = (runtimeLib && runtimeLib.supabase) || supabase;
      try {
        if (client && client.functions && typeof client.functions.invoke === 'function') {
          await client.functions.invoke('send-username', { email });
        }
      } catch {
        // ignore backend errors; keep UX non-revealing
      }

      Alert.alert('If an account exists', 'If an account exists for that email, we have sent your username to that address.');
      setEmail('');
    } catch (e) {
      Alert.alert('If an account exists', 'If an account exists for that email, we have sent your username to that address.');
    } finally {
      try { hide(); } catch {}
      setLocalLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}
    >
      <Text style={styles.title}>Forgot Username</Text>
      <Text style={styles.desc}>Enter the email associated with your account and we'll send your username.</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email address"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={Colors.textSecondary}
      />

      <TouchableOpacity
        style={[styles.button, localLoading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={localLoading}
      >
        <Text style={styles.buttonText}>{localLoading ? 'Sending…' : 'Send Username'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.xl },
  title: { color: Colors.white, fontSize: 24, fontWeight: '800', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  desc: { color: Colors.textSecondary, fontSize: 14, marginBottom: Spacing.lg },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: Spacing.md,
    color: Colors.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
