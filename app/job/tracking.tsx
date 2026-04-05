import { useState, useEffect, useRef } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import JobStatusTimeline from '../../components/JobStatusTimeline';
import { JobStatus } from '../../lib/supabase';

export function getStatusDescription(status: JobStatus): string {
  switch (status) {
    case 'booked':
      return 'Job booked - waiting for tradesperson';
    case 'on_the_way':
      return 'Tradesperson is on the way';
    case 'in_progress':
      return 'Work in progress';
    case 'awaiting_quote_approval':
      return 'Quote sent - awaiting approval';
    case 'awaiting_final_payment':
      return 'Quote approved - awaiting payment';
    case 'paid':
      return 'Payment received';
    case 'awaiting_confirmation':
      return 'Waiting for completion confirmation';
    case 'completed':
      return 'Job completed!';
    case 'cancelled_by_customer':
      return 'Cancelled by customer';
    case 'cancelled_by_tradie':
      return 'Cancelled by tradesperson';
    default:
      return '';
  }
}

export function getCancelRefundMessage(
  status: JobStatus,
  deposit_amount?: number,
) {
  const depositText = deposit_amount
    ? `£${deposit_amount.toFixed(2)} deposit`
    : 'your deposit';
  const refundMessage =
    status === 'booked'
      ? `You will receive a full refund of your ${depositText}.`
      : `As the tradesperson is already on their way, your ${depositText} is non-refundable.`;
  return { depositText, refundMessage };
}

