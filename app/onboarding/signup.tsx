import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import PasswordStrength from '../../components/PasswordStrength';
import { useAuth } from '../../context/AuthContext';

export default function SignUpScreen() {
  const params = useLocalSearchParams<{ role?: string; email?: string }>();
  const role = params.role;
  const { signup } = useAuth();
  const [email, setEmail] = useState(params.email || '');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'initial' | 'details'>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerifyMsg, setShowVerifyMsg] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState('');

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const normalizedRole = role === 'tradie' ? 'tradesperson' : role;

  const getTagline = () => {
    switch (role) {
      case 'customer':
        return 'Get jobs done\nby local pros';
      case 'tradesperson':
        return 'Find work\nin your area';
      default:
        return 'No job too wee';
    }
  };

  const handleEmailSubmit = () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setStep('details');
  };

  const handleSignUp = async () => {
    if (!name || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setError('');

      const selectedRole = normalizedRole === 'customer' || normalizedRole === 'tradesperson'
        ? (normalizedRole as 'customer' | 'tradesperson')
        : 'customer';
    const result = await signup(email.trim(), password, name.trim(), selectedRole);

    if (result.success && result.needsVerification) {
      setShowVerifyMsg(true);
    } else if (result.success && result.user) {
      if (result.user.role === 'customer') {
        router.replace('/customer');
      } else if (result.user.role === 'tradesperson') {
        router.replace('/tradie/home');
      } else if (result.user.role === 'admin') {
        router.replace('/admin');
      } else {
        setError('Your account role is not supported.');
      }
    } else {
      setError(result.error || 'Unable to create your account right now. Please try again.');
    }

    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendError('');
    try {
      // Supabase does not provide a direct resend endpoint, so trigger signUp again
      const { error } = await signup(email.trim(), password, name.trim(), normalizedRole);
      if (error) {
        setResendError(error);
      }
    } catch (e) {
      setResendError('Unable to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGooglePress = () => {
    setError('Google sign-up coming soon');
  };

  const handleApplePress = () => {
    setError('Apple sign-up coming soon');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => {
          if (step === 'details') {
            setStep('initial');
          } else {
            router.back();
          }
        }}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <Image
            source={require('../../assets/images/weejobs-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />

          <Text style={styles.tagline}>{getTagline()}</Text>
        </View>

        {showVerifyMsg ? (
          <View style={styles.authSection}>
            <Text style={styles.tagline}>Verify your email</Text>
            <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginVertical: 16 }}>
              We've sent a verification link to <Text style={{ fontWeight: 'bold' }}>{email}</Text>.
              Please check your inbox and follow the instructions to activate your account.
            </Text>
            <TouchableOpacity
              style={[styles.signUpButton, resendLoading && styles.signUpButtonDisabled]}
              onPress={handleResendVerification}
              disabled={resendLoading}
            >
              <Text style={styles.signUpButtonText}>
                {resendLoading ? 'Resending...' : 'Resend Verification Email'}
              </Text>
            </TouchableOpacity>
            {resendError ? <Text style={styles.error}>{resendError}</Text> : null}
            <TouchableOpacity style={{ marginTop: 24 }} onPress={() => router.replace('/onboarding/login')}>
              <Text style={{ color: Colors.link, textAlign: 'center' }}>Already verified? Sign in</Text>
            </TouchableOpacity>
          </View>
        ) : step === 'initial' ? (
          <View style={styles.authSection}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGooglePress}>
              <View style={styles.socialIconContainer}>
                <Text style={styles.googleIcon}>G</Text>
              </View>
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={handleApplePress}>
              <Ionicons name="logo-apple" size={20} color={Colors.background} style={styles.appleIcon} />
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.emailInputContainer}>
              <TextInput
                style={styles.emailInput}
                placeholder="you@email.com"
                placeholderTextColor={Colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleEmailSubmit}
              />
              <TouchableOpacity 
                style={styles.emailSubmitButton} 
                onPress={handleEmailSubmit}
              >
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace({ pathname: '/onboarding/login', params: { role } })}>
                <Text style={styles.loginLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.authSection}>
            <View style={styles.emailDisplayContainer}>
              <Ionicons name="mail" size={20} color={Colors.textSecondary} />
              <Text style={styles.emailDisplayText}>{email}</Text>
              <TouchableOpacity onPress={() => setStep('initial')}>
                <Text style={styles.changeEmail}>Change</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Your name"
                placeholderTextColor={Colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Create a password"
                placeholderTextColor={Colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <PasswordStrength password={password} />

            <Text style={styles.passwordHint}>
              Password must be at least 8 characters
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.signUpButtonText}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to WeeJobs&apos;{' '}
            <Text style={styles.link}>Terms of Service</Text>
            {'\n'}and <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    width: 160,
    height: 60,
    marginBottom: Spacing.lg,
  },
  tagline: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 40,
  },
  authSection: {
    gap: Spacing.md,
  },
  socialButton: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  socialIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  appleIcon: {
    marginRight: 2,
  },
  socialButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: Spacing.md,
  },
  emailInputContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.lg,
    paddingRight: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emailInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
    paddingVertical: 14,
  },
  emailSubmitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  loginPromptText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  emailDisplayContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emailDisplayText: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
  },
  changeEmail: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textInput: {
    color: Colors.white,
    fontSize: 16,
    paddingVertical: 16,
  },
  passwordHint: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginLeft: Spacing.md,
  },
  error: {
    color: Colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  signUpButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: Spacing.xxl,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  link: {
    color: Colors.white,
    textDecorationLine: 'underline',
  },
});
