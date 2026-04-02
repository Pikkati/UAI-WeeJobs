import { Colors } from '../../constants/theme';

export const STATUS_COLORS: Record<string, string> = {
  open: Colors.accent,
  accepted: Colors.success,
  completed: Colors.textSecondary,
  cancelled: Colors.error,
};

export const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  accepted: 'Accepted',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
