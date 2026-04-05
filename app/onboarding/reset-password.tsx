import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function ResetPasswordScreen() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSend = async () => {
    setError('');
    setMessage('');
    if (!email) return setError('Please enter your email');
    if (!isValidEmail(email))
      return setError('Please enter a valid email address');
    setLoading(true);
    const res = await sendPasswordReset(email.trim());
    setLoading(false);
    if (res.success) {
      setMessage(
        'If an account exists for that email, a reset link has been sent.',
      );
    } else {
      setError(
        res.error || 'Unable to send reset email. Please try again later.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.description}>
          Enter the email associated with your account and we'll send a password
          reset link.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="you@email.com"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError('');
              setMessage('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending...' : 'Send reset link'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginTop: 12 }}
          onPress={() => router.replace('/onboarding/login')}
        >
          <Text style={{ color: Colors.link, textAlign: 'center' }}>
            Back to sign in
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { padding: Spacing.xl, paddingTop: 48 },
  back: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  description: { color: Colors.textSecondary, marginBottom: Spacing.md },
  inputContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: { paddingVertical: 14, color: Colors.white },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: Colors.white, fontWeight: '700' },
  error: { color: Colors.error, marginTop: Spacing.md, textAlign: 'center' },
  message: {
    color: Colors.success,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
