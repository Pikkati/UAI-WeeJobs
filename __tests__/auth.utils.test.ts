import { normalizeUserRole, buildNormalizedUser } from '../context/AuthContext';

describe('AuthContext utilities', () => {
  test('normalizeUserRole maps tradie to tradesperson', () => {
    expect(normalizeUserRole('tradie')).toBe('tradesperson');
    expect(normalizeUserRole('customer')).toBe('customer');
    expect(normalizeUserRole('tradesperson')).toBe('tradesperson');
  });

  test('buildNormalizedUser fills defaults and normalizes role', () => {
    const u = buildNormalizedUser({ id: 'x', email: 'a@b', role: 'tradie' } as any);
    expect(u.id).toBe('x');
    expect(u.email).toBe('a@b');
    expect(u.role).toBe('tradesperson');
    expect(u.created_at).toBeTruthy();
    expect(u.updated_at).toBeTruthy();
  });
});
