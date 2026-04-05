import { useState, useEffect, type ComponentProps } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import { Job, JobStatus } from '../../lib/supabase';

const STATUS_COLORS: Partial<Record<JobStatus, string>> = {
  open: Colors.accent,
  pending_customer_choice: '#22c55e',
  awaiting_customer_choice: '#22c55e',
  booked: '#3b82f6',
  estimate_acknowledged: '#22d3ee',
  on_the_way: '#8b5cf6',
  in_progress: '#f59e0b',
  awaiting_quote_approval: '#06b6d4',
  awaiting_invoice_payment: '#ef4444',
  awaiting_final_payment: '#ef4444',
  paid: Colors.success,
  awaiting_confirmation: '#3b82f6',
  completed: Colors.textSecondary,
  cancelled: Colors.error,
  cancelled_by_customer: Colors.error,
  cancelled_by_tradie: Colors.error,
};

const STATUS_LABELS: Partial<Record<JobStatus, string>> = {
  open: 'Open',
  pending_customer_choice: 'Pending',
  awaiting_customer_choice: 'Pending Choice',
  booked: 'Booked',
  estimate_acknowledged: 'Estimate OK',
  on_the_way: 'On the Way',
  in_progress: 'In Progress',
  awaiting_quote_approval: 'Quote Sent',
  awaiting_invoice_payment: 'Invoice Sent',
  awaiting_final_payment: 'Awaiting Payment',
  paid: 'Paid',
  awaiting_confirmation: 'Confirming',
  completed: 'Completed',
  cancelled: 'Cancelled',
  cancelled_by_customer: 'Cancelled by Customer',
  cancelled_by_tradie: 'Cancelled by You',
};

type IconName = ComponentProps<typeof Ionicons>['name'];

type ActionConfig = {
  label: string;
  icon: IconName;
  color: string;
  action:
    | 'navigate'
    | 'on_the_way'
    | 'arrived'
    | 'send_quote'
    | 'send_estimate'
    | 'send_invoice'
    | 'confirm'
    | 'none';
};

export const getActionForStatus = (
  status: JobStatus,
  pricingType?: string,
): ActionConfig | null => {
  const isHourly = pricingType === 'hourly';

  switch (status) {
    case 'booked':
      if (isHourly) {
        return {
          label: 'Send Estimate',
          icon: 'calculator',
          color: '#22d3ee',
          action: 'send_estimate',
        };
      }
      return {
        label: "I'm On My Way",
        icon: 'car',
        color: '#3b82f6',
        action: 'on_the_way',
      };
    case 'estimate_acknowledged':
      return {
        label: "I'm On My Way",
        icon: 'car',
        color: '#3b82f6',
        action: 'on_the_way',
      };
    case 'on_the_way':
      return {
        label: "I've Arrived",
        icon: 'location',
        color: '#8b5cf6',
        action: 'arrived',
      };
    case 'in_progress':
      if (isHourly) {
        return {
          label: 'Send Invoice',
          icon: 'receipt',
          color: '#f59e0b',
          action: 'send_invoice',
        };
      }
      return {
        label: 'Send Quote',
        icon: 'document-text',
        color: '#f59e0b',
        action: 'send_quote',
      };
    case 'awaiting_quote_approval':
      return {
        label: 'Waiting for Approval...',
        icon: 'time',
        color: Colors.textSecondary,
        action: 'none',
      };
    case 'awaiting_invoice_payment':
      return {
        label: 'Waiting for Payment...',
        icon: 'card',
        color: Colors.textSecondary,
        action: 'none',
      };
    case 'awaiting_final_payment':
      return {
        label: 'Waiting for Payment...',
        icon: 'card',
        color: Colors.textSecondary,
        action: 'none',
      };
    case 'paid':
      return {
        label: 'Mark Complete',
        icon: 'checkmark-circle',
        color: Colors.success,
        action: 'confirm',
      };
    case 'awaiting_confirmation':
      return {
        label: 'Confirm Completion',
        icon: 'checkmark-done',
        color: '#3b82f6',
        action: 'confirm',
      };
    default:
      return null;
  }
};

