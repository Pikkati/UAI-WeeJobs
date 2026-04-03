import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useJobs } from '../../context/JobsContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

function StarRatingInput({ rating, onRatingChange }: { rating: number; onRatingChange: (r: number) => void }) {
  return (
    <View style={styles.starInputContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onRatingChange(star)} style={styles.starButton}>
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={40}
            color={Colors.accent}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ReviewScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jobs } = useJobs();
  const { user } = useAuth();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const job = jobs.find(j => j.id === jobId);

  if (!job) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isCustomer = user?.role === 'customer';
      const revieweeId = isCustomer ? job.tradie_id : job.customer_id;

      const { error } = await supabase.from('reviews').insert({
        job_id: jobId,
        reviewer_id: user?.id,
        reviewee_id: revieweeId,
        rating,
        comment: comment || null,
        reviewer_role: user?.role,
      });

      if (error) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        const sentry = require('../../lib/sentry');
        sentry.captureException?.(error);
        throw error;
      }

      Alert.alert(
        'Review Submitted!',
        'Thank you for your feedback.',
        [{ text: 'OK', onPress: () => router.push('/customer') }]
      );
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const sentry = require('../../lib/sentry');
      sentry.captureException?.(error);
      if (error.code === '23505') {
        Alert.alert('Already Reviewed', 'You have already submitted a review for this job.');
      } else {
        Alert.alert('Error', 'Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Tap to rate';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave a Review</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.jobCard}>
          <Ionicons name="checkmark-circle" size={40} color={Colors.success} />
          <Text style={styles.jobCompletedText}>Job Completed</Text>
          <Text style={styles.jobCategory}>{job.category}</Text>
          <Text style={styles.jobArea}>{job.area}</Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>
            How was your experience?
          </Text>
          <StarRatingInput rating={rating} onRatingChange={setRating} />
          <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Add a comment (optional)</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Tell us about your experience..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="bulb" size={20} color={Colors.accent} />
          <Text style={styles.tipText}>
            Your honest review helps others make informed decisions and rewards good tradespeople.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <TouchableOpacity
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmitReview}
          disabled={rating === 0 || isSubmitting}
        >
          <Ionicons name="star" size={20} color={Colors.background} />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/customer')}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
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
  jobCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  jobCompletedText: {
    color: Colors.success,
    fontSize: 16,
    fontWeight: '600',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  jobCategory: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  jobArea: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  starInputContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  starButton: {
    padding: Spacing.xs,
  },
  ratingLabel: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  commentSection: {
    marginBottom: Spacing.lg,
  },
  commentInput: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.white,
    fontSize: 16,
    minHeight: 120,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  tipText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
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
  submitButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});
