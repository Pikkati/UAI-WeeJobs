import { STATUS_LABELS, STATUS_COLORS } from '../app/admin/jobs.helpers';

describe('admin jobs helpers', () => {
  test('STATUS_LABELS contains expected labels', () => {
    expect(STATUS_LABELS.open).toBe('Open');
    expect(STATUS_LABELS.accepted).toBe('Accepted');
    expect(STATUS_LABELS.completed).toBe('Completed');
    expect(STATUS_LABELS.cancelled).toBe('Cancelled');
  });

  test('STATUS_COLORS has string color values for keys', () => {
    Object.keys(STATUS_LABELS).forEach((k) => {
      expect(typeof STATUS_COLORS[k]).toBe('string');
      expect(STATUS_COLORS[k].length).toBeGreaterThan(0);
    });
  });

  test('STATUS_COLORS has correct color values', () => {
    expect(STATUS_COLORS.open).toBe('accent');
    expect(STATUS_COLORS.accepted).toBe('success');
    expect(STATUS_COLORS.completed).toBe('text-secondary');
    expect(STATUS_COLORS.cancelled).toBe('error');
  });

  test('STATUS_LABELS has correct labels', () => {
    expect(STATUS_LABELS.open).toBe('Open');
    expect(STATUS_LABELS.accepted).toBe('Accepted');
    expect(STATUS_LABELS.completed).toBe('Completed');
    expect(STATUS_LABELS.cancelled).toBe('Cancelled');
  });
});
