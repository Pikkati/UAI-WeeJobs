import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationsProvider } from '../context/NotificationsContext';
import { LoadingProvider } from '../context/LoadingContext';
import { ThemeProvider } from '../context/ThemeContext';
import { JobsProvider } from '../context/JobsContext';
import { Colors } from '../constants/theme';
import { View, ActivityIndicator, Text, TextInput } from 'react-native';

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Sentry = require('@sentry/react-native');
  if (Sentry && Sentry.init) {
    Sentry.init({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? undefined,
      tracesSampleRate: Number(process.env.EXPO_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    });
  }
} catch (e) {}

if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
// Respect user's font scaling settings — allow system font scaling
(Text as any).defaultProps.allowFontScaling = true;

if ((TextInput as any).defaultProps == null) (TextInput as any).defaultProps = {};
// Respect user's font scaling settings for inputs as well
(TextInput as any).defaultProps.allowFontScaling = true;

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

  if (!loaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      <ThemeProvider>
        <ThemeAwareStatusBar />
        <LoadingProvider>
          <NotificationsProvider>
            <AuthProvider>
              <JobsProvider>
              <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
                animation: 'fade',
              }}
            />
            </JobsProvider>
            </AuthProvider>
          </NotificationsProvider>
        </LoadingProvider>
      </ThemeProvider>
    </StripeProvider>
  );
}

export { default as ErrorBoundary } from '../components/ErrorBoundary';

function ThemeAwareStatusBar() {
  const { mode } = useTheme();
  return <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />;
}
