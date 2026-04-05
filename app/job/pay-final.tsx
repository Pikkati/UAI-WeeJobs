import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useJobs } from '../../context/JobsContext';
import StripeCheckoutStub from '../../components/StripeCheckoutStub';

export default function PayFinalBalanceScreen() {
  const { jobId, mode: modeParam } = useLocalSearchParams<{
    jobId: string;
    mode?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jobs, payFinalBalance, payInvoice } = useJobs();

  const [showStripeModal, setShowStripeModal] = useState(false);

  const job = jobs.find((j) => j.id === jobId);
  const isInvoice = job?.pricing_type === 'hourly' || modeParam === 'invoice';

  const depositPaid = job?.deposit_amount || 0;

  const total = isInvoice ? job?.invoice_total || 0 : job?.quote_total || 0;

  const remainingBalance = Math.max(0, total - depositPaid);

  const estimateTotal = job?.estimate_total || 0;
  const variance =
    isInvoice && estimateTotal > 0
      ? ((total - estimateTotal) / estimateTotal) * 100
      : 0;
  const hasHighVariance = Math.abs(variance) > 20;

  if (!job) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  const handlePayNow = () => {
    setShowStripeModal(true);
  };

  const handlePaymentSuccess = async () => {
    setShowStripeModal(false);

    let result;
    if (isInvoice) {
      result = await payInvoice(jobId!, remainingBalance);
    } else {
      result = await payFinalBalance(jobId!, remainingBalance);
    }

    if (result.ok) {
      Alert.alert(
        'Payment Successful!',
        'Thank you for your payment. Please confirm when the job is complete.',
        [
          {
            text: 'View Receipt',
            onPress: () => router.push(`/job/receipt?jobId=${jobId}`),
          },
        ],
      );
    } else {
      Alert.alert('Error', 'Payment failed. Please try again.');
    }
  };

  const getTitle = () => (isInvoice ? 'Pay Invoice' : 'Pay Remaining Balance');
  const getTotalLabel = () => (isInvoice ? 'Invoice total' : 'Quote total');

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.amountCard}>
          <View style={styles.amountHeader}>
            {isInvoice && (
              <View style={styles.invoiceBadge}>
                <Ionicons name="receipt" size={14} color={Colors.background} />
                <Text style={styles.invoiceBadgeText}>Invoice</Text>
              </View>
            )}
          </View>
          <Text style={styles.amountLabel}>Amount Due</Text>
          <Text style={styles.amount}>£{remainingBalance.toFixed(2)}</Text>
        </View>

        {isInvoice && hasHighVariance && (
          <View style={styles.varianceWarning}>
            <Ionicons name="warning" size={20} color={Colors.warning} />
            <View style={styles.varianceContent}>
              <Text style={styles.varianceTitle}>
                Invoice differs from estimate
              </Text>
              <Text style={styles.varianceText}>
                Original estimate: £{estimateTotal.toFixed(2)} (
                {variance > 0 ? '+' : ''}
                {variance.toFixed(0)}%)
              </Text>
            </View>
          </View>
        )}

        {isInvoice && (
          <View style={styles.breakdownCard}>
            <Text style={styles.sectionTitle}>Work Completed</Text>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Hours worked</Text>
              <Text style={styles.breakdownValue}>
                {job.invoice_hours || 0} hrs
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Hourly rate</Text>
              <Text style={styles.breakdownValue}>
                £{(job.invoice_hourly_rate || 0).toFixed(2)}/hr
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Labour</Text>
              <Text style={styles.breakdownValue}>
                £
                {(
                  (job.invoice_hours || 0) * (job.invoice_hourly_rate || 0)
                ).toFixed(2)}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Materials</Text>
              <Text style={styles.breakdownValue}>
                £{(job.invoice_materials || 0).toFixed(2)}
              </Text>
            </View>

            {job.invoice_notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{job.invoice_notes}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>{getTotalLabel()}</Text>
            <Text style={styles.breakdownValue}>£{total.toFixed(2)}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.depositInfo}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={Colors.success}
              />
              <Text style={styles.breakdownLabel}>Deposit paid</Text>
            </View>
            <Text style={[styles.breakdownValue, styles.paidValue]}>
              -£{depositPaid.toFixed(2)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.totalLabel}>Remaining balance</Text>
            <Text style={styles.totalValue}>
              £{remainingBalance.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.jobCard}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.jobRow}>
            <Text style={styles.jobLabel}>Category</Text>
            <Text style={styles.jobValue}>{job.category}</Text>
          </View>
          <View style={styles.jobRow}>
            <Text style={styles.jobLabel}>Area</Text>
            <Text style={styles.jobValue}>{job.area}</Text>
          </View>
          <View style={styles.jobRow}>
            <Text style={styles.jobLabel}>Pricing Type</Text>
            <Text style={styles.jobValue}>
              {isInvoice ? 'Hourly Rate' : 'Fixed Price'}
            </Text>
          </View>
        </View>

        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
          <Text style={styles.securityText}>
            Your payment is protected. Funds are released to the tradesperson
            only after you confirm the job is complete.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}
      >
        <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
          <Ionicons name="card" size={22} color={Colors.background} />
          <Text style={styles.payButtonText}>
            Pay £{remainingBalance.toFixed(2)}
          </Text>
        </TouchableOpacity>

        <View style={styles.stripeNote}>
          <Text style={styles.stripeText}>Powered by</Text>
          <Text style={styles.stripeLogo}>stripe</Text>
        </View>
      </View>

      <StripeCheckoutStub
        visible={showStripeModal}
        amount={remainingBalance}
        description={isInvoice ? 'Invoice payment' : 'Final payment for job'}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setShowStripeModal(false)}
      />
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
  amountCard: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  amountHeader: {
    marginBottom: Spacing.sm,
  },
  invoiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  invoiceBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  amountLabel: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  amount: {
    color: Colors.white,
    fontSize: 48,
    fontWeight: '800',
  },
  varianceWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: Colors.warning,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  varianceContent: {
    flex: 1,
  },
  varianceTitle: {
    color: Colors.warning,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  varianceText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  breakdownCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  depositInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  breakdownLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  breakdownValue: {
    color: Colors.white,
    fontSize: 14,
  },
  paidValue: {
    color: Colors.success,
  },
  notesSection: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  notesLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  notesText: {
    color: Colors.white,
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    color: Colors.accent,
    fontSize: 20,
    fontWeight: '800',
  },
  jobCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  jobRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  jobLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  jobValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  securityText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  payButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  payButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  stripeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  stripeText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  stripeLogo: {
    color: '#635bff',
    fontSize: 14,
    fontWeight: '700',
    fontStyle: 'italic',
  },
});
