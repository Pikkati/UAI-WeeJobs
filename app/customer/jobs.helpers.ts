import { Job, JobStatus } from '../../lib/supabase';
import { Colors } from '../../constants/theme';

export const STATUS_COLORS: Partial<Record<JobStatus, string>> = {
  open: Colors.accent,
  pending_customer_choice: '#22c55e',
  awaiting_customer_choice: '#22c55e',
  booked: Colors.success,
  on_the_way: '#3b82f6',
  in_progress: '#8b5cf6',
  awaiting_quote_approval: '#f59e0b',
  awaiting_final_payment: '#ef4444',
  paid: Colors.success,
  awaiting_confirmation: '#3b82f6',
  completed: Colors.textSecondary,
  cancelled: Colors.error,
  cancelled_by_customer: Colors.error,
  cancelled_by_tradie: Colors.error,
};

export const STATUS_LABELS: Partial<Record<JobStatus, string>> = {
  open: 'Open',
  pending_customer_choice: 'Tradies Interested!',
  awaiting_customer_choice: 'Choose a Tradie',
  booked: 'Booked',
  on_the_way: 'Tradie On Way',
  in_progress: 'In Progress',
  awaiting_quote_approval: 'Quote Ready',
  awaiting_final_payment: 'Pay Now',
  paid: 'Paid',
  awaiting_confirmation: 'Confirm Complete',
  completed: 'Completed',
  cancelled: 'Cancelled',
  cancelled_by_customer: 'Cancelled by You',
  cancelled_by_tradie: 'Cancelled by Tradie',
};

export function canEditOrDelete(status: JobStatus): boolean {
  return status === 'open' || status === 'pending_customer_choice' || status === 'awaiting_customer_choice';
}

export function getActionText(job: Job, interestCounts: Record<string, number> = {}): string | null {
  switch (job.status) {
    case 'open':
    case 'pending_customer_choice':
      return (interestCounts[job.id] || 0) > 0 ? 'Tap to view interested tradespeople' : null;
    case 'awaiting_customer_choice':
      return 'Tap to choose your tradesperson';
    case 'awaiting_quote_approval':
      return 'Tap to review the quote';
    case 'awaiting_final_payment':
      return 'Tap to complete payment';
    case 'booked':
    case 'on_the_way':
    case 'in_progress':
      return 'Tap to track progress';
    case 'completed':
      return 'Tap to leave a review';
    default:
      return null;
  }
}
