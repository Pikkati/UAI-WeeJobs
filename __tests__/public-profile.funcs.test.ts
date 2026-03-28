import { formatDate, formatMemberSince } from '../app/public-profile';

describe('PublicProfile formatters', () => {
  test('formatDate returns UK-style date', () => {
    const out = formatDate('2023-03-15T12:00:00Z');
    // Expect day, short month and year to appear
    expect(out).toMatch(/15\s[A-Za-z]{3}\s2023/);
  });

  test('formatMemberSince returns month and year', () => {
    // Use midday UTC timestamp to avoid timezone shifting across locales
    const out = formatMemberSince('2021-06-15T12:00:00Z');
    expect(out).toMatch(/June\s2021/);
  });
});
// (single test block above is sufficient)
