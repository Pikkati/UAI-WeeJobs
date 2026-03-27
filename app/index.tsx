import { useEffect } from 'react';
// Initialize Sentry (safe no-op if not configured)
import '../lib/sentry';
import { View, StyleSheet, Dimensions , Text } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing } from '../constants/theme';

import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { user, isLoading, hasSeenOnboarding } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (user) {
        if (user.role === 'customer') {
          router.replace('/customer');
        } else if (user.role === 'tradesperson') {
          router.replace('/tradie/home');
        } else if (user.role === 'admin') {
          router.replace('/admin');
        }
      } else {
        router.replace('/onboarding/intro');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLoading, user, hasSeenOnboarding]);

  return (
    <View style={styles.container} accessible accessibilityLabel="WeeJobs splash screen">
      <Image
        source={require('../assets/images/hero-handyman.png')}
        style={styles.heroImage}
        contentFit="cover"
        accessibilityLabel="Handyman hero image"
        accessible
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
        style={styles.gradient}
      />
      <View style={styles.content} accessible accessibilityLabel="WeeJobs logo and tagline">
        <Image
          source={require('../assets/images/weejobs-logo.png')}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="WeeJobs logo"
          accessible
        />
        <Text style={styles.tagline} accessibilityRole="header">No Job Too Wee</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 120,
  },
  logo: {
    width: 220,
    height: 80,
  },
  tagline: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 2,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
  },
});
