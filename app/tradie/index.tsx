import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Alert, Animated, PanResponder, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
// eslint-disable-next-line import/no-unresolved
import { Image } from 'expo-image';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import { supabase, Job } from '../../lib/supabase';
import { CATEGORY_ICONS } from '../../constants/data';
import LeadUnlockModal from '../../components/LeadUnlockModal';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

function JobDetailModal({ 
  job, 
  visible, 
  onClose, 
  onAccept,
  insets,
}: { 
  job: Job | null; 
  visible: boolean; 
  onClose: () => void;
  onAccept: () => void;
  insets: { top: number; bottom: number };
}) {
  
  
  if (!job) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.container, { paddingTop: insets.top }]}>
          <View style={modalStyles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={modalStyles.closeButton}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Close job details"
            >
              <Ionicons name="close" size={28} color={Colors.white} />
            </TouchableOpacity>
            <Text style={modalStyles.headerTitle}>Job Details</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={modalStyles.content} showsVerticalScrollIndicator={false}>
            {job.photos && job.photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={modalStyles.photoScroll}>
                {job.photos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    style={modalStyles.photo}
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
            )}

            <View style={modalStyles.categorySection}>
              <Ionicons
                name={(CATEGORY_ICONS[job.category] || 'build') as any}
                size={32}
                color={Colors.accent}
              />
              <Text style={modalStyles.categoryText}>{job.category}</Text>
            </View>

            <View style={modalStyles.infoCard}>
              <View style={modalStyles.infoRow}>
                <Ionicons name="person-outline" size={20} color={Colors.accent} />
                <Text style={modalStyles.infoLabel}>Customer</Text>
                <Text style={modalStyles.infoValue}>{job.name}</Text>
              </View>
              <View style={modalStyles.divider} />
              <View style={modalStyles.infoRow}>
                <Ionicons name="location-outline" size={20} color={Colors.accent} />
                <Text style={modalStyles.infoLabel}>Area</Text>
                <Text style={modalStyles.infoValue}>{job.area}</Text>
              </View>
              <View style={modalStyles.divider} />
              <View style={modalStyles.infoRow}>
                <Ionicons name="time-outline" size={20} color={Colors.accent} />
                <Text style={modalStyles.infoLabel}>Timing</Text>
                <Text style={modalStyles.infoValue}>{job.timing}</Text>
              </View>
              <View style={modalStyles.divider} />
              <View style={modalStyles.infoRow}>
                <Ionicons name="cash-outline" size={20} color={Colors.accent} />
                <Text style={modalStyles.infoLabel}>Budget</Text>
                <Text style={[modalStyles.infoValue, modalStyles.budgetValue]}>
                  {job.budget || 'Not specified'}
                </Text>
              </View>
            </View>

            {job.description && (
              <View style={modalStyles.descriptionSection}>
                <Text style={modalStyles.sectionTitle}>Description</Text>
                <Text style={modalStyles.descriptionText}>{job.description}</Text>
              </View>
            )}

            <Text style={modalStyles.postedDate}>
              Posted {new Date(job.created_at).toLocaleDateString()}
            </Text>

            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={[modalStyles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
            <TouchableOpacity
              style={modalStyles.skipButton}
              onPress={onClose}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Skip this job"
            >
              <Ionicons name="close" size={24} color={Colors.error} />
              <Text style={modalStyles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.acceptButton}
              onPress={onAccept}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Accept this job"
              accessibilityHint="Confirm your interest in this job"
            >
              <Ionicons name="checkmark" size={24} color={Colors.background} />
              <Text style={modalStyles.acceptButtonText}>Accept Job</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* eslint-disable react-hooks/refs */
/* eslint-disable react-hooks/exhaustive-deps */
function JobCard({
  job,
  isTop,
  onSwipeLeft,
  onSwipeRight,
  onTap,
}: {
  job: Job;
  isTop: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onTap: () => void;
}) {
  const hasPhoto = job.photos && job.photos.length > 0;
  const pan = useRef(new Animated.ValueXY()).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return isTop && (Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20);
    },

    onPanResponderMove: (_, gestureState) => {
      if (!isTop) return;
      
      pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      
      // Add rotation based on horizontal movement
      const rotate = gestureState.dx * 0.1;
      rotation.setValue(rotate);
    },

    onPanResponderRelease: (_, gestureState) => {
      if (!isTop) return;

      const { dx, dy } = gestureState;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If swiped far enough horizontally
      if (Math.abs(dx) > SWIPE_THRESHOLD && distance > SWIPE_THRESHOLD) {
        const direction = dx > 0 ? 'right' : 'left';
        
        // Animate out
        Animated.parallel([
          Animated.timing(pan, {
            toValue: { x: direction === 'right' ? width : -width, y: dy },
            duration: 250,
            useNativeDriver: false,
          }),
          Animated.timing(rotation, {
            toValue: direction === 'right' ? 30 : -30,
            duration: 250,
            useNativeDriver: false,
          })
        ]).start(() => {
          // Reset position for next card
          pan.setValue({ x: 0, y: 0 });
          rotation.setValue(0);
          
          if (direction === 'right') {
            onSwipeRight();
          } else {
            onSwipeLeft();
          }
        });
      } else {
        // Snap back to center
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(rotation, {
            toValue: 0,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          })
        ]).start();
      }
    },
  });

  const rotateInterpolation = rotation.interpolate({
    inputRange: [-30, 0, 30],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  const acceptOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const rejectOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const cardAnimatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { rotate: rotateInterpolation },
    ],
  };

  return (
    <Animated.View
      style={[styles.card, !isTop && styles.cardBelow, isTop && cardAnimatedStyle]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      <TouchableOpacity 
        style={styles.cardTouchable}
        onPress={onTap}
        activeOpacity={0.95}
        disabled={!isTop}
      >
        {hasPhoto && (
          <View style={styles.cardImageContainer}>
            <Image 
              source={{ uri: job.photos![0] }} 
              style={styles.cardImage} 
              contentFit="cover" 
            />
            <View style={styles.imageOverlay} />
          </View>
        )}

        {/* Swipe Indicators */}
        {isTop && (
          <>
            <Animated.View 
              style={[styles.swipeIndicator, styles.acceptIndicator, { opacity: acceptOpacity }]}
            >
              <Ionicons name="checkmark" size={48} color={Colors.success} />
              <Text style={styles.swipeIndicatorText}>ACCEPT</Text>
            </Animated.View>
            
            <Animated.View 
              style={[styles.swipeIndicator, styles.rejectIndicator, { opacity: rejectOpacity }]}
            >
              <Ionicons name="close" size={48} color={Colors.error} />
              <Text style={styles.swipeIndicatorText}>SKIP</Text>
            </Animated.View>
          </>
        )}

        <View style={[styles.cardContent, hasPhoto && styles.cardContentWithPhoto]}>
          {/* Priority Badge */}
          <View style={styles.priorityBadge}>
            <Ionicons name="flash" size={12} color={Colors.background} />
            <Text style={styles.priorityText}>New</Text>
          </View>

          {/* Customer Header */}
          <View style={styles.cardHeader}>
            <View style={styles.customerSection}>
              <View style={styles.profileAvatar}>
                <Ionicons name="person" size={18} color={Colors.accent} />
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{job.name}</Text>
                <View style={styles.customerMeta}>
                  <Ionicons name="location" size={12} color={Colors.textSecondary} />
                  <Text style={styles.locationText}>{job.area}</Text>
                  <Text style={styles.separator}>•</Text>
                  <Text style={styles.timeText}>
                    {new Date(job.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.budgetContainer}>
              <Text style={styles.budgetLabel}>Budget</Text>
              <Text style={styles.budgetAmount}>
                {job.budget || 'TBD'}
              </Text>
            </View>
          </View>

          {/* Category Section */}
          <View style={styles.categorySection}>
            <View style={styles.categoryBadge}>
              <Ionicons 
                name={(CATEGORY_ICONS[job.category] || 'build') as any} 
                size={20} 
                color={Colors.accent} 
              />
              <Text style={styles.categoryText}>{job.category}</Text>
            </View>
            <View style={styles.urgencyIndicator}>
              <Ionicons name="time" size={14} color={Colors.warning} />
              <Text style={styles.urgencyText}>{job.timing}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {job.description || 'No description provided'}
          </Text>

          {/* Action Buttons */}
          <View style={styles.cardActions}>
            <TouchableOpacity 
              onPress={(e) => { e.stopPropagation(); onSwipeLeft(); }} 
              style={[styles.cardActionButton, styles.cardSkipButton]}
              disabled={!isTop}
            >
              <Ionicons name="close" size={20} color={Colors.error} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={(e) => { e.stopPropagation(); onTap(); }}
              style={[styles.cardActionButton, styles.cardInfoButton]}
              disabled={!isTop}
            >
              <Text style={styles.cardInfoText}>View Details</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.accent} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={(e) => { e.stopPropagation(); onSwipeRight(); }} 
              style={[styles.cardActionButton, styles.cardAcceptButton]}
              disabled={!isTop}
            >
              <Ionicons name="checkmark" size={20} color={Colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
/* eslint-enable react-hooks/exhaustive-deps */
/* eslint-enable react-hooks/refs */

export default function TradieSwipeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { expressInterest } = useJobs();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [pendingJob, setPendingJob] = useState<Job | null>(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const filteredJobs = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    return jobs.filter((job) => {
      if (selectedCategory && job.category !== selectedCategory) return false;
      if (!q) return true;
      const hay = [job.description, job.area, job.category, job.name, job.timing, job.budget]
        .filter(Boolean)
        .map((s) => String(s).toLowerCase())
        .join(' ');
      return hay.includes(q);
    });
  }, [jobs, query, selectedCategory]);
  const categories = useMemo(() => Array.from(new Set(jobs.map(j => j.category).filter(Boolean))).slice(0, 12), [jobs]);
  const isPro = user?.subscription_plan === 'pro';

  const fetchJobs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSwipeLeft = () => {
    const top = filteredJobs[0];
    if (!top) return;
    setJobs((prev) => prev.filter((j) => j.id !== top.id));
  };

  const handleSwipeRight = () => {
    const job = filteredJobs[0];
    if (!job || !user) return;

    setPendingJob(job);
    setShowUnlockModal(true);
    setShowDetail(false);
  };

  const handleUnlockAndAccept = async () => {
    if (!pendingJob || !user) return;

    try {
      console.log(isPro ? "PRO auto-interest" : "PAYG unlock paid");
      
      const unlockFeeAmount = isPro ? 0 : 3;
      const success = await expressInterest(pendingJob.id, !isPro, unlockFeeAmount);

      if (!success) throw new Error('Failed to express interest');

      Alert.alert(
        'Interest Registered!', 
        `You've shown interest in the ${pendingJob.category} job in ${pendingJob.area}. The customer will review your profile and decide.`,
        [{ text: 'OK' }]
      );
      setJobs((prev) => prev.filter((j) => j.id !== pendingJob.id));
      setShowUnlockModal(false);
      setPendingJob(null);
    } catch (error) {
      console.error('Error expressing interest:', error);
      Alert.alert('Error', 'Failed to express interest. Please try again.');
    }
  };

  const handleCancelUnlock = () => {
    setShowUnlockModal(false);
    setPendingJob(null);
  };

  const handleTapCard = () => {
    const top = filteredJobs[0];
    if (top) {
      setSelectedJob(top);
      setShowDetail(true);
    }
  };

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      handleSwipeLeft();
    } else {
      handleSwipeRight();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.userName}>{user?.name || 'Tradie'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.weeBucksButton}
              onPress={() => router.push('/tradie/weebucks')}
            >
              <Ionicons name="diamond" size={16} color={Colors.accent} />
              <Text style={styles.weeBucksText}>47</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={32} color={Colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="briefcase" size={20} color={Colors.accent} />
            </View>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Jobs Won</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/tradie/earnings')}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name="cash" size={20} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>$2,450</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="star" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchInput}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              placeholder="Search jobs..."
              placeholderTextColor={Colors.textSecondary}
              style={styles.searchText}
              value={query}
              onChangeText={setQuery}
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
          
          {categories.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesRow}
              contentContainerStyle={styles.categoriesContent}
            >
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  !selectedCategory && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[
                  styles.categoryChipText,
                  !selectedCategory && styles.categoryChipTextActive
                ]}>All</Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive
                  ]}
                  onPress={() => setSelectedCategory(
                    selectedCategory === category ? null : category
                  )}
                >
                  <Ionicons 
                    name={(CATEGORY_ICONS[category] || 'build') as any}
                    size={16} 
                    color={selectedCategory === category ? Colors.background : Colors.textSecondary}
                  />
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive
                  ]}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {filteredJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="briefcase-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>
            {query || selectedCategory ? 'No matching jobs' : 'No jobs available'}
          </Text>
          <Text style={styles.emptyText}>
            {query || selectedCategory 
              ? 'Try adjusting your search criteria'  
              : 'Check back later for new jobs\nin your area'
            }
          </Text>
          {!query && !selectedCategory && (
            <TouchableOpacity style={styles.refreshButton} onPress={fetchJobs}>
              <Ionicons name="refresh" size={20} color={Colors.background} />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Jobs</Text>
            <Text style={styles.sectionCount}>{filteredJobs.length} jobs</Text>
          </View>

          <View style={styles.cardsContainer}>
            {filteredJobs.slice(0, 3).reverse().map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                isTop={index === filteredJobs.slice(0, 3).length - 1}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onTap={handleTapCard}
              />
            ))}
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.skipButton]}
              onPress={() => handleButtonSwipe('left')}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Skip this job"
            >
              <Ionicons name="close" size={28} color={Colors.error} />
              <Text style={styles.actionButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.infoButton]}
              onPress={handleTapCard}
              accessible
              accessibilityRole="button"
              accessibilityLabel="View job details"
            >
              <Ionicons name="information-circle" size={24} color={Colors.accent} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleButtonSwipe('right')}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Accept this job"
            >
              <Ionicons name="checkmark" size={28} color={Colors.background} />
              <Text style={[styles.actionButtonText, { color: Colors.background }]}>Accept</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            👆 Tap to view details • 👈👉 Swipe or tap buttons to accept/skip • {filteredJobs.length} jobs remaining
          </Text>
        </>
      )}

      <JobDetailModal
        job={selectedJob}
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        onAccept={handleSwipeRight}
        insets={insets}
      />

      <LeadUnlockModal
        job={pendingJob}
        visible={showUnlockModal}
        onUnlock={handleUnlockAndAccept}
        onCancel={handleCancelUnlock}
        isPro={isPro}
        unlockPrice={3}
        tradieId={user?.id}
      />
    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  photoScroll: {
    maxHeight: 250,
  },
  photo: {
    width: width - 20,
    height: 250,
    marginHorizontal: 10,
    borderRadius: BorderRadius.md,
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  categoryText: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginLeft: Spacing.md,
    flex: 1,
  },
  infoValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  budgetValue: {
    color: Colors.accent,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  descriptionSection: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    color: Colors.white,
    fontSize: 16,
    lineHeight: 24,
  },
  postedDate: {
    color: Colors.textSecondary,
    fontSize: 12,
    paddingHorizontal: Spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  skipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.error,
  },
  skipButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent,
  },
  acceptButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  weeBucksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '20',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  weeBucksText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  profileButton: {
    padding: Spacing.xs,
  },
  
  // Stats Cards
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: Colors.accent + '20',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },

  // Search Section
  searchSection: {
    marginBottom: Spacing.md,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  searchText: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
  categoriesRow: {
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 0,
    gap: Spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  categoryChipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionCount: {
    color: Colors.textSecondary,
    fontSize: 14,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  refreshButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },

  // Job Cards
  cardsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: width - (Spacing.xl * 2),
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  cardBelow: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  cardTouchable: {
    flex: 1,
  },
  cardImageContainer: {
    position: 'relative',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  
  // Swipe Indicators
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    zIndex: 10,
    transform: [{ translateY: -60 }],
  },
  acceptIndicator: {
    right: 20,
    borderColor: Colors.success,
  },
  rejectIndicator: {
    left: 20,
    borderColor: Colors.error,
  },
  swipeIndicatorText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 8,
  },
  
  cardContent: {
    padding: Spacing.lg,
  },
  cardContentWithPhoto: {
    paddingTop: Spacing.lg,
  },

  // Priority Badge
  priorityBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
    zIndex: 2,
  },
  priorityText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // Customer Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    backgroundColor: Colors.accent + '20',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  customerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  separator: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  timeText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  budgetContainer: {
    alignItems: 'flex-end',
  },
  budgetLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  budgetAmount: {
    color: Colors.success,
    fontSize: 16,
    fontWeight: '700',
  },

  // Category Section
  categorySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  categoryText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  urgencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  urgencyText: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: '500',
  },

  // Description
  description: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },

  // Card Actions
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    minWidth: 44,
    minHeight: 44,
  },
  cardSkipButton: {
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  cardInfoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent + '20',
    borderWidth: 1,
    borderColor: Colors.accent + '40',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  cardInfoText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  cardAcceptButton: {
    backgroundColor: Colors.accent,
    borderWidth: 1,
    borderColor: Colors.accent,
  },

  // Bottom Actions
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    minWidth: 56,
    minHeight: 56,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  skipButton: {
    backgroundColor: Colors.error + '20',
    borderWidth: 2,
    borderColor: Colors.error + '40',
  },
  infoButton: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  acceptButton: {
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.accent,
  },

  // Hint Text
  hint: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  categoryScroll: {
    paddingVertical: Spacing.xs,
  },
  categoryChip: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  categoryChipText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryChipTextSelected: {
    color: Colors.background,
  },
  clearFilters: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  clearFiltersText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: width - Spacing.xl * 2,
    height: height * 0.55,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardBelow: {
    top: 10,
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  likeStamp: {
    position: 'absolute',
    top: 40,
    left: 30,
    zIndex: 10,
    borderWidth: 4,
    borderColor: Colors.success,
    borderRadius: 8,
    padding: 8,
    transform: [{ rotate: '-20deg' }],
  },
  nopeStamp: {
    position: 'absolute',
    top: 40,
    right: 30,
    zIndex: 10,
    borderWidth: 4,
    borderColor: Colors.error,
    borderRadius: 8,
    padding: 8,
    transform: [{ rotate: '20deg' }],
  },
  stampText: {
    color: Colors.success,
    fontSize: 24,
    fontWeight: '800',
  },
  nopeStampText: {
    color: Colors.error,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  cardContentWithPhoto: {
    paddingTop: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  photoCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  photoCountText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryText: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  cardInfo: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  budgetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  budgetText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  postedDate: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  tapHint: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 'auto',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.error,
  },
  infoButton: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  acceptButton: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.success,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingBottom: Spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  refreshButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  refreshButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
