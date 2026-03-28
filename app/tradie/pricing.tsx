import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
// eslint-disable-next-line import/no-unresolved
import { Image } from 'expo-image';
import { Colors, Spacing } from '../../constants/theme';
import PricingCard from '../../components/PricingCard';

export default function PricingHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSelectPAYG = () => {
    Alert.alert(
      'Pay As You Go Selected',
      "You'll pay £2-5 to unlock each job, plus 10% on completion. Perfect for getting started!",
      [{ text: 'Continue', onPress: () => router.back() }]
    );
  };

  const handleSelectPRO = () => {
    Alert.alert(
      'PRO Subscription',
      "£49/month gets you unlimited job unlocks, lower fees, and the Verified Pro badge. Coming soon!",
      [{ text: 'Got it', onPress: () => router.back() }]
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.content, { paddingTop: Spacing.md, paddingBottom: insets.bottom + Spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/weejobs-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Start earning with WeeJobs today
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <PricingCard
          title="PRO SUBSCRIPTION"
          subtitle="Grow your business with every job"
          price="£49"
          features={[
            "5-7% completion fee only",
            "Unlimited lead unlocks",
            "Priority placement on all jobs",
            "Verified Pro badge on profile",
          ]}
          buttonLabel="Upgrade to PRO"
          onPress={handleSelectPRO}
          highlight={true}
          ribbonText="MOST POPULAR"
          showBadge={true}
        />

        <PricingCard
          title="PAY AS YOU GO"
          subtitle="Only pay when you need to"
          features={[
            "£2-5 to unlock a job",
            "10% completion fee",
            "No monthly cost",
            "Perfect for beginners",
          ]}
          buttonLabel="Continue with PAYG"
          onPress={handleSelectPAYG}
        />
      </View>

      <Text style={styles.footer}>
        You can switch between PAYG and PRO at any time.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 140,
    height: 50,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    fontStyle: 'italic',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  cardsContainer: {
    marginTop: Spacing.lg,
  },
  footer: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: Spacing.md,
  },
});
