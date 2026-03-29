import { getActionForStatus } from '../app/tradie/current-jobs';

describe('getActionForStatus', () => {
  test('booked hourly returns Send Estimate', () => {
    const cfg = getActionForStatus('booked', 'hourly');
    expect(cfg).not.toBeNull();
    expect(cfg?.action).toBe('send_estimate');
    expect(cfg?.label).toContain('Estimate');
  });

  test('booked fixed returns On My Way', () => {
    const cfg = getActionForStatus('booked', 'fixed');
    expect(cfg).not.toBeNull();
    expect(cfg?.action).toBe('on_the_way');
  });

  test('in_progress hourly returns Send Invoice', () => {
    const cfg = getActionForStatus('in_progress', 'hourly');
    expect(cfg).not.toBeNull();
    expect(cfg?.action).toBe('send_invoice');
  });

  test('in_progress fixed returns Send Quote', () => {
    const cfg = getActionForStatus('in_progress', 'fixed');
    expect(cfg).not.toBeNull();
    expect(cfg?.action).toBe('send_quote');
  });

  test('awaiting_quote_approval returns none action', () => {
    const cfg = getActionForStatus('awaiting_quote_approval');
    expect(cfg).not.toBeNull();
    expect(cfg?.action).toBe('none');
  });

  test('paid returns confirm action', () => {
    const cfg = getActionForStatus('paid');
    expect(cfg).not.toBeNull();
    expect(cfg?.action).toBe('confirm');
  });

  test('unknown status returns null', () => {
    const cfg = getActionForStatus('some_unknown' as any);
    expect(cfg).toBeNull();
  });
});
