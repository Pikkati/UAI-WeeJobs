import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Animated, ActivityIndicator } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

type AuthTab = 'signin' | 'signup';

export default function LoginScreen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const { login, signup, resendVerification } = useAuth();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const [tabWidth, setTabWidth] = useState(0);

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInShowPassword, setSignInShowPassword] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [signInNeedsVerification, setSignInNeedsVerification] = useState(false);
  const [signInResendLoading, setSignInResendLoading] = useState(false);
  const [signInResendMessage, setSignInResendMessage] = useState('');

  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpShowPassword, setSignUpShowPassword] = useState(false);
  const [signUpShowConfirmPassword, setSignUpShowConfirmPassword] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState('');

  const signInPasswordRef = useRef<any>(null);
  const signUpEmailRef = useRef<any>(null);
  const signUpPasswordRef = useRef<any>(null);
  const signUpConfirmPasswordRef = useRef<any>(null);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const normalizedRole = role === 'tradie' ? 'tradesperson' : role;

  const getTagline = () => {
    switch (role) {
      case 'customer':
        return 'Get jobs done\nby local pros';
      case 'tradesperson':
        return 'Find work\nin your area';
      case 'admin':
        return 'Manage your\nmarketplace';
      default:
        return 'No job too wee';
    }
  };

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    Animated.spring(tabIndicatorAnim, {
      toValue: tab === 'signin' ? 0 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 30,
    }).start();
  };

  const handleSignIn = async () => {
    if (!signInEmail) {
      setSignInError('Please enter your email');
      return;
    }
    if (!isValidEmail(signInEmail)) {
      setSignInError('Please enter a valid email address');
      return;
    }
    if (!signInPassword) {
      setSignInError('Please enter your password');
      return;
    }

    setSignInLoading(true);
    setSignInError('');

      const result = await login(signInEmail, signInPassword);

    if (result.isRateLimited) {
      const retry = result.retryAfter ? ` Try again in ${Math.ceil((result.retryAfter || 0) / 60)} minutes.` : '';
      setSignInError(result.error || `Too many attempts. Please try again later.${retry}`);
      setSignInLoading(false);
      return;
    }

    if (result.needsVerification) {
      setSignInNeedsVerification(true);
      setSignInError(result.error || 'Please verify your email to continue.');
      setSignInLoading(false);
      return;
    }

    if (result.success && result.user) {
      const userRole = result.user.role;
      if (userRole === 'customer') {
        router.replace('/customer');
      } else if (userRole === 'tradesperson') {
        router.replace('/tradie/home');
      } else if (userRole === 'admin') {
        router.replace('/admin');
      } else {
        setSignInError('Your account role is not supported.');
      }
    } else {
      setSignInError(result.error || 'Unable to sign in right now. Please try again.');
    }

    setSignInLoading(false);
  };

  const handleSignUp = async () => {
    if (!signUpName) {
      setSignUpError('Please enter your name');
      return;
    }
    if (!signUpEmail) {
      setSignUpError('Please enter your email');
      return;
    }
    if (!isValidEmail(signUpEmail)) {
      setSignUpError('Please enter a valid email address');
      return;
    }
    if (!signUpPassword) {
      setSignUpError('Please create a password');
      return;
    }
    if (signUpPassword.length < 8) {
      setSignUpError('Password must be at least 8 characters');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Passwords do not match');
      return;
    }

    setSignUpLoading(true);
    setSignUpError('');

    const selectedRole = normalizedRole === 'customer' || normalizedRole === 'tradesperson'
      ? normalizedRole
      : 'customer';
    const result = await signup(
      signUpEmail.trim(),
      signUpPassword,
      signUpName.trim(),
      selectedRole as any
    );

    if (result.success && result.user) {
      if (result.user.role === 'customer') {
        router.replace('/customer');
      } else if (result.user.role === 'tradesperson') {
        router.replace('/tradie/home');
      } else if (result.user.role === 'admin') {
        router.replace('/admin');
      } else {
        setSignUpError('Your account role is not supported.');
      }
    } else {
      setSignUpError(result.error || 'Unable to create your account right now. Please try again.');
    }

    setSignUpLoading(false);
  };

  const handleGooglePress = () => {
    if (activeTab === 'signin') {
      setSignInError('Google sign-in coming soon');
    } else {
      setSignUpError('Google sign-up coming soon');
    }
  };

  const handleApplePress = () => {
    if (activeTab === 'signin') {
      setSignInError('Apple sign-in coming soon');
    } else {
      setSignUpError('Apple sign-up coming soon');
    }
  };

  // eslint-disable-next-line react-hooks/refs
  const indicatorTranslateX = tabIndicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth],
  });

  const handleTabContainerLayout = (e: any) => {
    const containerWidth = e.nativeEvent.layout.width;
    setTabWidth((containerWidth - 8) / 2);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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

        <View style={styles.tabContainer} onLayout={handleTabContainerLayout}>
          {tabWidth > 0 && (
            <Animated.View
              style={[
                styles.tabIndicator,
                {
                  width: tabWidth,
                  transform: [{ translateX: indicatorTranslateX }],
                },
              ]}
            />
          )}
          <TouchableOpacity
            style={styles.tab}
            onPress={() => switchTab('signin')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'signin' && styles.tabTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => switchTab('signup')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.socialSection}>
          <TouchableOpacity style={styles.socialButton} onPress={handleGooglePress}>
            <View style={styles.socialIconContainer}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={handleApplePress}>
            <Ionicons name="logo-apple" size={20} color={Colors.background} />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        {activeTab === 'signin' ? (
          <View style={styles.formSection}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Email address"
                placeholderTextColor={Colors.textSecondary}
                value={signInEmail}
                onChangeText={(text) => { setSignInEmail(text); setSignInError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                returnKeyType="next"
                onSubmitEditing={() => signInPasswordRef.current?.focus()}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                ref={signInPasswordRef}
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                value={signInPassword}
                onChangeText={(text) => { setSignInPassword(text); setSignInError(''); }}
                secureTextEntry={!signInShowPassword}
                autoComplete="off"
                textContentType="oneTimeCode"
                returnKeyType="go"
                onSubmitEditing={handleSignIn}
              />
              <TouchableOpacity onPress={() => setSignInShowPassword(!signInShowPassword)} style={styles.eyeButton}>
                <Ionicons name={signInShowPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotButton} onPress={() => setSignInError('Password reset coming soon')}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {signInError ? <Text style={styles.error}>{signInError}</Text> : null}

            {signInNeedsVerification ? (
              <>
                <TouchableOpacity
                  style={styles.forgotButton}
                  onPress={async () => {
                    setSignInResendMessage('');
                    setSignInResendLoading(true);
                    const res = await resendVerification(signInEmail);
                    setSignInResendLoading(false);
                    if (res.success) {
                      setSignInResendMessage('Verification email resent. Please check your inbox.');
                    } else {
                      setSignInError(res.error || 'Unable to resend verification. Try signing up again or contact support.');
                    }
                  }}
                  disabled={signInResendLoading}
                >
                  <Text style={[styles.forgotText, { marginTop: 8 }]}>
                    {signInResendLoading ? 'Resending...' : 'Resend verification email'}
                  </Text>
                </TouchableOpacity>
                {signInResendMessage ? <Text style={{ color: Colors.success, textAlign: 'center', marginTop: 8 }}>{signInResendMessage}</Text> : null}
              </>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryButton, signInLoading && styles.primaryButtonDisabled]}
              testID="signin-button"
              onPress={handleSignIn}
              disabled={signInLoading}
            >
              {signInLoading ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.switchPrompt}>
              <Text style={styles.switchPromptText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => switchTab('signup')}>
                <Text style={styles.switchPromptLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.formSection}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Full name"
                placeholderTextColor={Colors.textSecondary}
                value={signUpName}
                onChangeText={(text) => { setSignUpName(text); setSignUpError(''); }}
                autoCapitalize="words"
                autoComplete="off"
                textContentType="none"
                returnKeyType="next"
                onSubmitEditing={() => signUpEmailRef.current?.focus()}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                ref={signUpEmailRef}
                style={styles.textInput}
                placeholder="Email address"
                placeholderTextColor={Colors.textSecondary}
                value={signUpEmail}
                onChangeText={(text) => { setSignUpEmail(text); setSignUpError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                returnKeyType="next"
                onSubmitEditing={() => signUpPasswordRef.current?.focus()}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                ref={signUpPasswordRef}
                style={styles.textInput}
                placeholder="Create password"
                placeholderTextColor={Colors.textSecondary}
                value={signUpPassword}
                onChangeText={(text) => { setSignUpPassword(text); setSignUpError(''); }}
                secureTextEntry={!signUpShowPassword}
                autoComplete="off"
                textContentType="oneTimeCode"
                returnKeyType="next"
                onSubmitEditing={() => signUpConfirmPasswordRef.current?.focus()}
              />
              <TouchableOpacity onPress={() => setSignUpShowPassword(!signUpShowPassword)} style={styles.eyeButton}>
                <Ionicons name={signUpShowPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                ref={signUpConfirmPasswordRef}
                style={styles.textInput}
                placeholder="Confirm password"
                placeholderTextColor={Colors.textSecondary}
                value={signUpConfirmPassword}
                onChangeText={(text) => { setSignUpConfirmPassword(text); setSignUpError(''); }}
                secureTextEntry={!signUpShowConfirmPassword}
                autoComplete="off"
                textContentType="oneTimeCode"
                returnKeyType="go"
                onSubmitEditing={handleSignUp}
              />
              <TouchableOpacity onPress={() => setSignUpShowConfirmPassword(!signUpShowConfirmPassword)} style={styles.eyeButton}>
                <Ionicons name={signUpShowConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.passwordHint}>Must be at least 8 characters</Text>

            {signUpError ? <Text style={styles.error}>{signUpError}</Text> : null}

            <TouchableOpacity
              style={[styles.primaryButton, signUpLoading && styles.primaryButtonDisabled]}
              onPress={handleSignUp}
              disabled={signUpLoading}
            >
              {signUpLoading ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.switchPrompt}>
              <Text style={styles.switchPromptText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => switchTab('signin')}>
                <Text style={styles.switchPromptLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 140,
    height: 50,
    marginBottom: Spacing.md,
  },
  tagline: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    padding: 4,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: Colors.accent,
    borderRadius: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  socialSection: {
    gap: Spacing.sm,
  },
  socialButton: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
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
  socialButtonText: {
    color: Colors.background,
    fontSize: 15,
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
    fontSize: 13,
    fontWeight: '500',
    marginHorizontal: Spacing.md,
  },
  formSection: {
    gap: Spacing.sm,
  },
  inputWrapper: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 52,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
    height: '100%',
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
  },
  forgotText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '500',
  },
  passwordHint: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginLeft: Spacing.xs,
    marginTop: -2,
  },
  error: {
    color: Colors.error,
    fontSize: 13,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  switchPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: Spacing.sm,
  },
  switchPromptText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  switchPromptLink: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: Spacing.xl,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: Colors.white,
    textDecorationLine: 'underline',
  },
});
