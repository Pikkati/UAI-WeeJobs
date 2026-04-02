import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  originalPrice?: number;
  description: string;
  popular?: boolean;
  bonus?: number;
}

interface CreditTransaction {
  id: string;
  type: 'earned' | 'spent' | 'purchased';
  amount: number;
  description: string;
  date: string;
  jobId?: string;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    credits: 10,
    price: 29.99,
    description: 'Perfect for trying out new jobs',
  },
  {
    id: 'popular',
    credits: 25,
    price: 69.99,
    originalPrice: 79.99,
    description: 'Most popular choice',
    popular: true,
    bonus: 3,
  },
  {
    id: 'pro',
    credits: 50,
    price: 129.99,
    originalPrice: 149.99,
    description: 'Best value for active tradies',
    bonus: 10,
  },
  {
    id: 'unlimited',
    credits: 100,
    price: 229.99,
    originalPrice: 299.99,
    description: 'Maximum credits, maximum opportunities',
    bonus: 25,
  },
];

export default function WeeBucksSystem() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [credits, setCredits] = useState(47);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([
    {
      id: '1',
      type: 'spent',
      amount: -3,
      description: 'Applied to Plumbing job in St Kilda',
      date: '2024-01-15T10:30:00Z',
      jobId: 'job123',
    },
    {
      id: '2',
      type: 'earned',
      amount: 5,
      description: 'Welcome bonus for new members',
      date: '2024-01-14T09:00:00Z',
    },
    {
      id: '3',
      type: 'purchased',
      amount: 25,
      description: 'Credit package purchase',
      date: '2024-01-13T14:20:00Z',
    },
    {
      id: '4',
      type: 'spent',
      amount: -3,
      description: 'Applied to Electrical job in Brighton',
      date: '2024-01-12T16:45:00Z',
      jobId: 'job124',
    },
    {
      id: '5',
      type: 'earned',
      amount: 2,
      description: 'Job completion bonus',
      date: '2024-01-11T12:15:00Z',
    },
  ]);
  const [fadeAnim] = useState(new Animated.Value(1));

  const handlePurchaseCredits = async (packageData: CreditPackage) => {
    try {
      // Simulate purchase process
      Alert.alert(
        'Purchase Credits',
        `Purchase ${packageData.credits}${packageData.bonus ? ` + ${packageData.bonus} bonus` : ''} WeeBucks for $${packageData.price}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Purchase',
            onPress: () => {
              // Simulate successful purchase
              const totalCredits = packageData.credits + (packageData.bonus || 0);
              setCredits((prev) => prev + totalCredits);
              
              // Add transaction
              const newTransaction: CreditTransaction = {
                id: Date.now().toString(),
                type: 'purchased',
                amount: totalCredits,
                description: `Credit package purchase (${packageData.description})`,
                date: new Date().toISOString(),
              };
              setTransactions((prev) => [newTransaction, ...prev]);
              
              setShowPurchaseModal(false);
              
              // Animate credit increase
              Animated.sequence([
                Animated.timing(fadeAnim, {
                  toValue: 1.5,
                  duration: 200,
                  useNativeDriver: false,
                }),
                Animated.timing(fadeAnim, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: false,
                }),
              ]).start();
              
              Alert.alert('Success!', `${totalCredits} WeeBucks have been added to your account!`);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Failed to purchase credits. Please try again.');
    }
  };

  const getTransactionIcon = (type: 'earned' | 'spent' | 'purchased') => {
    switch (type) {
      case 'earned':
        return 'gift';
      case 'spent':
        return 'briefcase';
      case 'purchased':
        return 'card';
    }
  };

  const getTransactionColor = (type: 'earned' | 'spent' | 'purchased') => {
    switch (type) {
      case 'earned':
        return Colors.success;
      case 'spent':
        return Colors.warning;
      case 'purchased':
        return Colors.accent;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>WeeBucks</Text>
          <Text style={styles.headerSubtitle}>Your job application credits</Text>
        </View>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Credits Display */}
      <View style={styles.creditsCard}>
        <View style={styles.creditsHeader}>
          <View style={styles.creditsIcon}>
            <Ionicons name="diamond" size={32} color={Colors.accent} />
          </View>
          <View style={styles.creditsInfo}>
            <Text style={styles.creditsLabel}>Available Credits</Text>
            <Animated.Text style={[styles.creditsAmount, { transform: [{ scale: fadeAnim }] }]}>
              {credits} WeeBucks
            </Animated.Text>
          </View>
        </View>
        
        <View style={styles.creditsActions}>
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={() => setShowPurchaseModal(true)}
          >
            <Ionicons name="add" size={20} color={Colors.background} />
            <Text style={styles.purchaseButtonText}>Buy More</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.earnButton}>
            <Ionicons name="gift-outline" size={18} color={Colors.accent} />
            <Text style={styles.earnButtonText}>Earn Free</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Usage Info */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>How WeeBucks Work</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="search" size={20} color={Colors.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Apply to Jobs</Text>
              <Text style={styles.infoDescription}>
                Use 3 WeeBucks to unlock and apply to premium jobs
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="star" size={20} color={Colors.warning} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Premium Features</Text>
              <Text style={styles.infoDescription}>
                Priority placement and advanced job matching
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="gift" size={20} color={Colors.success} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Earn More</Text>
              <Text style={styles.infoDescription}>
                Get bonus credits for job completions and referrals
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {transactions.slice(0, 5).map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionInfo}>
              <View style={[
                styles.transactionIcon,
                { backgroundColor: getTransactionColor(transaction.type) + '20' }
              ]}>
                <Ionicons
                  name={getTransactionIcon(transaction.type)}
                  size={18}
                  color={getTransactionColor(transaction.type)}
                />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
            <Text style={[
              styles.transactionAmount,
              { color: transaction.amount > 0 ? Colors.success : Colors.warning }
            ]}>
              {transaction.amount > 0 ? '+' : ''}{transaction.amount}
            </Text>
          </View>
        ))}
      </View>

      {/* Purchase Modal */}
      <Modal
        visible={showPurchaseModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPurchaseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Buy WeeBucks</Text>
              <TouchableOpacity
                onPress={() => setShowPurchaseModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} style={styles.packagesList}>
              {CREDIT_PACKAGES.map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={[styles.packageCard, pkg.popular && styles.popularPackage]}
                  onPress={() => handlePurchaseCredits(pkg)}
                >
                  {pkg.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                    </View>
                  )}
                  
                  <View style={styles.packageHeader}>
                    <View style={styles.packageCredits}>
                      <Text style={styles.packageCreditsAmount}>
                        {pkg.credits}
                        {pkg.bonus && (
                          <Text style={styles.bonusText}> +{pkg.bonus}</Text>
                        )}
                      </Text>
                      <Text style={styles.packageCreditsLabel}>WeeBucks</Text>
                    </View>
                    
                    <View style={styles.packagePrice}>
                      {pkg.originalPrice && (
                        <Text style={styles.originalPrice}>${pkg.originalPrice}</Text>
                      )}
                      <Text style={styles.currentPrice}>${pkg.price}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.packageDescription}>{pkg.description}</Text>
                  
                  {pkg.bonus && (
                    <View style={styles.bonusBadge}>
                      <Ionicons name="gift" size={14} color={Colors.success} />
                      <Text style={styles.bonusLabel}>+{pkg.bonus} Bonus Credits</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.modalFooterText}>
              • No subscription required • Credits never expire • Secure payment
            </Text>
          </View>
        </View>
      </Modal>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  infoButton: {
    padding: Spacing.sm,
  },

  // Credits Card
  creditsCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  creditsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  creditsIcon: {
    width: 56,
    height: 56,
    backgroundColor: Colors.accent + '20',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  creditsInfo: {
    flex: 1,
  },
  creditsLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  creditsAmount: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
  },
  creditsActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  purchaseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  purchaseButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  earnButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent + '20',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  earnButtonText: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },

  // Info Section
  infoSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: Colors.accent + '20',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
  },

  // Activity Section
  activitySection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  viewAllText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'right',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: Spacing.sm,
  },
  packagesList: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  packageCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  popularPackage: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: Spacing.lg,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  popularBadgeText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  packageCredits: {
    flex: 1,
  },
  packageCreditsAmount: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  bonusText: {
    color: Colors.success,
    fontSize: 20,
  },
  packageCreditsLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  packagePrice: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    color: Colors.textSecondary,
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  packageDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  bonusLabel: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  modalFooterText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    lineHeight: 16,
  },
});