import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import Icon from '../../components/icons/Icon';

export default function RoleSelectScreen() {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/onboarding/intro')}
      >
        <Icon name="arrow-back" size={24} color={Colors.white} />
      </TouchableOpacity>

      <Image
        source={require('../../assets/images/weejobs-logo.png')}
        style={styles.logo}
        contentFit="contain"
      />

      <Text style={styles.title}>Welcome to WeeJobs</Text>
      <Text style={styles.subtitle}>
        The handyman marketplace for{'\n'}Causeway Coast & Glens
      </Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => router.push('/onboarding/login?role=customer')}
        >
          <View style={styles.roleIcon}>
            <Icon name="home-outline" size={32} color={Colors.accent} />
          </View>
          <View style={styles.roleText}>
            <Text style={styles.roleTitle}>I Need a Job Done</Text>
            <Text style={styles.roleDescription}>
              Post jobs and find tradespeople
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => router.push('/onboarding/login?role=tradesperson')}
        >
          <View style={styles.roleIcon}>
            <Ionicons name="hammer-outline" size={32} color={Colors.accent} />
          </View>
          <View style={styles.roleText}>
            <Text style={styles.roleTitle}>I&apos;m a Tradesperson</Text>
            <Text style={styles.roleDescription}>
              Find and accept local jobs
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.stat}>380+ Jobs Completed</Text>
        <Text style={styles.tagline}>No Job Too Wee</Text>
      </View>

      <TouchableOpacity
        style={styles.adminLink}
        onPress={() => router.push('/onboarding/login?role=admin')}
      >
        <Text style={styles.adminText}>Admin Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  logo: {
    width: 200,
    height: 80,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '800',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 24,
  },
  buttonsContainer: {
    gap: Spacing.md,
  },
  roleButton: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  roleText: {
    flex: 1,
  },
  roleTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  stat: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontStyle: 'italic',
  },
  adminLink: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  adminText: {
    color: Colors.border,
    fontSize: 12,
  },
});
