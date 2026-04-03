import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { supabase, Job } from '../../lib/supabase';
import { STATUS_COLORS, STATUS_LABELS } from './jobs.helpers';

export default function AdminJobsScreen() {
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchJobs();
  };

  const renderJob = ({ item }: { item: Job }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobId}>#{item.id.slice(0, 8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
          <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>

      <Text style={styles.category}>{item.category}</Text>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{item.name}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{item.area}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{item.timing}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      <Text style={styles.title}>All Jobs</Text>
      <Text style={styles.subtitle}>{jobs.length} total jobs</Text>

      <FlatList
        data={jobs}
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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No jobs found</Text>
          </View>
        }
      />
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
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  listContent: {
    paddingBottom: Spacing.xxl * 2,
  },
  jobCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  jobId: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'SpaceMono',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  category: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: '45%',
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: Spacing.md,
  },
});
