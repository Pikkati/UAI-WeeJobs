import { formatDate, formatMemberSince } from '../app/public-profile';

describe('public profile formatters', () => {
  const iso = '2023-06-15T10:00:00Z';

  it('formats full date in en-GB', () => {
    const expected = new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    expect(formatDate(iso)).toBe(expected);
  });

  it('formats member since month-year', () => {
    const expected = new Date(iso).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    });
    expect(formatMemberSince(iso)).toBe(expected);
  });
});