export default function JobTrackingScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    jobs,
    getNextActionsByRole,
    markOnTheWay,
    markArrived,
    confirmCompletion,
    cancelJob,
  } = useJobs();

  const [tradieLocation, setTradieLocation] = useState({ progress: 0 });
  const [eta, setEta] = useState(15);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const job = jobs.find((j) => j.id === jobId);
  const isCustomer = user?.role === 'customer';

  useEffect(() => {
    if (job?.status === 'on_the_way') {
      intervalRef.current = setInterval(() => {
        setTradieLocation((prev) => {
          const newProgress = Math.min(prev.progress + 0.05, 1);
          return { progress: newProgress };
        });
        setEta((prev) => Math.max(prev - 1, 0));
      }, 2000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [job?.status]);

  if (!job) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  const actions = getNextActionsByRole(
    job.status,
    isCustomer ? 'customer' : 'tradesperson',
    job.pricing_type,
  );

  const handleAction = async (action: string) => {
    switch (action) {
      case 'start_navigation':
        await markOnTheWay(job.id);
        break;
      case 'mark_arrived':
        await markArrived(job.id);
        break;
      case 'send_estimate':
        router.push(`/job/send-quote?jobId=${job.id}&mode=estimate`);
        break;
      case 'send_quote':
        router.push(`/job/send-quote?jobId=${job.id}`);
        break;
      case 'send_invoice':
        router.push(`/job/send-quote?jobId=${job.id}&mode=invoice`);
        break;
      case 'approve_quote':
        router.push(`/job/approve-quote?jobId=${job.id}`);
        break;
      case 'pay_invoice':
        router.push(`/job/pay-final?jobId=${job.id}&mode=invoice`);
        break;
      case 'pay_final':
        router.push(`/job/pay-final?jobId=${job.id}`);
        break;
      case 'message':
        router.push(`/chat/${job.id}`);
        break;
      case 'confirm_complete':
        const confirmRole = isCustomer ? 'customer' : 'tradesperson';
        const confirmSuccess = await confirmCompletion(job.id, confirmRole);
        if (confirmSuccess) {
          const otherPartyConfirmed = isCustomer
            ? job.tradie_confirmed
            : job.customer_confirmed;
          if (otherPartyConfirmed) {
            Alert.alert(
              'Job Completed!',
              'Both parties have confirmed. Would you like to leave a review?',
              [
                { text: 'Later', style: 'cancel' },
                {
                  text: 'Leave Review',
                  onPress: () => router.push(`/job/review?jobId=${job.id}`),
                },
              ],
            );
          } else {
            const otherParty = isCustomer ? 'tradesperson' : 'customer';
            Alert.alert(
              'Confirmed!',
              `Waiting for the ${otherParty} to confirm completion.`,
            );
          }
        }
        break;
      case 'leave_review':
        router.push(`/job/review?jobId=${job.id}`);
        break;
      case 'view_payout':
        router.push(`/tradie/payout?jobId=${job.id}`);
        break;
      case 'review_customer':
        router.push(`/tradie/review-customer?jobId=${job.id}`);
        break;
      case 'cancel_job':
        if (isCustomer) {
          const { depositText, refundMessage } = getCancelRefundMessage(
            job.status,
            job.deposit_amount,
          );
          Alert.alert(
            'Cancel Job',
            `Are you sure you want to cancel this job?\n\n${refundMessage}`,
            [
              { text: 'Keep Job', style: 'cancel' },
              {
                text: 'Cancel Job',
                style: 'destructive',
                onPress: async () => {
                  const reason =
                    job.status === 'booked'
                      ? 'Customer cancelled before tradie departed'
                      : 'Customer cancelled after tradie departed';
                  const success = await cancelJob(job.id, 'customer', reason);
                  if (success) {
                    Alert.alert(
                      'Job Cancelled',
                      job.status === 'booked'
                        ? 'Your job has been cancelled. A full refund will be processed to your original payment method.'
                        : 'Your job has been cancelled. No refund applies as the tradesperson was already on their way.',
                      [{ text: 'OK', onPress: () => router.back() }],
                    );
                  }
                },
              },
            ],
          );
        } else {
          const depositText = job.deposit_amount
            ? `£${job.deposit_amount.toFixed(2)}`
            : 'the';
          Alert.alert(
            'Cancel Job',
            `Are you sure you want to cancel this job?\n\nThe customer will receive a full refund of their ${depositText} deposit. You will not receive any payment.`,
            [
              { text: 'Keep Job', style: 'cancel' },
              {
                text: 'Cancel Job',
                style: 'destructive',
                onPress: async () => {
                  const success = await cancelJob(
                    job.id,
                    'tradie',
                    'Tradie cancelled',
                  );
                  if (success) {
                    Alert.alert(
                      'Job Cancelled',
                      'The job has been cancelled. The customer will receive a full refund.',
                      [{ text: 'OK', onPress: () => router.back() }],
                    );
                  }
                },
              },
            ],
          );
        }
        break;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.timelineContainer}>
          <JobStatusTimeline currentStatus={job.status} />
        </View>

        <View style={styles.mapPlaceholder}>
          <View style={styles.mapContent}>
            <View style={styles.customerPin}>
              <Ionicons name="home" size={20} color={Colors.white} />
            </View>

            {job.status === 'on_the_way' && (
              <View
                style={[
                  styles.tradieMarker,
                  { left: `${20 + tradieLocation.progress * 60}%` },
                ]}
              >
                <Ionicons name="car" size={20} color={Colors.background} />
              </View>
            )}

            <View
              style={[
                styles.tradiePin,
                { opacity: job.status === 'booked' ? 1 : 0.3 },
              ]}
            >
              <Ionicons name="hammer" size={20} color={Colors.white} />
            </View>
          </View>

          <Text style={styles.mapLabel}>Map Preview</Text>
        </View>

        {job.status === 'on_the_way' && (
          <View style={styles.etaCard}>
            <Ionicons name="time" size={24} color={Colors.accent} />
            <View style={styles.etaContent}>
              <Text style={styles.etaLabel}>Estimated arrival</Text>
              <Text style={styles.etaTime}>{eta} minutes</Text>
            </View>
          </View>
        )}

        <View
          style={[
            styles.statusCard,
            (job.status === 'cancelled_by_customer' ||
              job.status === 'cancelled_by_tradie') &&
              styles.cancelledCard,
          ]}
        >
          <Text style={styles.statusLabel}>Current Status</Text>
          <Text
            style={[
              styles.statusText,
              (job.status === 'cancelled_by_customer' ||
                job.status === 'cancelled_by_tradie') &&
                styles.cancelledStatusText,
            ]}
          >
            {job.status === 'booked' && 'Job booked - waiting for tradesperson'}
            {job.status === 'on_the_way' && 'Tradesperson is on the way'}
            {job.status === 'in_progress' && 'Work in progress'}
            {job.status === 'awaiting_quote_approval' &&
              'Quote sent - awaiting approval'}
            {job.status === 'awaiting_final_payment' &&
              'Quote approved - awaiting payment'}
            {job.status === 'paid' && 'Payment received'}
            {job.status === 'awaiting_confirmation' &&
              'Waiting for completion confirmation'}
            {job.status === 'completed' && 'Job completed!'}
            {job.status === 'cancelled_by_customer' && 'Cancelled by customer'}
            {job.status === 'cancelled_by_tradie' &&
              'Cancelled by tradesperson'}
          </Text>
          {(job.status === 'cancelled_by_customer' ||
            job.status === 'cancelled_by_tradie') && (
            <View style={styles.refundRow}>
              <Ionicons
                name={
                  job.deposit_refunded ? 'checkmark-circle' : 'close-circle'
                }
                size={16}
                color={job.deposit_refunded ? Colors.success : Colors.error}
              />
              <Text
                style={[
                  styles.refundText,
                  {
                    color: job.deposit_refunded ? Colors.success : Colors.error,
                  },
                ]}
              >
                {job.deposit_refunded
                  ? `Deposit refund of £${job.deposit_amount?.toFixed(2)} will be processed`
                  : 'No refund — deposit goes to tradesperson'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.jobDetails}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{job.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Area</Text>
            <Text style={styles.detailValue}>{job.area}</Text>
          </View>
          {job.deposit_paid && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Deposit Paid</Text>
              <Text style={[styles.detailValue, styles.paidValue]}>
                £{job.deposit_amount?.toFixed(2)}
              </Text>
            </View>
          )}
          {job.quote_total && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quote Total</Text>
              <Text style={styles.detailValue}>
                £{job.quote_total.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {actions.length > 0 && (
        <View
          style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}
        >
          {actions.map((action, index) => (
            <TouchableOpacity
              key={action.action}
              style={[
                styles.actionButton,
                action.variant === 'primary' && styles.primaryButton,
                action.variant === 'secondary' && styles.secondaryButton,
                action.variant === 'outline' && styles.outlineButton,
                action.variant === 'danger' && styles.dangerButton,
              ]}
              onPress={() => handleAction(action.action)}
              disabled={action.action === 'none'}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  action.variant !== 'primary' &&
                    action.variant !== 'danger' &&
                    styles.secondaryButtonText,
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
    paddingVertical: Spacing.md,
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
  },
  timelineContainer: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  mapPlaceholder: {
    marginHorizontal: Spacing.md,
    height: 200,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  mapContent: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#1a2744',
  },
  customerPin: {
    position: 'absolute',
    right: '15%',
    top: '40%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tradiePin: {
    position: 'absolute',
    left: '15%',
    top: '40%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tradieMarker: {
    position: 'absolute',
    top: '38%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  mapLabel: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  etaContent: {
    flex: 1,
  },
  etaLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  etaTime: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  statusCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  statusLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  statusText: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: '600',
  },
  jobDetails: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  detailValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  paidValue: {
    color: Colors.success,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.accent,
  },
  secondaryButton: {
    backgroundColor: Colors.card,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: Colors.border,
  },
  dangerButton: {
    backgroundColor: Colors.error,
  },
  cancelledCard: {
    borderWidth: 1,
    borderColor: Colors.error,
  },
  cancelledStatusText: {
    color: Colors.error,
  },
  refundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  refundText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: Colors.white,
  },
});
