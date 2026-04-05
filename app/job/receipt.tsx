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

export default function ReceiptScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jobs } = useJobs();

  const job = jobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  const depositPaid = job.deposit_amount || 0;
  const finalPayment = job.final_payment_amount || 0;
  const total = depositPaid + finalPayment;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="close" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receipt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
        </View>

        <Text style={styles.successTitle}>Payment Complete!</Text>
        <Text style={styles.successSubtitle}>Thank you for using WeeJobs</Text>

        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptTitle}>WeeJobs Receipt</Text>
            <Text style={styles.receiptDate}>
              {new Date().toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.receiptDivider} />

          <View style={styles.receiptSection}>
            <Text style={styles.receiptLabel}>Job Reference</Text>
            <Text style={styles.receiptValue}>
              {job.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>

          <View style={styles.receiptSection}>
            <Text style={styles.receiptLabel}>Category</Text>
            <Text style={styles.receiptValue}>{job.category}</Text>
          </View>

          <View style={styles.receiptSection}>
            <Text style={styles.receiptLabel}>Location</Text>
            <Text style={styles.receiptValue}>{job.area}</Text>
          </View>

          <View style={styles.receiptDivider} />

          <View style={styles.receiptRow}>
            <Text style={styles.receiptItemLabel}>Deposit</Text>
            <Text style={styles.receiptItemValue}>
              £{depositPaid.toFixed(2)}
            </Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptItemLabel}>Final Payment</Text>
            <Text style={styles.receiptItemValue}>
              £{finalPayment.toFixed(2)}
            </Text>
          </View>

          <View style={styles.receiptDivider} />

          <View style={styles.receiptRow}>
            <Text style={styles.receiptTotalLabel}>Total Paid</Text>
            <Text style={styles.receiptTotalValue}>£{total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.nextSteps}>
          <Ionicons name="information-circle" size={20} color={Colors.accent} />
          <Text style={styles.nextStepsText}>
            Once the tradesperson confirms the job is complete, you&apos;ll
            receive a notification to leave a review.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}
      >
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push('/customer')}
        >
          <Ionicons name="home" size={20} color={Colors.background} />
          <Text style={styles.homeButtonText}>Back to Home</Text>
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
  successIcon: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  successTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  receiptCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  receiptTitle: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: '800',
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
  },
  receiptDate: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  receiptSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  receiptLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  receiptValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  receiptItemLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  receiptItemValue: {
    color: Colors.white,
    fontSize: 14,
  },
  receiptTotalLabel: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  receiptTotalValue: {
    color: Colors.accent,
    fontSize: 20,
    fontWeight: '800',
  },
  nextSteps: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  nextStepsText: {
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
  homeButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  homeButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
