import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useJobs } from '../../context/JobsContext';
import VerifiedProBadge from '../../components/VerifiedProBadge';
import { JobInterest } from '../../lib/supabase';

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <View style={styles.starContainer}>
      {[...Array(5)].map((_, i) => (
        <Ionicons
          key={i}
          name={i < fullStars ? 'star' : i === fullStars && hasHalfStar ? 'star-half' : 'star-outline'}
          size={14}
          color={Colors.accent}
        />
      ))}
    </View>
  );
}

export default function ChooseTradesmanScreen({ _testInterests }: { _testInterests?: JobInterest[] } = {}) {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fetchInterests, selectTradesman } = useJobs();

  const [interests, setInterests] = useState<JobInterest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSelecting, setIsSelecting] = useState<string | null>(null);

  

  useEffect(() => {
    // Allow tests to inject interests synchronously to avoid async timing issues
    if (_testInterests) {
      setInterests(Array.isArray(_testInterests) ? _testInterests : []);
      setIsLoading(false);
      return;
    }

    const loadInterests = async () => {
      setIsLoading(true);
      setLoadError(false);
      try {
        const data = await fetchInterests(jobId!);
        setInterests(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching interests:', error);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadInterests();
  }, [jobId, fetchInterests, _testInterests]);

  const handleSelectTradesman = async (tradieId: string) => {
    setIsSelecting(tradieId);
    try {
      const selectedInterest = interests.find(i => i.tradie_id === tradieId);
      const pricingType = selectedInterest?.tradie?.pricing_default ?? 'fixed';
      await selectTradesman(jobId!, tradieId, pricingType);
      router.push(`/job/pay-deposit?jobId=${jobId}&tradieId=${tradieId}`);
    } catch (error) {
      console.error('Error selecting tradesman:', error);
    } finally {
      setIsSelecting(null);
    }
  };

  const handleViewProfile = (tradieId: string) => {
    router.push(`/public-profile?tradieId=${tradieId}&jobId=${jobId}` as any);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.emptyTitle}>Couldn&apos;t load tradespersons</Text>
        <Text style={styles.emptySubtitle}>Check your connection and try again.</Text>
      </View>
    );
  }

  if (interests.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="people-outline" size={48} color={Colors.textSecondary} />
        <Text style={styles.emptyTitle}>No tradespersons yet</Text>
        <Text style={styles.emptySubtitle}>Check back soon — interested tradespersons will appear here.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Tradesperson</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>
        {interests.length} tradesperson{interests.length !== 1 ? 's' : ''} interested in your job
      </Text>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {interests.map((interest) => {
          const tradie = interest.tradie;
          if (!tradie) return null;

          return (
            <TouchableOpacity
              key={interest.id}
              style={styles.tradieCard}
              onPress={() => handleViewProfile(tradie.id)}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={28} color={Colors.accent} />
                </View>
                <View style={styles.tradieInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.tradieName}>{tradie.name}</Text>
                    {tradie.is_verified_pro && <VerifiedProBadge size="small" showText={false} />}
                  </View>
                  <View style={styles.ratingRow}>
                    <StarRating rating={tradie.average_rating || 0} />
                    <Text style={styles.ratingText}>
                      {tradie.average_rating?.toFixed(1)} ({tradie.total_reviews} reviews)
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.planBadge,
                  tradie.subscription_plan === 'pro' && styles.proBadge,
                ]}>
                  <Text style={[
                    styles.planText,
                    tradie.subscription_plan === 'pro' && styles.proText,
                  ]}>
                    {tradie.subscription_plan?.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.statText}>{interest.distance_miles} miles away</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="checkmark-done-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.statText}>{tradie.jobs_completed} jobs completed</Text>
                </View>
              </View>

              {/* View Profile hint */}
              <View style={styles.viewProfileHint}>
                <Text style={styles.viewProfileText}>Tap to view full profile</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
              </View>

              {/* Select & Book – separate press target so it doesn't open the profile */}
              <TouchableOpacity
                style={[styles.selectButton, isSelecting === tradie.id && styles.selectButtonDisabled]}
                onPress={(e) => {
                  // FireEvent.press may call the handler with undefined event
                  // so guard access to `stopPropagation` safely.
                  e?.stopPropagation?.();
                  handleSelectTradesman(tradie.id);
                }}
                disabled={isSelecting !== null}
              >
                {isSelecting === tradie.id ? (
                  <ActivityIndicator color={Colors.background} size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.background} />
                    <Text style={styles.selectButtonText}>Select & Book</Text>
                  </>
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  tradieCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  tradieInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  tradieName: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginLeft: Spacing.xs,
  },
  planBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  proBadge: {
    backgroundColor: Colors.accent,
  },
  planText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  proText: {
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  viewProfileHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.md,
  },
  viewProfileText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  selectButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  selectButtonDisabled: {
    opacity: 0.7,
  },
  selectButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