export default function TradieCurrentJobsScreen() {
  const { user } = useAuth();
  const {
    jobs,
    loading,
    fetchJobs,
    markOnTheWay,
    markArrived,
    confirmCompletion,
  } = useJobs();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);

  const myJobs = jobs.filter((j) => j.tradie_id === user?.id);
  const activeJobs = myJobs.filter(
    (j) =>
      ![
        'completed',
        'cancelled',
        'cancelled_by_customer',
        'cancelled_by_tradie',
        'open',
        'pending_customer_choice',
        'awaiting_customer_choice',
      ].includes(j.status),
  );
  const completedJobs = myJobs.filter((j) => j.status === 'completed');
  const cancelledJobs = myJobs.filter(
    (j) =>
      j.status === 'cancelled_by_customer' ||
      j.status === 'cancelled_by_tradie',
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchJobs();
    setIsRefreshing(false);
  };

  const handleJobPress = (job: Job) => {
    router.push(`/job/tracking?jobId=${job.id}`);
  };

  const handleAction = async (job: Job, action: ActionConfig['action']) => {
    if (action === 'none') return;

    setLoadingJobId(job.id);

    try {
      switch (action) {
        case 'on_the_way':
          Alert.alert(
            'Start Navigation',
            'Confirm you are on your way to the job site?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => setLoadingJobId(null),
              },
              {
                text: 'Yes, Start',
                onPress: async () => {
                  await markOnTheWay(job.id);
                  setLoadingJobId(null);
                },
              },
            ],
          );
          return;
        case 'arrived':
          Alert.alert(
            'Arrived at Job',
            'Confirm you have arrived at the job site?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => setLoadingJobId(null),
              },
              {
                text: 'Yes, Arrived',
                onPress: async () => {
                  await markArrived(job.id);
                  setLoadingJobId(null);
                },
              },
            ],
          );
          return;
        case 'send_quote':
          router.push(`/job/send-quote?jobId=${job.id}`);
          break;
        case 'send_estimate':
          router.push(`/job/send-quote?jobId=${job.id}&mode=estimate`);
          break;
        case 'send_invoice':
          router.push(`/job/send-quote?jobId=${job.id}&mode=invoice`);
          break;
        case 'confirm':
          Alert.alert(
            'Confirm Completion',
            'Mark this job as complete? The customer will also need to confirm.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => setLoadingJobId(null),
              },
              {
                text: 'Confirm Complete',
                onPress: async () => {
                  await confirmCompletion(job.id, 'tradesperson');
                  setLoadingJobId(null);
                  if (job.customer_confirmed) {
                    Alert.alert(
                      'Job Completed!',
                      'Both parties have confirmed. The job is now complete.',
                    );
                  } else {
                    Alert.alert(
                      'Confirmed!',
                      'Waiting for customer to confirm completion.',
                    );
                  }
                },
              },
            ],
          );
          return;
        case 'navigate':
          router.push(`/job/tracking?jobId=${job.id}`);
          break;
      }
    } finally {
      setLoadingJobId(null);
    }
  };

  const renderJob = ({ item }: { item: Job }) => {
    const actionConfig = getActionForStatus(item.status, item.pricing_type);
    const isActionable = actionConfig && actionConfig.action !== 'none';
    const isLoading = loadingJobId === item.id;

    return (
      <TouchableOpacity
        style={[styles.jobCard, isActionable && styles.jobCardActionable]}
        onPress={() => handleJobPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.jobHeader}>
          <View style={styles.categoryBadge}>
            <Ionicons
              name="briefcase-outline"
              size={16}
              color={Colors.accent}
            />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: STATUS_COLORS[item.status] || Colors.accent },
            ]}
          >
            <Text style={styles.statusText}>
              {STATUS_LABELS[item.status] || item.status}
            </Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color={Colors.accent} />
            <Text style={styles.customerName}>{item.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{item.phone}</Text>
          </View>
        </View>

        <Text style={styles.jobDescription} numberOfLines={2}>
          {item.description || 'No description provided'}
        </Text>

        <View style={styles.jobFooter}>
          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.infoTextSmall}>{item.area}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="time-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.infoTextSmall}>{item.timing}</Text>
          </View>
        </View>

        {item.deposit_paid && (
          <View style={styles.depositBadge}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={Colors.success}
            />
            <Text style={styles.depositText}>
              Deposit Paid: £{item.deposit_amount?.toFixed(2)}
            </Text>
          </View>
        )}

        {actionConfig && (
          <TouchableOpacity
            style={[
              styles.actionBanner,
              { backgroundColor: actionConfig.color },
              actionConfig.action === 'none' && styles.actionBannerDisabled,
            ]}
            onPress={() => handleAction(item, actionConfig.action)}
            disabled={actionConfig.action === 'none' || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.background} />
            ) : (
              <>
                <Ionicons
                  name={actionConfig.icon}
                  size={18}
                  color={Colors.background}
                />
                <Text style={styles.actionText}>{actionConfig.label}</Text>
                {actionConfig.action !== 'none' && (
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={Colors.background}
                  />
                )}
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.tapHint}>
          <Ionicons name="eye-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.tapHintText}>Tap to view details</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCompletedJob = ({ item }: { item: Job }) => (
    <TouchableOpacity
      style={styles.completedJobCard}
      onPress={() => handleJobPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.completedHeader}>
        <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
        <Text style={styles.completedCategory}>{item.category}</Text>
        <Text style={styles.completedDate}>
          {new Date(item.completed_at || item.updated_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.completedDescription} numberOfLines={1}>
        {item.description || 'No description'}
      </Text>
      {item.quote_total && (
        <Text style={styles.completedEarnings}>
          Earned: £{item.quote_total.toFixed(2)}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderCancelledJob = ({ item }: { item: Job }) => (
    <TouchableOpacity
      style={styles.cancelledJobCard}
      onPress={() => handleJobPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.completedHeader}>
        <Ionicons name="close-circle" size={20} color={Colors.error} />
        <Text style={styles.cancelledCategory}>{item.category}</Text>
        <Text style={styles.completedDate}>
          {new Date(item.updated_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.completedDescription} numberOfLines={1}>
        {item.description || 'No description'}
      </Text>
      <View style={styles.cancelledMeta}>
        <Text style={styles.cancelledBy}>
          {item.status === 'cancelled_by_customer'
            ? 'Cancelled by customer'
            : 'Cancelled by you'}
        </Text>
        <Text
          style={[
            styles.refundOutcome,
            { color: item.deposit_refunded ? Colors.success : Colors.error },
          ]}
        >
          {item.deposit_refunded
            ? `Refund: £${item.deposit_amount?.toFixed(2)} to customer`
            : 'No refund — deposit kept by you'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && myJobs.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Spacing.md }]}>
      <Text style={styles.title}>My Jobs</Text>

      {myJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="briefcase-outline"
            size={64}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>No jobs yet</Text>
          <Text style={styles.emptyText}>
            Swipe right on jobs to express interest{'\n'}Once selected,
            they&apos;ll appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...activeJobs, ...completedJobs, ...cancelledJobs]}
          renderItem={({ item, index }) => {
            const isCancelledStart =
              cancelledJobs.length > 0 &&
              index === activeJobs.length + completedJobs.length;
            if (index < activeJobs.length) return renderJob({ item });
            if (index < activeJobs.length + completedJobs.length)
              return renderCompletedJob({ item });
            return (
              <>
                {isCancelledStart && (
                  <View style={styles.cancelledSectionHeader}>
                    <Ionicons
                      name="close-circle-outline"
                      size={18}
                      color={Colors.error}
                    />
                    <Text style={styles.cancelledSectionTitle}>
                      Cancelled ({cancelledJobs.length})
                    </Text>
                  </View>
                )}
                {renderCancelledJob({ item })}
              </>
            );
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent}
            />
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            activeJobs.length > 0 ? (
              <View style={styles.sectionHeader}>
                <Ionicons name="flash" size={18} color={Colors.accent} />
                <Text style={styles.sectionTitle}>
                  Active Jobs ({activeJobs.length})
                </Text>
              </View>
            ) : null
          }
          stickyHeaderIndices={activeJobs.length > 0 ? [0] : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '800',
    fontStyle: 'italic',
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: Spacing.xxl * 2,
  },
  jobCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  jobCardActionable: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryText: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  customerInfo: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  customerName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  infoTextSmall: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  jobDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  jobFooter: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  depositBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  depositText: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: '600',
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginHorizontal: -Spacing.lg,
    marginBottom: -Spacing.lg,
    padding: Spacing.md,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
  },
  actionBannerDisabled: {
    opacity: 0.6,
  },
  actionText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },
  tapHintText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  completedJobCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    opacity: 0.7,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  completedCategory: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  completedDate: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  completedDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  completedEarnings: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  cancelledSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cancelledSectionTitle: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelledJobCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.error,
    opacity: 0.85,
  },
  cancelledCategory: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  cancelledMeta: {
    marginTop: Spacing.xs,
    gap: 2,
  },
  cancelledBy: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  refundOutcome: {
    fontSize: 13,
    fontWeight: '500',
  },
});
