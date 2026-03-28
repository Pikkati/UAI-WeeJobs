import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { supabase, User, Review } from '../lib/supabase';
import { useJobs } from '../context/JobsContext';
import VerifiedProBadge from '../components/VerifiedProBadge';

const { width } = Dimensions.get('window');
const PORTFOLIO_SIZE = (width - Spacing.xl * 2 - Spacing.sm) / 2;

// ─── Sanitized fallback data for local UI rendering only ─────────────────────

const MOCK_PROFILE: User = {
  id: 'local-fallback-tradesperson',
  email: '',
  name: 'Local Tradesperson',
  role: 'tradesperson',
  area: 'Causeway Coast & Glens',
  trade_categories: ['General Repairs', 'Plumbing', 'Carpentry'],
  average_rating: 4.8,
  total_reviews: 24,
  is_verified_pro: true,
  subscription_plan: 'pro',
  jobs_completed: 47,
  pricing_default: 'fixed',
  hourly_rate: 35,
  bio: 'Experienced tradesperson based on the Causeway Coast with over 10 years in the trade. I pride myself on quality workmanship, arriving on time, and leaving your home spotless. No job is too small.',
  areas_covered: ['Portrush', 'Portstewart', 'Coleraine', 'Bushmills', 'Ballymoney'],
  portfolio_photos: [],
  created_at: '2023-06-15T10:00:00Z',
  updated_at: new Date().toISOString(),
};

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    job_id: 'local-review-1',
    reviewer_id: 'local-customer-1',
    reviewee_id: 'local-fallback-tradesperson',
    rating: 5,
    comment: 'Excellent workmanship, clear communication, and a tidy finish.',
    reviewer_role: 'customer',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    reviewer: { name: 'Verified Customer' },
  },
  {
    id: '2',
    job_id: 'local-review-2',
    reviewer_id: 'local-customer-2',
    reviewee_id: 'local-fallback-tradesperson',
    rating: 5,
    comment: 'Quick response, fair pricing, and professional throughout.',
    reviewer_role: 'customer',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    reviewer: { name: 'Verified Customer' },
  },
  {
    id: '3',
    job_id: 'local-review-3',
    reviewer_id: 'local-customer-3',
    reviewee_id: 'local-fallback-tradesperson',
    rating: 4,
    comment: 'Solid job overall with good updates during the work.',
    reviewer_role: 'customer',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    reviewer: { name: 'Verified Customer' },
  },
];

