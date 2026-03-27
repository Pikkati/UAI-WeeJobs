import { TEST_USERS } from '../constants/data';

describe('TEST_USERS fixture', () => {
  test('has expected user emails and roles', () => {
    expect(TEST_USERS.tradie.email).toMatch(/@weejobs.test$/);
    expect(TEST_USERS.customer.role).toBe('customer');
    expect(TEST_USERS.admin.role).toBe('admin');
  });
});
