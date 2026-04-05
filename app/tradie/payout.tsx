import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useJobs } from '../../context/JobsContext';

export default function PayoutScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jobs } = useJobs();

  const job = jobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  const depositReceived = job.deposit_amount || 0;
  const finalPaymentReceived = job.final_payment_amount || 0;
  const totalEarned = depositReceived + finalPaymentReceived;
  const platformFee = 0;
  const netPayout = totalEarned - platformFee;

  const isPaymentSent = job.status === 'completed';

  const paymentStatusLabel = isPaymentSent
    ? 'Payment Sent'
    : 'Payment Processing';
  const paymentStatusIcon: 'checkmark-circle' | 'time' = isPaymentSent
    ? 'checkmark-circle'
    : 'time';
  const paymentStatusColor = isPaymentSent ? Colors.success : Colors.warning;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payout Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Job Complete Banner */}
        <View style={styles.completeBanner}>
          <View style={styles.completeTick}>
            <Ionicons name="checkmark" size={32} color={Colors.white} />
          </View>
          <Text style={styles.completeTitle}>Job Complete</Text>
          <Text style={styles.completeSubtitle}>
            Both parties have confirmed this job is finished.
          </Text>
        </View>

        {/* Payment Status */}
        <View style={styles.statusCard}>
          <Ionicons
            name={paymentStatusIcon}
            size={22}
            color={paymentStatusColor}
          />
          <View style={styles.statusContent}>
            <Text style={[styles.statusLabel, { color: paymentStatusColor }]}>
              {paymentStatusLabel}
            </Text>
            <Text style={styles.statusSubtext}>
              {isPaymentSent
                ? 'Funds have been released to your account.'
                : 'Your payment is being processed and will arrive shortly.'}
            </Text>
          </View>
        </View>

        {/* Payment Breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Breakdown</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Deposit received</Text>
            <Text style={styles.rowValue}>£{depositReceived.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Final payment received</Text>
            <Text style={styles.rowValue}>
              £{finalPaymentReceived.toFixed(2)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total received</Text>
            <Text style={styles.rowValue}>£{totalEarned.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.rowLabelGroup}>
              <Text style={styles.rowLabel}>Platform fee</Text>
              <View style={styles.feeBadge}>
                <Text style={styles.feeBadgeText}>WeeJobs Pro</Text>
              </View>
            </View>
            <Text style={[styles.rowValue, styles.feeValue]}>
              £{platformFee.toFixed(2)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>You earned</Text>
            <Text style={styles.totalValue}>£{netPayout.toFixed(2)}</Text>
          </View>
        </View>

        {/* Job Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Job Details</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Category</Text>
            <Text style={styles.rowValue}>{job.category}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Area</Text>
            <Text style={styles.rowValue}>{job.area}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Pricing type</Text>
            <Text style={styles.rowValue}>
              {job.pricing_type === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Job reference</Text>
            <Text style={styles.rowValue}>
              {job.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>

          {job.description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.rowLabel}>Description</Text>
              <Text style={styles.descriptionText}>{job.description}</Text>
            </View>
          ) : null}
        </View>

        {/* Pricing detail — hourly */}
        {job.pricing_type === 'hourly' && job.invoice_hours ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Work Summary</Text>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Hours worked</Text>
              <Text style={styles.rowValue}>{job.invoice_hours} hrs</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Hourly rate</Text>
              <Text style={styles.rowValue}>
                £{(job.invoice_hourly_rate || 0).toFixed(2)}/hr
              </Text>
            </View>

            {job.invoice_materials ? (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Materials</Text>
                <Text style={styles.rowValue}>
                  £{job.invoice_materials.toFixed(2)}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Pricing detail — fixed */}
        {job.pricing_type === 'fixed' && job.quote_total ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Quote Summary</Text>

            {job.quote_labour ? (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Labour</Text>
                <Text style={styles.rowValue}>
                  £{job.quote_labour.toFixed(2)}
                </Text>
              </View>
            ) : null}

            {job.quote_materials ? (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Materials</Text>
                <Text style={styles.rowValue}>
                  £{job.quote_materials.toFixed(2)}
                </Text>
              </View>
            ) : null}

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Quote total</Text>
              <Text style={styles.rowValue}>£{job.quote_total.toFixed(2)}</Text>
            </View>
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}
      >
        <TouchableOpacity
          style={styles.backToJobsButton}
          onPress={() => router.replace('/tradie/current-jobs')}
        >
          <Ionicons name="briefcase-outline" size={20} color={Colors.white} />
          <Text style={styles.backToJobsText}>Back to Jobs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  completeBanner: {
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  completeTick: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  completeTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  completeSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusSubtext: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rowLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  rowValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  feeValue: {
    color: Colors.success,
  },
  feeBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  feeBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  totalLabel: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: '800',
  },
  descriptionSection: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  descriptionText: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backToJobsButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.full,
  },
  backToJobsText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
