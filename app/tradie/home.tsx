import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';

export default function TradieHomeScreen() {
  const { user } = useAuth();
  const { jobs } = useJobs();

  const activeJobs = jobs.filter(
    j => j.tradie_id === user?.id && !['completed', 'cancelled'].includes(j.status)
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.greeting}>Hi {user?.name?.split(' ')[0] || 'there'}!</Text>
        <Text style={styles.heroTitle}>Ready to Work?</Text>
        <Text style={styles.heroSub}>Causeway Coast & Glens</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{activeJobs.length}</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star" size={22} color={Colors.warning} style={{ marginBottom: 4 }} />
          <Text style={styles.statLabel}>
            {user?.average_rating ? `${user.average_rating.toFixed(1)} Stars` : 'No reviews'}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{user?.jobs_completed ?? 0}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/tradie/current-jobs')}>
        <View style={styles.actionIcon}>
          <Ionicons name="briefcase" size={22} color={Colors.accent} />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>My Jobs</Text>
          <Text style={styles.actionSub}>
            {activeJobs.length > 0
              ? `${activeJobs.length} active job${activeJobs.length > 1 ? 's' : ''}`
              : 'No active jobs'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/tradie/dashboard')}>
        <View style={styles.actionIcon}>
          <Ionicons name="grid" size={22} color={Colors.accent} />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Dashboard</Text>
          <Text style={styles.actionSub}>Earnings & payout history</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/tradie/messages')}>
        <View style={styles.actionIcon}>
          <Ionicons name="chatbubbles" size={22} color={Colors.accent} />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Messages</Text>
          <Text style={styles.actionSub}>Chat with customers</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      {/* PRO upsell */}
      {(!user?.subscription_plan || user.subscription_plan === 'payg') && (
        <TouchableOpacity style={styles.proBanner} onPress={() => router.push('/tradie/pricing')}>
          <Ionicons name="star" size={20} color={Colors.white} />
          <View style={{ flex: 1 }}>
            <Text style={styles.proTitle}>Upgrade to PRO</Text>
            <Text style={styles.proSub}>Unlimited job leads from £49/month</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.white} />
        </TouchableOpacity>
      )}

      <View style={{ height: Spacing.xxl }} />
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  hero: {
    marginBottom: Spacing.xl,
  },
  greeting: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 34,
    fontWeight: '800',
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
  },
  heroSub: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNum: {
    color: Colors.accent,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  actionCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(37,99,235,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionSub: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  proBanner: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  proTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  proSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
});
