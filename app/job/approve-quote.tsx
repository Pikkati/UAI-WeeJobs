import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useJobs } from '../../context/JobsContext';

type Mode = 'quote' | 'estimate';

export default function ApproveQuoteScreen() {
  const { jobId, mode: modeParam } = useLocalSearchParams<{
    jobId: string;
    mode?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jobs, approveQuote, acknowledgeEstimate } = useJobs();

  const [isApproving, setIsApproving] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [changeMessage, setChangeMessage] = useState('');

  const job = jobs.find((j) => j.id === jobId);
  const isHourly = job?.pricing_type === 'hourly';

  const mode: Mode = useMemo(() => {
    if (modeParam === 'estimate') return 'estimate';
    return isHourly ? 'estimate' : 'quote';
  }, [modeParam, isHourly]);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      let success = false;

      if (mode === 'estimate') {
        success = await acknowledgeEstimate(jobId!);
        if (success) {
          Alert.alert(
            'Estimate Acknowledged!',
            "The tradesperson will now proceed with the work. You'll receive an invoice once the job is complete.",
            [
              {
                text: 'OK',
                onPress: () => router.push(`/job/tracking?jobId=${jobId}`),
              },
            ],
          );
        }
      } else {
        success = await approveQuote(jobId!);
        if (success) {
          router.push(`/job/pay-final?jobId=${jobId}`);
        }
      }

      if (!success) {
        throw new Error('Failed to approve');
      }
    } catch (error) {
      console.error('Approve quote error:', error);
      Alert.alert(
        'Error',
        `Failed to ${mode === 'estimate' ? 'acknowledge estimate' : 'approve quote'}. Please try again.`,
      );
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestChange = () => {
    setShowMessageModal(true);
  };

  const sendChangeRequest = () => {
    const trimmedMessage = changeMessage.trim();
    if (!trimmedMessage) {
      Alert.alert(
        'Add a message',
        'Please explain what changes you would like.',
      );
      return;
    }

    setShowMessageModal(false);
    setChangeMessage('');
    router.push({
      pathname: '/chat/[jobId]',
      params: {
        jobId,
        recipientName: 'Tradesperson',
        jobCategory: job?.category ?? '',
        initialMessage: trimmedMessage,
      },
    });
  };

  if (!job) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  const depositPaid = job.deposit_amount || 0;

  const labourAmount =
    mode === 'estimate'
      ? (job.estimate_hours || 0) * (job.estimate_hourly_rate || 0)
      : job.quote_labour || 0;
  const materialsAmount =
    mode === 'estimate'
      ? job.estimate_materials || 0
      : job.quote_materials || 0;
  const total =
    mode === 'estimate' ? job.estimate_total || 0 : job.quote_total || 0;
  const notes = mode === 'estimate' ? job.estimate_notes : job.quote_notes;

  const remainingBalance = Math.max(0, total - depositPaid);

  const getTitle = () =>
    mode === 'estimate' ? 'Review Estimate' : 'Review Quote';
  const getCardTitle = () =>
    mode === 'estimate' ? 'Provisional Estimate' : 'Quote from Tradesperson';
  const getApproveButtonText = () =>
    mode === 'estimate' ? 'Acknowledge Estimate' : 'Approve Quote';
  const getInfoText = () =>
    mode === 'estimate'
      ? `This is a provisional estimate. The final invoice may vary based on actual work done. You&apos;ll pay after the job is complete.`
      : `By approving this quote, you agree to pay the remaining balance of £${remainingBalance.toFixed(2)} once the work is complete.`;

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
        <View style={styles.quoteCard}>
          <View style={styles.quoteHeader}>
            <Ionicons
              name={mode === 'estimate' ? 'calculator' : 'document-text'}
              size={32}
              color={Colors.accent}
            />
            <View>
              <Text style={styles.quoteTitle}>{getCardTitle()}</Text>
              {mode === 'estimate' && (
                <View style={styles.estimateBadge}>
                  <Text style={styles.estimateBadgeText}>Hourly Rate</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.quoteBreakdown}>
            {mode === 'estimate' && (
              <>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Estimated hours</Text>
                  <Text style={styles.breakdownValue}>
                    {job.estimate_hours || 0} hrs
                  </Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Hourly rate</Text>
                  <Text style={styles.breakdownValue}>
                    £{(job.estimate_hourly_rate || 0).toFixed(2)}/hr
                  </Text>
                </View>
              </>
            )}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Labour</Text>
              <Text style={styles.breakdownValue}>
                £{labourAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Materials</Text>
              <Text style={styles.breakdownValue}>
                £{materialsAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.totalLabel}>
                {mode === 'estimate' ? 'Estimated Total' : 'Total'}
              </Text>
              <Text style={styles.totalValue}>£{total.toFixed(2)}</Text>
            </View>
          </View>

          {notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes from tradesperson:</Text>
              <Text style={styles.notesText}>{notes}</Text>
            </View>
          )}
        </View>

        {mode === 'quote' && (
          <View style={styles.paymentSummary}>
            <Text style={styles.summaryTitle}>Payment Summary</Text>

            <View style={styles.summaryRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.success}
              />
              <Text style={styles.summaryLabel}>Deposit paid</Text>
              <Text style={[styles.summaryValue, styles.paidValue]}>
                £{depositPaid.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Ionicons name="time" size={20} color={Colors.accent} />
              <Text style={styles.summaryLabel}>Remaining balance</Text>
              <Text style={styles.summaryValue}>
                £{remainingBalance.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        <View
          style={[
            styles.infoBox,
            mode === 'estimate' && styles.infoBoxEstimate,
          ]}
        >
          <Ionicons
            name={
              mode === 'estimate' ? 'information-circle' : 'information-circle'
            }
            size={20}
            color={mode === 'estimate' ? Colors.info : Colors.accent}
          />
          <Text style={styles.infoText}>{getInfoText()}</Text>
        </View>

        {mode === 'estimate' && (
          <View style={styles.estimateNote}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={Colors.textSecondary}
            />
            <Text style={styles.estimateNoteText}>
              Final cost will be based on actual time and materials. You&apos;ll
              review the invoice before paying.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}
      >
        <TouchableOpacity
          style={styles.approveButton}
          onPress={handleApprove}
          disabled={isApproving}
        >
          <Ionicons
            name="checkmark-circle"
            size={22}
            color={Colors.background}
          />
          <Text style={styles.approveButtonText}>
            {isApproving ? 'Processing...' : getApproveButtonText()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.changeButton}
          onPress={handleRequestChange}
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={20}
            color={Colors.accent}
          />
          <Text style={styles.changeButtonText}>Request Change</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showMessageModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { paddingBottom: insets.bottom + Spacing.lg },
            ]}
          >
            <Text style={styles.modalTitle}>
              Request {mode === 'estimate' ? 'Estimate' : 'Quote'} Change
            </Text>
            <TextInput
              style={styles.messageInput}
              value={changeMessage}
              onChangeText={setChangeMessage}
              placeholder="Explain what changes you'd like..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowMessageModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSendButton}
                onPress={sendChangeRequest}
              >
                <Text style={styles.modalSendText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  quoteCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  quoteTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  estimateBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: 4,
  },
  estimateBadgeText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  quoteBreakdown: {
    gap: Spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  breakdownValue: {
    color: Colors.white,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: '800',
  },
  notesSection: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  notesLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  notesText: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 20,
  },
  paymentSummary: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  paidValue: {
    color: Colors.success,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  infoBoxEstimate: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  infoText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  estimateNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  estimateNoteText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
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
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  approveButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  approveButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  changeButtonText: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  messageInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.white,
    fontSize: 16,
    minHeight: 100,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalSendButton: {
    flex: 2,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
  },
  modalSendText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
