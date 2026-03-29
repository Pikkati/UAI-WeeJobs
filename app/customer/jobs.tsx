import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import { Job, JobStatus, supabase } from '../../lib/supabase';
import { STATUS_COLORS, STATUS_LABELS } from './jobs.helpers';

export function canEditOrDelete(status: JobStatus): boolean {
  return status === 'open' || status === 'pending_customer_choice' || status === 'awaiting_customer_choice';
}

export function getActionText(status: JobStatus, interestCount: number): string | null {
  switch (status) {
    case 'open':
    case 'pending_customer_choice':
      return interestCount > 0 ? 'Tap to view interested tradespeople' : null;
    case 'awaiting_customer_choice':
      return 'Tap to choose your tradesperson';
    case 'awaiting_quote_approval':
      return 'Tap to review the quote';
    case 'awaiting_final_payment':
      return 'Tap to complete payment';
    case 'booked':
    case 'on_the_way':
    case 'in_progress':
      return 'Tap to track progress';
    case 'completed':
      return 'Tap to leave a review';
    default:
      return null;
  }
}

export function aggregateInterestCounts(rows: Array<{ job_id?: string }>): Record<string, number> {
  const counts: Record<string, number> = {};
  if (!rows || !Array.isArray(rows)) return counts;
  rows.forEach(row => {
    const id = row && (row.job_id as string | undefined);
    if (!id) return;
    counts[id] = (counts[id] || 0) + 1;
  });
  return counts;
}

