import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useJobs } from '../../context/JobsContext';
import { supabase } from '../../lib/supabase';
import { useStripe } from '@stripe/stripe-react-native';

export default function PayDepositScreen() {
  const { jobId, tradieId } = useLocalSearchParams<{ jobId: string; tradieId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jobs, payDeposit, calculateDeposit } = useJobs();
  
  const [tradieName, setTradieName] = useState('Tradesperson');

  const job = jobs.find(j => j.id === jobId);
  const depositAmount = job ? calculateDeposit(job.budget || undefined) : 20;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    let isActive = true;

    const loadTradieName = async () => {
      if (!tradieId) {
        setTradieName('Tradesperson');
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('name')
        .eq('id', tradieId)
        .single();

      if (isActive) {
        setTradieName(data?.name || 'Tradesperson');
      }
    };

    loadTradieName();

    return () => {
      isActive = false;
    };
  }, [tradieId]);

  if (!job) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

const handlePayDeposit = async () => {
  try {
    if (!jobId) {
      Alert.alert('Error', 'Missing job ID');
      return;
    }

    const paymentData = await payDeposit(jobId);

    const { error: initError } = await initPaymentSheet({
      merchantDisplayName: paymentData.merchantDisplayName,
      customerId: paymentData.customer,
      customerEphemeralKeySecret: paymentData.ephemeralKey,
      paymentIntentClientSecret: paymentData.paymentIntent,
      allowsDelayedPaymentMethods: true,
    });

    if (initError) {
      Alert.alert('Error', initError.message);
      return;
    }

    const { error: paymentError } = await presentPaymentSheet();

    if (paymentError) {
      Alert.alert('Payment failed', paymentError.message);
      return;
    }

    Alert.alert(
      'Payment successful',
      `Deposit paid. Confirming booking with ${tradieName}...`,
      [{ text: 'OK' }]
    );

  } catch (err: any) {
    Alert.alert('Error', err.message || 'Something went wrong');
  }
};

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking?',
      'Are you sure you want to cancel? No payment will be taken.',
      [
        { text: 'No, Continue', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay Deposit</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tradieCard}>
          <View style={styles.tradieAvatar}>
            <Ionicons name="person" size={32} color={Colors.accent} />
          </View>
          <Text style={styles.bookingLabel}>Booking</Text>
          <Text style={styles.tradieName}>{tradieName}</Text>
          <Text style={styles.jobCategory}>{job.category} in {job.area}</Text>
        </View>

        <View style={styles.depositCard}>
          <Text style={styles.depositLabel}>Deposit Amount</Text>
          <Text style={styles.depositAmount}>£{depositAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.success} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Secure Your Booking</Text>
              <Text style={styles.infoText}>
                This deposit reserves {tradieName} for your job and helps prevent no-shows.
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={24} color={Colors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Deducted from Final Price</Text>
              <Text style={styles.infoText}>
                Your deposit will be deducted from the final quote amount.
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="chatbubbles-outline" size={24} color={Colors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Direct Communication</Text>
              <Text style={styles.infoText}>
                After payment, you can chat directly with your tradesperson.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>How deposits work</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Deposit (10% of budget, £10-£50)</Text>
            <Text style={styles.breakdownValue}>£{depositAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Remaining (after quote)</Text>
            <Text style={styles.breakdownValue}>TBC</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <TouchableOpacity style={styles.payButton} onPress={handlePayDeposit}>
          <Ionicons name="lock-closed" size={20} color={Colors.background} />
          <Text style={styles.payButtonText}>Pay £{depositAmount.toFixed(2)} Deposit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel Booking</Text>
        </TouchableOpacity>

        <View style={styles.stripeNote}>
          <Ionicons name="lock-closed" size={12} color={Colors.textSecondary} />
          <Text style={styles.stripeText}>Powered by</Text>
          <Text style={styles.stripeLogo}>stripe</Text>
        </View>
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
  tradieCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  tradieAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bookingLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  tradieName: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  jobCategory: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  depositCard: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  depositLabel: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  depositAmount: {
    color: Colors.white,
    fontSize: 48,
    fontWeight: '800',
  },
  infoSection: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  breakdown: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  breakdownTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  breakdownLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  breakdownValue: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '500',
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
    marginBottom: Spacing.sm,
  },
  payButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
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
