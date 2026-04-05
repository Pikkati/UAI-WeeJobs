import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
// eslint-disable-next-line import/no-unresolved
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

type Stats = {
  totalJobs: number;
  openJobs: number;
  bookedJobs: number;
  completedJobs: number;
  totalUsers: number;
  customers: number;
  tradies: number;
};

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const [jobsRes, usersRes] = await Promise.all([
        supabase.from('jobs').select('status'),
        supabase.from('users').select('role'),
      ]);

      if (jobsRes.error) {
        // Allow require here to lazily load Sentry in environments where it's unavailable
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        const sentry = require('../../lib/sentry');
        sentry.captureException?.(jobsRes.error);
        throw jobsRes.error;
      }
      if (usersRes.error) {
        // Allow require here to lazily load Sentry in environments where it's unavailable
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        const sentry = require('../../lib/sentry');
        sentry.captureException?.(usersRes.error);
        throw usersRes.error;
      }

      const jobs = jobsRes.data || [];
      const users = usersRes.data || [];

      setStats({
        totalJobs: jobs.length,
        openJobs: jobs.filter((j) => j.status === 'open').length,
        bookedJobs: jobs.filter((j) => j.status === 'booked').length,
        completedJobs: jobs.filter((j) => j.status === 'completed').length,
        totalUsers: users.length,
        customers: users.filter((u) => u.role === 'customer').length,
        tradies: users.filter((u) => u.role === 'tradesperson').length,
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const sentry = require('../../lib/sentry');
      sentry.captureException?.(error);
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.md },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={Colors.accent}
        />
      }
    >
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/weejobs-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.title}>Admin Dashboard</Text>
      </View>

      <Text style={styles.sectionTitle}>Job Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="briefcase" size={28} color={Colors.accent} />
          <Text style={styles.statNumber}>{stats?.totalJobs || 0}</Text>
          <Text style={styles.statLabel}>Total Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={28} color={Colors.warning} />
          <Text style={styles.statNumber}>{stats?.openJobs || 0}</Text>
          <Text style={styles.statLabel}>Open</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
          <Text style={styles.statNumber}>{stats?.bookedJobs || 0}</Text>
          <Text style={styles.statLabel}>Booked</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={28} color={Colors.textSecondary} />
          <Text style={styles.statNumber}>{stats?.completedJobs || 0}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>User Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={28} color={Colors.accent} />
          <Text style={styles.statNumber}>{stats?.totalUsers || 0}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="home" size={28} color={Colors.accent} />
          <Text style={styles.statNumber}>{stats?.customers || 0}</Text>
          <Text style={styles.statLabel}>Customers</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="hammer" size={28} color={Colors.accent} />
          <Text style={styles.statNumber}>{stats?.tradies || 0}</Text>
          <Text style={styles.statLabel}>Tradies</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color={Colors.accent} />
        <Text style={styles.infoText}>
          This is a lightweight admin dashboard for the WeeJobs MVP. Full admin
          functionality will be added in future updates.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl * 2,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 150,
    height: 50,
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '800',
    marginTop: Spacing.sm,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
