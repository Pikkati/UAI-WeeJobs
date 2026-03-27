import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

interface StripeCheckoutStubProps {
  visible: boolean;
  amount: number;
  description: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripeCheckoutStub({
  visible,
  amount,
  description,
  onSuccess,
  onCancel,
}: StripeCheckoutStubProps) {
  const insets = useSafeAreaInsets();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    onSuccess();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.stripeLogoContainer}>
              <Text style={styles.stripeLogo}>stripe</Text>
            </View>
            <Text style={styles.headerTitle}>Simulated Checkout</Text>
            <Text style={styles.headerSubtitle}>Test Environment</Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>{description}</Text>
            <Text style={styles.amount}>£{amount.toFixed(2)}</Text>
          </View>

          <View style={styles.cardPreview}>
            <Ionicons name="card" size={24} color={Colors.textSecondary} />
            <Text style={styles.cardText}>**** **** **** 4242</Text>
            <Text style={styles.cardExpiry}>12/25</Text>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={Colors.accent} />
            <Text style={styles.infoText}>
              This is a simulated payment for testing purposes. No real charge will be made.
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.payButton, isProcessing && styles.payButtonDisabled]} 
            onPress={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <>
                <Ionicons name="lock-closed" size={20} color={Colors.background} />
                <Text style={styles.payButtonText}>Pay £{amount.toFixed(2)}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isProcessing}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Ionicons name="lock-closed" size={12} color={Colors.textSecondary} />
            <Text style={styles.footerText}>Secured by Stripe</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
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
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  stripeLogoContainer: {
    backgroundColor: '#635bff',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  stripeLogo: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  amountLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  amount: {
    color: Colors.white,
    fontSize: 48,
    fontWeight: '800',
  },
  cardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  cardText: {
    color: Colors.white,
    fontSize: 16,
    marginLeft: Spacing.md,
    flex: 1,
    fontFamily: 'monospace',
  },
  cardExpiry: {
    color: Colors.textSecondary,
    fontSize: 14,
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
  payButton: {
    backgroundColor: '#635bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