export default function CustomerJobsScreen() {
  
  const { user } = useAuth();
  const { jobs, loading, fetchJobs, closeApplications } = useJobs();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [interestCounts, setInterestCounts] = useState<Record<string, number>>({});

  const myJobs = jobs.filter(j => j.customer_id === user?.id);

  const fetchInterestCounts = useCallback(async (jobList: Job[]) => {
    const openJobIds = jobList
      .filter(j => j.status === 'open' || j.status === 'pending_customer_choice')
      .map(j => j.id);

    if (openJobIds.length === 0) return;

    try {
      const { data } = await supabase
        .from('job_interests')
        .select('job_id')
        .in('job_id', openJobIds)
        .in('status', ['interested', 'shortlisted']);

        if (data) {
          const counts = aggregateInterestCounts(data);
          setInterestCounts(counts);
        }
    } catch (e) {
      console.error('Error fetching interest counts:', e);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (myJobs.length > 0) {
      fetchInterestCounts(myJobs);
    }
  }, [myJobs, fetchInterestCounts]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchJobs();
    setIsRefreshing(false);
  };

  

  const handleLongPress = (job: Job) => {
    if (canEditOrDelete(job.status)) {
      setSelectedJob(job);
      setShowOptionsModal(true);
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;

    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', selectedJob.id);

              if (error) throw error;

              setShowOptionsModal(false);
              setSelectedJob(null);
              fetchJobs();
              Alert.alert('Deleted', 'Your job has been deleted.');
            } catch (error) {
              console.error('Error deleting job:', error);
              Alert.alert('Error', 'Failed to delete job. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEditJob = () => {
    if (!selectedJob) return;
    setShowOptionsModal(false);
    router.push(`/customer/edit-job?jobId=${selectedJob.id}`);
  };

  const handleCloseApplications = async () => {
    if (!selectedJob) return;
    Alert.alert(
      'Close Applications',
      'Stop accepting new tradespeople and review those already interested?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Applications',
          onPress: async () => {
            const success = await closeApplications(selectedJob.id);
            setShowOptionsModal(false);
            setSelectedJob(null);
            if (!success) Alert.alert('Error', 'Failed to close applications. Please try again.');
          },
        },
      ]
    );
  };

  const handleCancelJob = async () => {
    if (!selectedJob) return;

    Alert.alert(
      'Cancel Job',
      'Are you sure you want to cancel this job?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel Job',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('jobs')
                .update({ status: 'cancelled' })
                .eq('id', selectedJob.id);

              if (error) throw error;

              setShowOptionsModal(false);
              setSelectedJob(null);
              fetchJobs();
              Alert.alert('Cancelled', 'Your job has been cancelled.');
            } catch (error) {
              console.error('Error cancelling job:', error);
              Alert.alert('Error', 'Failed to cancel job. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleJobPress = (job: Job) => {
    switch (job.status) {
      case 'open':
      case 'pending_customer_choice':
        if (interestCounts[job.id] > 0) {
          router.push(`/job/choose-tradesman?jobId=${job.id}`);
        }
        break;
      case 'awaiting_customer_choice':
        router.push(`/job/choose-tradesman?jobId=${job.id}`);
        break;
      case 'booked':
      case 'on_the_way':
      case 'in_progress':
        router.push(`/job/tracking?jobId=${job.id}`);
        break;
      case 'awaiting_quote_approval':
        router.push(`/job/approve-quote?jobId=${job.id}`);
        break;
      case 'awaiting_final_payment':
        router.push(`/job/pay-final?jobId=${job.id}`);
        break;
      case 'paid':
      case 'awaiting_confirmation':
        router.push(`/job/tracking?jobId=${job.id}`);
        break;
      case 'completed':
        router.push(`/job/review?jobId=${job.id}`);
        break;
      case 'cancelled_by_customer':
      case 'cancelled_by_tradie':
        router.push(`/job/tracking?jobId=${job.id}`);
        break;
      default:
        break;
    }
  };

  

  const renderJob = ({ item }: { item: Job }) => {
    const count = interestCounts[item.id] || 0;
    const actionText = getActionText(item.status, count);
    const isActionable = actionText !== null;
    const canModify = canEditOrDelete(item.status);
    const showInterestBanner =
      item.status === 'awaiting_customer_choice' ||
      item.status === 'pending_customer_choice' ||
      (item.status === 'open' && count > 0);

    return (
      <TouchableOpacity 
        style={[styles.jobCard, isActionable && styles.jobCardActionable]} 
        onPress={() => handleJobPress(item)}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
      >
        {canModify && (
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => handleLongPress(item)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
        <View style={styles.jobHeader}>
          <View style={styles.categoryBadge}>
            <Ionicons name="briefcase-outline" size={16} color={Colors.accent} />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || Colors.accent }]}>
            <Text style={styles.statusText}>{STATUS_LABELS[item.status] || item.status}</Text>
          </View>
        </View>

        <Text style={styles.jobDescription} numberOfLines={2}>
          {item.description || 'No description provided'}
        </Text>

        <View style={styles.jobFooter}>
          <View style={styles.jobInfo}>
            <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.jobInfoText}>{item.area}</Text>
          </View>
          <View style={styles.jobInfo}>
            <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.jobInfoText}>{item.timing}</Text>
          </View>
        </View>

        {showInterestBanner && (
          <View style={styles.interestBanner}>
            <Ionicons name="people" size={18} color={Colors.white} />
            <Text style={styles.interestText}>
              {count > 0
                ? `${count} tradesperson${count === 1 ? '' : 's'} interested — tap to view`
                : 'Tradespeople are interested!'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.white} />
          </View>
        )}

        {actionText && !showInterestBanner && (
          <View style={styles.actionHint}>
            <Text style={styles.actionHintText}>{actionText}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.accent} />
          </View>
        )}

        {(item.status === 'cancelled_by_customer' || item.status === 'cancelled_by_tradie') && (
          <View style={styles.cancellationBanner}>
            <View style={styles.cancellationRow}>
              <Ionicons name="close-circle" size={16} color={Colors.error} />
              <Text style={styles.cancellationLabel}>
                {item.status === 'cancelled_by_tradie' ? 'Tradesperson cancelled' : 'You cancelled this job'}
              </Text>
            </View>
            <View style={styles.cancellationRow}>
              <Ionicons
                name={item.deposit_refunded ? 'checkmark-circle' : 'close-circle'}
                size={14}
                color={item.deposit_refunded ? Colors.success : Colors.error}
              />
              <Text style={[styles.refundLabel, { color: item.deposit_refunded ? Colors.success : Colors.error }]}>
                {item.deposit_refunded
                  ? `Deposit refund: £${item.deposit_amount?.toFixed(2)}`
                  : 'No refund — deposit kept by tradesperson'}
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.postedDate}>
          Posted {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

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
          <Ionicons name="briefcase-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No jobs yet</Text>
          <Text style={styles.emptyText}>Post your first job to get started</Text>
          <TouchableOpacity
            style={styles.postButton}
            onPress={() => router.push('/customer/post-job')}
          >
            <Text style={styles.postButtonText}>Post a Job</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={myJobs}
          renderItem={renderJob}
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
        />
      )}

      <Modal
        visible={showOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.optionsModal}>
            <Text style={styles.modalTitle}>Job Options</Text>
            {selectedJob && (
              <Text style={styles.modalSubtitle} numberOfLines={2}>
                {selectedJob.description || selectedJob.category}
              </Text>
            )}

            <TouchableOpacity style={styles.optionButton} onPress={handleEditJob}>
              <Ionicons name="pencil" size={22} color={Colors.accent} />
              <Text style={styles.optionText}>Edit Job</Text>
            </TouchableOpacity>

            {selectedJob && (selectedJob.status === 'open' || selectedJob.status === 'pending_customer_choice') && (
              <TouchableOpacity style={styles.optionButton} onPress={handleCloseApplications}>
                <Ionicons name="lock-closed" size={22} color="#22c55e" />
                <Text style={[styles.optionText, { color: '#22c55e' }]}>Close Applications</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.optionButton} onPress={handleCancelJob}>
              <Ionicons name="close-circle" size={22} color="#f59e0b" />
              <Text style={[styles.optionText, { color: '#f59e0b' }]}>Cancel Job</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={handleDeleteJob}>
              <Ionicons name="trash" size={22} color={Colors.error} />
              <Text style={[styles.optionText, { color: Colors.error }]}>Delete Job</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.closeModalButton} 
              onPress={() => setShowOptionsModal(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
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
  jobDescription: {
    color: Colors.white,
    fontSize: 16,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  jobFooter: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  jobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  jobInfoText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  interestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#22c55e',
    marginTop: Spacing.md,
    marginHorizontal: -Spacing.lg,
    marginBottom: -Spacing.lg,
    padding: Spacing.md,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
  },
  interestText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionHintText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  postedDate: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: Spacing.md,
  },
  cancellationBanner: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.xs,
  },
  cancellationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cancellationLabel: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  refundLabel: {
    fontSize: 13,
    fontWeight: '500',
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
    marginBottom: Spacing.xl,
  },
  postButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
  },
  postButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  moreButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    padding: Spacing.xs,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  optionsModal: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  closeModalButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  closeModalText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
