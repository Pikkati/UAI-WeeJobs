import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';

const ACTIVE_STATUSES = [
  'open',
  'pending_customer_choice',
  'awaiting_customer_choice',
  'booked',
  'estimate_acknowledged',
  'on_the_way',
  'in_progress',
  'awaiting_quote_approval',
  'awaiting_invoice_payment',
  'awaiting_final_payment',
  'awaiting_confirmation',
];

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  booked: 'Booked',
  on_the_way: 'Tradie On Way',
  in_progress: 'In Progress',
  awaiting_quote_approval: 'Quote Pending',
  awaiting_invoice_payment: 'Invoice Pending',
  awaiting_final_payment: 'Payment Due',
  awaiting_confirmation: 'Confirming',
};

export default function CustomerDashboardScreen() {
  const { user } = useAuth();
  const { jobs } = useJobs();

  const myJobs = jobs.filter((j) => j.customer_id === user?.id);
  const activeJobs = myJobs.filter((j) => ACTIVE_STATUSES.includes(j.status));
  const completedJobs = myJobs.filter((j) => j.status === 'completed');
  const totalSpent = completedJobs.reduce(
    (sum, j) => sum + (j.deposit_amount || 0) + (j.final_payment_amount || 0),
    0,
  );

  const getStatusColor = (status: string) => {
    if (['on_the_way', 'in_progress'].includes(status)) return Colors.success;
    if (
      [
        'awaiting_quote_approval',
        'awaiting_invoice_payment',
        'awaiting_final_payment',
      ].includes(status)
    )
      return Colors.warning;
    return Colors.accent;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{activeJobs.length}</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>£{totalSpent.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{completedJobs.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Active jobs quick links */}
      {activeJobs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Jobs</Text>
          {activeJobs.slice(0, 4).map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() =>
                router.push({
                  pathname: '/job/tracking',
                  params: { jobId: job.id },
                })
              }
            >
              <View style={styles.jobInfo}>
                <Text style={styles.jobCategory}>{job.category}</Text>
                <Text style={styles.jobArea}>{job.area}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: getStatusColor(job.status) + '22' },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: getStatusColor(job.status) },
                  ]}
                >
                  {STATUS_LABELS[job.status] || job.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {activeJobs.length > 4 && (
            <TouchableOpacity
              style={styles.viewAllRow}
              onPress={() => router.push('/customer/jobs')}
            >
              <Text style={styles.viewAllText}>
                View all {activeJobs.length} active jobs
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.accent}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Payment history */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        {completedJobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="receipt-outline"
              size={32}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>No completed jobs yet</Text>
            <Text style={styles.emptySubtitle}>
              Your payment history will appear here
            </Text>
          </View>
        ) : (
          completedJobs.map((job) => {
            const paid =
              (job.deposit_amount || 0) + (job.final_payment_amount || 0);
            return (
              <View key={job.id} style={styles.paymentCard}>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobCategory}>{job.category}</Text>
                  <Text style={styles.jobArea}>
                    {job.area} · #{job.id.slice(0, 8).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.paidAmount}>£{paid.toFixed(2)}</Text>
              </View>
            );
          })
        )}
      </View>

      {/* Quick actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/customer/post-job')}
        >
          <Ionicons name="add-circle" size={20} color={Colors.background} />
          <Text style={styles.primaryBtnText}>Post a New Job</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/customer/jobs')}
        >
          <Ionicons name="briefcase-outline" size={20} color={Colors.accent} />
          <Text style={styles.secondaryBtnText}>View All My Jobs</Text>
        </TouchableOpacity>
      </View>

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
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '800',
    fontStyle: 'italic',
    marginBottom: Spacing.xl,
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
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  jobCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  jobInfo: { flex: 1 },
  jobCategory: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  jobArea: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
  },
  viewAllText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  paymentCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paidAmount: {
    color: Colors.success,
    fontSize: 16,
    fontWeight: '800',
  },
  primaryBtn: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  secondaryBtnText: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '700',
  },
});