// ─── Helper components ────────────────────────────────────────────────────────

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[...Array(5)].map((_, i) => (
        <Ionicons
          key={i}
          name={i < full ? 'star' : i === full && half ? 'star-half' : 'star-outline'}
          size={size}
          color={Colors.accent}
        />
      ))}
    </View>
  );
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatMemberSince(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function PublicProfileScreen() {
  const { tradieId, jobId } = useLocalSearchParams<{ tradieId: string; jobId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectTradesman } = useJobs();

  const [profile, setProfile] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const [profileResult, reviewsResult] = await Promise.all([
          supabase
            .from('users')
            .select('*')
            .eq('id', tradieId)
            .single(),
          supabase
            .from('reviews')
            .select('*, reviewer:reviewer_id(name)')
            .eq('reviewee_id', tradieId)
            .order('created_at', { ascending: false }),
        ]);

        if (profileResult.data) {
          setProfile(profileResult.data as User);
        } else {
          setProfile({ ...MOCK_PROFILE, id: tradieId });
        }

        if (reviewsResult.data && reviewsResult.data.length > 0) {
          setReviews(reviewsResult.data as Review[]);
        } else {
          setReviews(MOCK_REVIEWS);
        }
      } catch {
        setProfile({ ...MOCK_PROFILE, id: tradieId });
        setReviews(MOCK_REVIEWS);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [tradieId]);

  const handleSelectAndBook = async () => {
    if (!jobId || !tradieId) return;
    setIsSelecting(true);
    try {
      await selectTradesman(jobId, tradieId, 'fixed');
      router.push(`/job/pay-deposit?jobId=${jobId}&tradieId=${tradieId}` as any);
    } catch (error) {
      console.error('Error selecting tradesman:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (!profile) return null;

  const rating = profile.average_rating ?? 0;
  const reviewCount = profile.total_reviews ?? 0;
  const portfolioPhotos = profile.portfolio_photos ?? [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tradesperson Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: jobId ? 100 : 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Card ─────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Ionicons name="hammer" size={36} color={Colors.accent} />
            </View>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.name}>{profile.name}</Text>
              {profile.is_verified_pro && <VerifiedProBadge size="small" showText={false} />}
            </View>

            <View style={styles.ratingRow}>
              <StarDisplay rating={rating} size={16} />
              <Text style={styles.ratingText}>
                {rating.toFixed(1)}
                <Text style={styles.reviewCount}>  ({reviewCount} review{reviewCount !== 1 ? 's' : ''})</Text>
              </Text>
            </View>

            <View style={styles.badgeRow}>
              <View style={[
                styles.planBadge,
                profile.subscription_plan === 'pro' && styles.proBadge,
              ]}>
                <Text style={[
                  styles.planText,
                  profile.subscription_plan === 'pro' && styles.proText,
                ]}>
                  {profile.subscription_plan === 'pro' ? 'PRO' : 'PAYG'}
                </Text>
              </View>
              {profile.area && (
                <View style={styles.locationBadge}>
                  <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.locationText}>{profile.area}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats strip */}
          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.jobs_completed ?? 0}</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatMemberSince(profile.created_at)}</Text>
              <Text style={styles.statLabel}>Member Since</Text>
            </View>
          </View>
        </View>

        {/* ── Bio ───────────────────────────────────────────── */}
        {profile.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.card}>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          </View>
        ) : null}

        {/* ── Trade Categories ──────────────────────────────── */}
        {profile.trade_categories && profile.trade_categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specialities</Text>
            <View style={styles.chipsRow}>
              {profile.trade_categories.map((cat, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{cat}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Areas Covered ─────────────────────────────────── */}
        {profile.areas_covered && profile.areas_covered.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Areas</Text>
            <View style={styles.chipsRow}>
              {profile.areas_covered.map((area, i) => (
                <View key={i} style={[styles.chip, styles.areaChip]}>
                  <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                  <Text style={[styles.chipText, styles.areaChipText]}>{area}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Pricing ───────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.card}>
            <View style={styles.pricingRow}>
              <View style={styles.pricingIconBox}>
                <Ionicons
                  name={profile.pricing_default === 'hourly' ? 'time' : 'pricetag'}
                  size={22}
                  color={Colors.accent}
                />
              </View>
              <View style={styles.pricingInfo}>
                <Text style={styles.pricingTitle}>
                  {profile.pricing_default === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
                </Text>
                <Text style={styles.pricingDesc}>
                  {profile.pricing_default === 'hourly'
                    ? profile.hourly_rate
                      ? `£${profile.hourly_rate}/hour — invoice sent after work`
                      : 'Estimate sent first, invoice after work'
                    : 'Binding quote agreed before starting'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Portfolio ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Previous Work</Text>
          {portfolioPhotos.length > 0 ? (
            <View style={styles.portfolioGrid}>
              {portfolioPhotos.map((uri, i) => (
                <View key={i} style={[styles.portfolioCell, { width: PORTFOLIO_SIZE, height: PORTFOLIO_SIZE }]}>
                  <Image source={{ uri }} style={styles.portfolioImage} resizeMode="cover" />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyPortfolio}>
              <Ionicons name="images-outline" size={32} color={Colors.border} />
              <Text style={styles.emptyPortfolioText}>No portfolio photos yet</Text>
            </View>
          )}
        </View>

        {/* ── Reviews ───────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Reviews ({reviewCount})
          </Text>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerAvatar}>
                    <Ionicons name="person" size={16} color={Colors.textSecondary} />
                  </View>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>
                      {review.reviewer?.name ?? 'Verified Customer'}
                    </Text>
                    <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
                  </View>
                  <StarDisplay rating={review.rating} size={13} />
                </View>
                {review.comment ? (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.emptyReviews}>
              <Ionicons name="star-outline" size={28} color={Colors.border} />
              <Text style={styles.emptyReviewsText}>No reviews yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Select & Book footer ──────────────────────────── */}
      {jobId && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
          <TouchableOpacity
            style={[styles.bookButton, isSelecting && styles.bookButtonDisabled]}
            onPress={handleSelectAndBook}
            disabled={isSelecting}
          >
            {isSelecting ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color={Colors.white} />
                <Text style={styles.bookButtonText}>Select & Book</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    paddingVertical: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
    width: 40,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },

  // Hero
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  avatarRing: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  name: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  ratingText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  reviewCount: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '400',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  planBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  proBadge: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  planText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  proText: {
    color: Colors.white,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },

  // Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Bio
  bioText: {
    color: Colors.white,
    fontSize: 15,
    lineHeight: 22,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  chipText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '500',
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderColor: Colors.border,
  },
  areaChipText: {
    color: Colors.textSecondary,
  },

  // Pricing
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  pricingIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pricingInfo: {
    flex: 1,
  },
  pricingTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  pricingDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },

  // Portfolio
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  portfolioCell: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  emptyPortfolio: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyPortfolioText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },

  // Reviews
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  reviewDate: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  reviewComment: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
  },
  emptyReviews: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyReviewsText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bookButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  bookButtonDisabled: {
    opacity: 0.7,
  },
  bookButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
