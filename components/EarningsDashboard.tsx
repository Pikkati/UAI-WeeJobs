import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  jobsCompleted: number;
  averageRating: number;
  weeklyEarnings: number[];
  recentJobs: Array<{
    id: string;
    date: string;
    amount: number;
    category: string;
    rating: number;
  }>;
}

export default function EarningsDashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [earningsData, setEarningsData] = useState<EarningsData>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    jobsCompleted: 0,
    averageRating: 0,
    weeklyEarnings: [0, 0, 0, 0, 0, 0, 0],
    recentJobs: []
  });

  useEffect(() => {
    fetchEarningsData();
  }, [timeframe]);

  const fetchEarningsData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Mock data for demonstration - replace with actual Supabase queries
      const mockData: EarningsData = {
        totalEarnings: 12450,
        monthlyEarnings: 2850,
        jobsCompleted: 47,
        averageRating: 4.8,
        weeklyEarnings: [320, 450, 380, 520, 290, 410, 480],
        recentJobs: [
          { id: '1', date: '2024-01-15', amount: 180, category: 'Plumbing', rating: 5.0 },
          { id: '2', date: '2024-01-14', amount: 120, category: 'Electrical', rating: 4.8 },
          { id: '3', date: '2024-01-12', amount: 95, category: 'Carpentry', rating: 4.9 },
          { id: '4', date: '2024-01-10', amount: 145, category: 'Painting', rating: 4.7 },
          { id: '5', date: '2024-01-08', amount: 210, category: 'Tiling', rating: 5.0 },
        ]
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setEarningsData(mockData);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Loading earnings data...</Text>
      </View>
    );
  }

  const maxWeeklyEarning = Math.max(...earningsData.weeklyEarnings);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Earnings</Text>
          <Text style={styles.headerSubtitle}>Track your income and performance</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        {(['week', 'month', 'year'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.timeframeButton,
              timeframe === period && styles.timeframeButtonActive
            ]}
            onPress={() => setTimeframe(period)}
          >
            <Text style={[
              styles.timeframeText,
              timeframe === period && styles.timeframeTextActive
            ]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="wallet" size={24} color={Colors.success} />
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
          <Text style={styles.statValue}>${earningsData.totalEarnings.toLocaleString()}</Text>
          <Text style={styles.statChange}>+12% from last month</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="calendar" size={24} color={Colors.accent} />
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <Text style={styles.statValue}>${earningsData.monthlyEarnings.toLocaleString()}</Text>
          <Text style={styles.statChange}>+8% from December</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.warning} />
            <Text style={styles.statLabel}>Jobs Completed</Text>
          </View>
          <Text style={styles.statValue}>{earningsData.jobsCompleted}</Text>
          <Text style={styles.statChange}>+5 from last month</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="star" size={24} color={Colors.warning} />
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <Text style={styles.statValue}>{earningsData.averageRating.toFixed(1)}</Text>
          <Text style={styles.statChange}>⭐ Excellent</Text>
        </View>
      </View>

      {/* Weekly Earnings Chart */}
      <View style={styles.chartSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly Earnings</Text>
          <Text style={styles.sectionSubtitle}>This week vs last week</Text>
        </View>
        
        <View style={styles.chartContainer}>
          <View style={styles.chart}>
            {earningsData.weeklyEarnings.map((earning, index) => (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.chartBarContainer}>
                  <View 
                    style={[
                      styles.chartBar, 
                      { 
                        height: `${(earning / maxWeeklyEarning) * 100}%`,
                        backgroundColor: earning === maxWeeklyEarning ? Colors.accent : Colors.accent + '60'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.chartLabel}>{weekDays[index]}</Text>
                <Text style={styles.chartValue}>${earning}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Recent Jobs */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Jobs</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {earningsData.recentJobs.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobInfo}>
              <View style={styles.jobMeta}>
                <Text style={styles.jobCategory}>{job.category}</Text>
                <View style={styles.jobRating}>
                  <Ionicons name="star" size={14} color={Colors.warning} />
                  <Text style={styles.jobRatingText}>{job.rating}</Text>
                </View>
              </View>
              <Text style={styles.jobDate}>
                {new Date(job.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            <Text style={styles.jobAmount}>+${job.amount}</Text>
          </View>
        ))}
      </View>

      {/* Performance Insights */}
      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>Performance Insights</Text>
        
        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Ionicons name="trending-up" size={20} color={Colors.success} />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Strong Week Ahead</Text>
            <Text style={styles.insightText}>
              You have 8 job leads this week. Your acceptance rate is 85%, keep it up!
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Ionicons name="star-outline" size={20} color={Colors.warning} />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Customer Feedback</Text>
            <Text style={styles.insightText}>
              Your ratings are excellent! Customers love your prompt communication.
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Ionicons name="time" size={20} color={Colors.accent} />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Peak Hours</Text>
            <Text style={styles.insightText}>
              Most of your jobs are booked between 9 AM - 3 PM on weekdays.
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: Spacing.md,
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
  settingsButton: {
    padding: Spacing.sm,
  },

  // Timeframe
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: Colors.accent,
  },
  timeframeText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  timeframeTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: (width - Spacing.xl * 2 - Spacing.md) / 2,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  statValue: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statChange: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '500',
  },

  // Chart Section
  chartSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  viewAllText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    paddingHorizontal: Spacing.xl,
  },
  chart: {
    flexDirection: 'row',
    height: 120,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarContainer: {
    flex: 1,
    width: '80%',
    justifyContent: 'flex-end',
    marginBottom: Spacing.xs,
  },
  chartBar: {
    width: '100%',
    borderRadius: 2,
    minHeight: 4,
  },
  chartLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  chartValue: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: '600',
  },

  // Recent Jobs
  recentSection: {
    marginBottom: Spacing.xl,
  },
  jobCard: {
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
  jobInfo: {
    flex: 1,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  jobCategory: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  jobRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  jobRatingText: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: '500',
  },
  jobDate: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  jobAmount: {
    color: Colors.success,
    fontSize: 16,
    fontWeight: '700',
  },

  // Insights
  insightsSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  insightIcon: {
    width: 36,
    height: 36,
    backgroundColor: Colors.accent + '20',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
});