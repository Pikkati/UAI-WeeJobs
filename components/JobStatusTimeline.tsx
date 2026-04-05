import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Colors, Spacing } from '../constants/theme';
import { JobStatus } from '../lib/supabase';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface TimelineStep {
  key: JobStatus;
  label: string;
  icon: IconName;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'booked', label: 'Booked', icon: 'checkmark-circle' },
  { key: 'on_the_way', label: 'On the way', icon: 'car' },
  { key: 'in_progress', label: 'In progress', icon: 'hammer' },
  { key: 'awaiting_quote_approval', label: 'Quote', icon: 'document-text' },
  { key: 'paid', label: 'Payment', icon: 'card' },
  { key: 'completed', label: 'Complete', icon: 'trophy' },
];

const STATUS_ORDER: JobStatus[] = [
  'open',
  'pending_customer_choice',
  'awaiting_customer_choice',
  'booked',
  'on_the_way',
  'in_progress',
  'awaiting_quote_approval',
  'awaiting_final_payment',
  'paid',
  'awaiting_confirmation',
  'completed',
];

interface JobStatusTimelineProps {
  currentStatus: JobStatus;
}

export default function JobStatusTimeline({
  currentStatus,
}: JobStatusTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  const getStepStatus = (
    stepKey: JobStatus,
  ): 'completed' | 'current' | 'pending' => {
    const stepIndex = STATUS_ORDER.indexOf(stepKey);
    if (stepIndex < currentIndex) return 'completed';
    if (
      stepIndex === currentIndex ||
      (stepKey === 'awaiting_quote_approval' &&
        currentStatus === 'awaiting_final_payment') ||
      (stepKey === 'paid' &&
        (currentStatus === 'awaiting_confirmation' || currentStatus === 'paid'))
    ) {
      return 'current';
    }
    return 'pending';
  };

  return (
    <View style={styles.container}>
      {TIMELINE_STEPS.map((step, index) => {
        const status = getStepStatus(step.key);
        const isLast = index === TIMELINE_STEPS.length - 1;

        return (
          <View key={step.key} style={styles.stepWrapper}>
            <View style={styles.stepContainer}>
              <View
                style={[
                  styles.iconCircle,
                  status === 'completed' && styles.iconCircleCompleted,
                  status === 'current' && styles.iconCircleCurrent,
                ]}
              >
                {status === 'completed' ? (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={Colors.background}
                  />
                ) : (
                  <Ionicons
                    name={step.icon}
                    size={16}
                    color={
                      status === 'current'
                        ? Colors.background
                        : Colors.textSecondary
                    }
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  status === 'current' && styles.stepLabelCurrent,
                  status === 'completed' && styles.stepLabelCompleted,
                ]}
              >
                {step.label}
              </Text>
            </View>
            {!isLast && (
              <View
                style={[
                  styles.connector,
                  status === 'completed' && styles.connectorCompleted,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  stepWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  iconCircleCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  iconCircleCurrent: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  stepLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stepLabelCurrent: {
    color: Colors.accent,
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: Colors.success,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginTop: 15,
    marginHorizontal: 4,
  },
  connectorCompleted: {
    backgroundColor: Colors.success,
  },
});
