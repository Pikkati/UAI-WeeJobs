import { formatTime, formatDate, shouldShowDateFor } from '../app/chat/[jobId]';

describe('chat [jobId] helpers', () => {
  test('formatTime returns a time string with colon', () => {
    const t = formatTime(new Date().toISOString());
    expect(typeof t).toBe('string');
    expect(t).toMatch(/\d{1,2}:\d{2}/);
  });

  test('formatDate returns Today/Yesterday for recent dates', () => {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    expect(formatDate(today)).toBe('Today');
    expect(formatDate(yesterday)).toBe('Yesterday');
    expect(formatDate('2000-01-01T00:00:00Z')).not.toBe('Today');
    expect(formatDate('2000-01-01T00:00:00Z')).not.toBe('Yesterday');
  });

  test('shouldShowDateFor compares adjacent messages', () => {
    const msgs = [
      { created_at: new Date().toISOString() },
      { created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    ];

    expect(shouldShowDateFor(msgs, 0)).toBe(true);
    expect(shouldShowDateFor(msgs, 1)).toBe(true);

    const sameDayMsgs = [
      { created_at: new Date().toISOString() },
      { created_at: new Date().toISOString() },
    ];
    expect(shouldShowDateFor(sameDayMsgs, 1)).toBe(false);
  });
});
