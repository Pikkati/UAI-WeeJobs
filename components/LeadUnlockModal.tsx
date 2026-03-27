import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// eslint-disable-next-line import/no-unresolved
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { Job, supabase } from '../lib/supabase';
import { CATEGORY_ICONS } from '../constants/data';
import VerifiedProBadge from './VerifiedProBadge';

const REPORT_REASONS = [
  'Fake or suspicious job',
  'Spam or misleading content',
  'Inappropriate content',
  'Already filled / not available',
  'Other',
];

// width was unused here; removed to satisfy lint

interface LeadUnlockModalProps {
  job: Job | null;
  visible: boolean;
  onUnlock: () => void;
  onCancel: () => void;
  isPro?: boolean;
  unlockPrice?: number;
  tradieId?: string;
}

export default function LeadUnlockModal({
  job,
  visible,
  onUnlock,
  onCancel,
  isPro = false,
  unlockPrice = 3,
  tradieId,
}: LeadUnlockModalProps) {
  const _insets = useSafeAreaInsets();
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleReport = async () => {
    if (!reportReason || !job || !tradieId) return;
    setIsSubmittingReport(true);
    try {
      const { error } = await supabase.from('job_reports').insert({
        job_id: job.id,
        tradie_id: tradieId,
        reason: reportReason,
      });
      if (error) throw error;
      setIsReporting(false);
      setReportReason('');
      Alert.alert('Report Submitted', 'Thank you for reporting this job. We will review it shortly.');
    } catch (err) {
      console.error('Report submission error:', err);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (!job) return null;

  if (isPro) {
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={[styles.proContainer, { paddingBottom: _insets.bottom + Spacing.lg }]}>
            <VerifiedProBadge size="large" />
            <Text style={styles.proTitle}>PRO Member Benefit</Text>
            <Text style={styles.proText}>
              Jobs are automatically unlocked for PRO subscribers.{'\n'}
              No unlock fees required!
            </Text>
            <TouchableOpacity style={styles.proButton} onPress={onUnlock}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.background} />
              <Text style={styles.proButtonText}>Accept Job</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingBottom: _insets.bottom + Spacing.lg }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={(CATEGORY_ICONS[job.category] || 'build') as any}
                size={28}
                color={Colors.accent}
              />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Unlock this job for £{unlockPrice}</Text>
              <Text style={styles.category}>{job.category}</Text>
            </View>
          </View>

          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Job Preview</Text>
            
            <View style={styles.previewRow}>
              <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.previewText}>{job.area}</Text>
            </View>
            
            <View style={styles.previewRow}>
              <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.previewText}>{job.timing}</Text>
            </View>
            
            {job.budget && (
              <View style={styles.previewRow}>
                <Ionicons name="cash-outline" size={16} color={Colors.accent} />
                <Text style={[styles.previewText, styles.budgetText]}>{job.budget}</Text>
              </View>
            )}

            {job.description && (
              <Text style={styles.description} numberOfLines={2}>
                {job.description}
              </Text>
            )}

            {job.photos && job.photos.length > 0 && (
              <View style={styles.photoPreview}>
                {job.photos.slice(0, 3).map((photo, index) => (
                  <View key={index} style={styles.photoThumb}>
                    <Image source={{ uri: photo }} style={styles.photoImage} contentFit="cover" />
                    {index === 2 && job.photos!.length > 3 && (
                      <View style={styles.photoOverlay}>
                        <Text style={styles.photoOverlayText}>+{job.photos!.length - 3}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={Colors.accent} />
            <Text style={styles.infoText}>
              Unlocking reveals full contact details and lets you message the customer.
            </Text>
          </View>

          {isReporting ? (
            <View style={styles.reportContainer}>
              <Text style={styles.reportTitle}>Why are you reporting this job?</Text>
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonOption, reportReason === reason && styles.reasonOptionSelected]}
                  onPress={() => setReportReason(reason)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.reasonRadio, reportReason === reason && styles.reasonRadioSelected]}>
                    {reportReason === reason && <View style={styles.reasonRadioDot} />}
                  </View>
                  <Text style={[styles.reasonText, reportReason === reason && styles.reasonTextSelected]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
              <View style={styles.reportButtons}>
                <TouchableOpacity
                  style={[styles.submitReportButton, !reportReason && styles.submitReportButtonDisabled]}
                  onPress={handleReport}
                  disabled={!reportReason || isSubmittingReport}
                  activeOpacity={0.8}
                >
                  {isSubmittingReport ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.submitReportButtonText}>Submit Report</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => { setIsReporting(false); setReportReason(''); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.buttons}>
                <TouchableOpacity
                  style={styles.unlockButton}
                  onPress={onUnlock}
                  activeOpacity={0.8}
                >
                  <Ionicons name="lock-open" size={22} color={Colors.background} />
                  <Text style={styles.unlockButtonText}>Unlock for £{unlockPrice}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                {tradieId && (
                  <TouchableOpacity
                    style={styles.reportButton}
                    onPress={() => setIsReporting(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="flag-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.reportButtonText}>Report this job</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.upgradeHint}>
                Go PRO for unlimited free unlocks
              </Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 2,
  },
  category: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  previewLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  previewText: {
    color: Colors.white,
    fontSize: 14,
  },
  budgetText: {
    color: Colors.accent,
    fontWeight: '600',
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  photoPreview: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  photoThumb: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlayText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  infoText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  buttons: {
    gap: Spacing.sm,
  },
  unlockButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.full,
  },
  unlockButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeHint: {
    textAlign: 'center',
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '500',
    marginTop: Spacing.md,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
  },
  reportButtonText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  reportContainer: {
    gap: Spacing.sm,
  },
  reportTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reasonOptionSelected: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  reasonRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonRadioSelected: {
    borderColor: Colors.accent,
  },
  reasonRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  reasonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  reasonTextSelected: {
    color: Colors.white,
  },
  reportButtons: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  submitReportButton: {
    backgroundColor: Colors.error,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitReportButtonDisabled: {
    opacity: 0.5,
  },
  submitReportButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  proContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    alignItems: 'center',
  },
  proTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  proText: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  proButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl * 2,
    borderRadius: BorderRadius.full,
  },
  proButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
