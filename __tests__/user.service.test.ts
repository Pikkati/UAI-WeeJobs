import { buildNormalizedUser, normalizeUserRole } from '../context/AuthContext';
import { User } from '../lib/supabase';

describe('normalizeUserRole', () => {
  it('maps "tradie" to "tradesperson"', () => {
    expect(normalizeUserRole('tradie' as unknown as any)).toBe('tradesperson');
  });
  it('returns other roles unchanged', () => {
    expect(normalizeUserRole('customer')).toBe('customer');
    expect(normalizeUserRole('tradesperson')).toBe('tradesperson');
    expect(normalizeUserRole('admin')).toBe('admin');
  });
});

describe('buildNormalizedUser', () => {
  it('fills missing fields with defaults', () => {
    const user = buildNormalizedUser({ id: '1', email: 'a@b.com', name: 'A', role: 'customer' });
    expect(user.id).toBe('1');
    expect(user.email).toBe('a@b.com');
    expect(user.name).toBe('A');
    expect(user.role).toBe('customer');
    expect(user.created_at).toBeTruthy();
    expect(user.updated_at).toBeTruthy();
  });
  it('normalizes role', () => {
    const user = buildNormalizedUser({ id: '2', email: 'b@b.com', name: 'B', role: 'tradie' as unknown as any });
    expect(user.role).toBe('tradesperson');
  });
  it('preserves optional fields', () => {
    const user = buildNormalizedUser({
      id: '3',
      email: 'c@b.com',
      name: 'C',
      role: 'admin',
      phone: '123',
      area: 'Test',
      trade_categories: ['A'],
      average_rating: 5,
      total_reviews: 1,
      is_verified_pro: true,
      subscription_plan: 'pro',
      jobs_completed: 2,
      pricing_default: 'hourly',
      hourly_rate: 50,
      bio: 'bio',
      areas_covered: ['X'],
      portfolio_photos: ['url'],
      created_at: '2020-01-01',
      updated_at: '2020-01-02',
    });
    expect(user.phone).toBe('123');
    expect(user.area).toBe('Test');
    expect(user.trade_categories).toEqual(['A']);
    expect(user.average_rating).toBe(5);
    expect(user.total_reviews).toBe(1);
    expect(user.is_verified_pro).toBe(true);
    expect(user.subscription_plan).toBe('pro');
    expect(user.jobs_completed).toBe(2);
    expect(user.pricing_default).toBe('hourly');
    expect(user.hourly_rate).toBe(50);
    expect(user.bio).toBe('bio');
    expect(user.areas_covered).toEqual(['X']);
    expect(user.portfolio_photos).toEqual(['url']);
    expect(user.created_at).toBe('2020-01-01');
    expect(user.updated_at).toBe('2020-01-02');
  });
});
