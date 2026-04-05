import { normalizeUserRole, buildNormalizedUser } from '../context/AuthContext';

describe('AuthContext helpers', () => {
  test('normalizeUserRole maps tradie to tradesperson', () => {
    expect(normalizeUserRole('tradie')).toBe('tradesperson');
    expect(normalizeUserRole('customer')).toBe('customer');
    expect(normalizeUserRole('admin')).toBe('admin');
  });

  test('buildNormalizedUser fills defaults and normalizes role', () => {
    const partial = {
      id: 'u1',
      email: 'a@b.com',
      name: 'A',
      role: 'tradie',
    } as any;
    const user = buildNormalizedUser(partial);
    expect(user.id).toBe('u1');
    expect(user.email).toBe('a@b.com');
    expect(user.name).toBe('A');
    expect(user.role).toBe('tradesperson');
    expect(typeof user.created_at).toBe('string');
    expect(typeof user.updated_at).toBe('string');
  });
});
