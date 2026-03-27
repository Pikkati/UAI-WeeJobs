import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useJobs } from '../../context/JobsContext';
import { useAuth } from '../../context/AuthContext';

type Mode = 'quote' | 'estimate' | 'invoice';

export default function SendQuoteScreen() {
  const { jobId, mode: modeParam } = useLocalSearchParams<{ jobId: string; mode?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jobs, sendQuote, sendEstimate, sendInvoice } = useJobs();
  const { user } = useAuth();
  
  const job = jobs.find(j => j.id === jobId);
  const isHourly = job?.pricing_type === 'hourly';
  
  const mode: Mode = useMemo(() => {
    if (modeParam === 'estimate') return 'estimate';
    if (modeParam === 'invoice') return 'invoice';
    if (isHourly) {
      return job?.status === 'in_progress' ? 'invoice' : 'estimate';
    }
    return 'quote';
  }, [modeParam, isHourly, job?.status]);

  const [hours, setHours] = useState(job?.estimate_hours?.toString() || '');
  const [hourlyRate, setHourlyRate] = useState(
    job?.estimate_hourly_rate?.toString() || user?.hourly_rate?.toString() || ''
  );
  const [labour, setLabour] = useState('');
  const [materials, setMaterials] = useState(
    job?.estimate_materials?.toString() || ''
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hoursAmount = parseFloat(hours) || 0;
  const hourlyRateAmount = parseFloat(hourlyRate) || 0;
  const labourAmount = mode === 'quote' 
    ? (parseFloat(labour) || 0) 
    : hoursAmount * hourlyRateAmount;
  const materialsAmount = parseFloat(materials) || 0;
  const total = labourAmount + materialsAmount;

  const estimateTotal = job?.estimate_total || 0;
  const variance = mode === 'invoice' && estimateTotal > 0 
    ? ((total - estimateTotal) / estimateTotal) * 100 
    : 0;
  const hasHighVariance = Math.abs(variance) > 20;

  const getTitle = () => {
    switch (mode) {
      case 'estimate': return 'Send Estimate';
      case 'invoice': return 'Send Invoice';
      default: return 'Send Quote';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'estimate':
        return 'Provide a provisional estimate. The final invoice may differ based on actual work done.';
      case 'invoice':
        return 'Submit your final invoice for the completed work.';
      default:
        return 'Submit a fixed price quote. The customer will approve before you start work.';
    }
  };

  const handleSubmit = async () => {
    if (total <= 0) {
      Alert.alert('Invalid Amount', 'Please enter valid costs.');
      return;
    }

    if (mode === 'invoice' && hasHighVariance) {
      Alert.alert(
        'High Variance Warning',
        `Your invoice is ${variance > 0 ? 'higher' : 'lower'} than the estimate by ${Math.abs(variance).toFixed(0)}%. Are you sure you want to send this invoice?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send Anyway', onPress: () => submitForm() }
        ]
      );
      return;
    }

    submitForm();
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      let success = false;

      switch (mode) {
        case 'estimate':
          success = await sendEstimate(jobId!, {
            hours: hoursAmount,
            hourlyRate: hourlyRateAmount,
            materials: materialsAmount,
            notes: notes || undefined,
            total,
          });
          if (success) {
            Alert.alert(
              'Estimate Sent!',
              'The customer will review your estimate and acknowledge it before you proceed.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          }
          break;

        case 'invoice':
          success = await sendInvoice(jobId!, {
            hours: hoursAmount,
            hourlyRate: hourlyRateAmount,
            materials: materialsAmount,
            notes: notes || undefined,
            total,
          });
          if (success) {
            Alert.alert(
              'Invoice Sent!',
              'The customer will review and pay your invoice.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          }
          break;

        default:
          success = await sendQuote(jobId!, {
            labour: labourAmount,
            materials: materialsAmount,
            notes: notes || undefined,
            total,
          });
          if (success) {
            Alert.alert(
              'Quote Sent!',
              'The customer will review your quote and approve or request changes.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          }
          break;
      }

      if (!success) {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Send quote error:', error);
      Alert.alert('Error', `Failed to send ${mode}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.jobInfo}>
          <View style={styles.modeBadge}>
            <Ionicons 
              name={mode === 'quote' ? 'document-text' : mode === 'estimate' ? 'calculator' : 'receipt'} 
              size={16} 
              color={Colors.background} 
            />
            <Text style={styles.modeBadgeText}>
              {mode === 'quote' ? 'Fixed Price' : 'Hourly Rate'}
            </Text>
          </View>
          <Text style={styles.jobCategory}>{job.category}</Text>
          <Text style={styles.jobArea}>{job.area}</Text>
          <Text style={styles.description}>{getDescription()}</Text>
        </View>

        <View style={styles.form}>
          {mode === 'quote' ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Labour Cost</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>£</Text>
                <TextInput
                  style={styles.input}
                  value={labour}
                  onChangeText={setLabour}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {mode === 'estimate' ? 'Estimated Hours' : 'Actual Hours Worked'}
                </Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="time-outline" size={20} color={Colors.accent} style={{ marginLeft: Spacing.md }} />
                  <TextInput
                    style={styles.input}
                    value={hours}
                    onChangeText={setHours}
                    placeholder="0"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.unitLabel}>hours</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hourly Rate</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencySymbol}>£</Text>
                  <TextInput
                    style={styles.input}
                    value={hourlyRate}
                    onChangeText={setHourlyRate}
                    placeholder="0.00"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.unitLabel}>/hour</Text>
                </View>
              </View>

              <View style={styles.labourCalc}>
                <Text style={styles.labourCalcText}>
                  Labour: {hoursAmount} hrs x £{hourlyRateAmount.toFixed(2)} = £{labourAmount.toFixed(2)}
                </Text>
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Materials Cost</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>£</Text>
              <TextInput
                style={styles.input}
                value={materials}
                onChangeText={setMaterials}
                placeholder="0.00"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder={mode === 'invoice' 
                ? "Describe the work completed..." 
                : "Add any notes about the work..."}
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>
            {mode === 'estimate' ? 'Estimated Total' : mode === 'invoice' ? 'Invoice Total' : 'Quote Total'}
          </Text>
          <Text style={styles.totalAmount}>£{total.toFixed(2)}</Text>
        </View>

        {mode === 'invoice' && estimateTotal > 0 && (
          <View style={[styles.varianceContainer, hasHighVariance && styles.varianceWarning]}>
            <Ionicons 
              name={hasHighVariance ? 'warning' : 'information-circle'} 
              size={20} 
              color={hasHighVariance ? Colors.warning : Colors.textSecondary} 
            />
            <View style={styles.varianceText}>
              <Text style={styles.varianceLabel}>Original Estimate: £{estimateTotal.toFixed(2)}</Text>
              <Text style={[styles.varianceValue, hasHighVariance && styles.varianceValueWarning]}>
                {variance > 0 ? '+' : ''}{variance.toFixed(0)}% from estimate
              </Text>
            </View>
          </View>
        )}

        <View style={styles.breakdown}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Labour</Text>
            <Text style={styles.breakdownValue}>£{labourAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Materials</Text>
            <Text style={styles.breakdownValue}>£{materialsAmount.toFixed(2)}</Text>
          </View>
          {mode !== 'estimate' && job.deposit_paid && job.deposit_amount && (
            <>
              <View style={styles.divider} />
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Deposit already paid</Text>
                <Text style={[styles.breakdownValue, styles.depositValue]}>
                  -£{job.deposit_amount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabelBold}>Remaining balance</Text>
                <Text style={styles.breakdownValueBold}>
                  £{Math.max(0, total - job.deposit_amount).toFixed(2)}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <TouchableOpacity 
          style={[styles.sendButton, total <= 0 && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={total <= 0 || isSubmitting}
        >
          <Ionicons name="send" size={20} color={Colors.background} />
          <Text style={styles.sendButtonText}>
            {isSubmitting ? 'Sending...' : `Send ${mode === 'quote' ? 'Quote' : mode === 'estimate' ? 'Estimate' : 'Invoice'}`}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  jobInfo: {
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  modeBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  jobCategory: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  jobArea: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  form: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currencySymbol: {
    color: Colors.accent,
    fontSize: 20,
    fontWeight: '700',
    paddingLeft: Spacing.md,
  },
  unitLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    paddingRight: Spacing.md,
  },
  input: {
    flex: 1,
    padding: Spacing.md,
    color: Colors.white,
    fontSize: 18,
  },
  textArea: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 100,
    padding: Spacing.md,
    fontSize: 16,
  },
  labourCalc: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  labourCalcText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  totalContainer: {
    backgroundColor: Colors.accent,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  totalLabel: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  totalAmount: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: '800',
  },
  varianceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  varianceWarning: {
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  varianceText: {
    flex: 1,
  },
  varianceLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  varianceValue: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  varianceValueWarning: {
    color: Colors.warning,
  },
  breakdown: {
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  breakdownLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  breakdownLabelBold: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownValue: {
    color: Colors.white,
    fontSize: 14,
  },
  breakdownValueBold: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  depositValue: {
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
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
  sendButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
