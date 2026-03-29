import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Alert, Animated, PanResponder, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
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
            <TouchableOpacity style={modalStyles.skipButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.error} />
              <Text style={modalStyles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.acceptButton} onPress={onAccept}>
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
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTop,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) < 10 && Math.abs(gesture.dy) < 10) {
          onTap();
          return;
        }
        
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
          onSwipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.spring(position, {
            toValue: { x: -width - 100, y: gesture.dy },
            useNativeDriver: true,
          }).start(onSwipeLeft);
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const hasPhoto = job.photos && job.photos.length > 0;

  return (
    <Animated.View
      {...(isTop ? panResponder.panHandlers : {})}
      // eslint-disable-next-line react-hooks/refs
      style={[
        styles.card,
        isTop && {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate },
          ],
        },
        !isTop && styles.cardBelow,
      ]}
    >
      {hasPhoto && (
        <Image
          source={{ uri: job.photos![0] }}
          style={styles.cardImage}
          contentFit="cover"
        />
      )}
      
      <Animated.View style={[styles.likeStamp, { opacity: likeOpacity }]}>
        <Text style={styles.stampText}>ACCEPT</Text>
      </Animated.View>
      <Animated.View style={[styles.nopeStamp, { opacity: nopeOpacity }]}>
        <Text style={[styles.stampText, styles.nopeStampText]}>SKIP</Text>
      </Animated.View>

      <View style={[styles.cardContent, hasPhoto && styles.cardContentWithPhoto]}>
        <View style={styles.cardHeader}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={20} color={Colors.accent} />
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{job.name}</Text>
            <Text style={styles.postedDate}>
              Posted {new Date(job.created_at).toLocaleDateString()}
            </Text>
          </View>
          {job.photos && job.photos.length > 1 && (
            <View style={styles.photoCount}>
              <Ionicons name="images" size={14} color={Colors.white} />
              <Text style={styles.photoCountText}>{job.photos.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.categoryBadge}>
          <Ionicons
            name={(CATEGORY_ICONS[job.category] || 'build') as any}
            size={24}
            color={Colors.accent}
          />
          <Text style={styles.categoryText}>{job.category}</Text>
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={Colors.accent} />
            <Text style={styles.infoText}>{job.area}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={Colors.accent} />
            <Text style={styles.infoText}>{job.timing}</Text>
          </View>
        </View>

        <View style={styles.budgetBadge}>
          <Ionicons name="cash-outline" size={18} color={Colors.background} />
          <Text style={styles.budgetText}>
            {job.budget || 'Budget not set'}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {job.description || 'No description provided'}
        </Text>

        <Text style={styles.tapHint}>Tap for details</Text>
      </View>
    </Animated.View>
  );
}
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
    setJobs((prev) => prev.slice(1));
  };

  const handleSwipeRight = () => {
    const job = jobs[0];
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
      setJobs((prev) => prev.slice(1));
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
    if (jobs.length > 0) {
      setSelectedJob(jobs[0]);
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
    <View style={[styles.container, { paddingTop: Spacing.md }]}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/weejobs-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.title}>Find Jobs</Text>
      </View>

      {jobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="briefcase-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No jobs available</Text>
          <Text style={styles.emptyText}>
            Check back later for new jobs{'\n'}in your area
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchJobs}>
            <Ionicons name="refresh" size={20} color={Colors.background} />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.cardsContainer}>
            {jobs.slice(0, 3).reverse().map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                isTop={index === jobs.slice(0, 3).length - 1}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onTap={handleTapCard}
              />
            ))}
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.skipButton]}
              onPress={() => handleButtonSwipe('left')}
            >
              <Ionicons name="close" size={32} color={Colors.error} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.infoButton]}
              onPress={handleTapCard}
            >
              <Ionicons name="information" size={28} color={Colors.accent} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleButtonSwipe('right')}
            >
              <Ionicons name="checkmark" size={32} color={Colors.success} />
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            Swipe right to accept, left to skip
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
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '800',
    fontStyle: 'italic',
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
