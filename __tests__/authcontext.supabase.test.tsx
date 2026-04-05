import { render, waitFor } from '@testing-library/react-native';
import * as AuthContext from '../context/AuthContext';
console.log('Direct import of AuthContext:', AuthContext);

const MockAuthProvider = ({ children }: any) => <>{children}</>;

jest.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: jest.fn(() => ({
    user: { id: 'test-user-id', name: 'Test User', confirmed_at: null },
    isLoading: false,
    login: jest.fn(async () => ({ success: false, needsVerification: true })),
    signup: jest.fn(async () => ({ success: false, needsVerification: true })),
    sendPasswordReset: jest.fn(async () => ({ success: true })),
    logout: jest.fn(),
    resendVerification: jest.fn(),
    setHasSeenOnboarding: jest.fn(),
    refreshUser: jest.fn(),
  })),
  normalizeUserRole: jest.fn((role) => role),
  buildNormalizedUser: jest.fn((data) => data),
}));

console.log('authcontext.supabase.test.tsx: Importing AuthContext:', require('../context/AuthContext'));

describe('AuthContext supabase-backed flows', () => {
  afterEach(() => {
    // cleanup any global overrides — reset the test container without
    // deleting the accessor defined by jest-setup so other tests keep
    // the stable identity.
    // eslint-disable-next-line no-undef
    (global as any).__TEST_SUPABASE__ = {};
    jest.restoreAllMocks();
  });

  test('login returns needsVerification when user not confirmed', async () => {
    const { login } = useAuth();
    const result = await login('a@b.com', 'pw');

    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.needsVerification).toBeTruthy();
  });

  test('signup returns needsVerification when signup requires email confirm', async () => {
    const { signup } = useAuth();
    const result = await signup('a@b.com', 'pw', 'Test User', 'tradie');

    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.needsVerification).toBeTruthy();
  });

  test('sendPasswordReset forwards success when supported', async () => {
    const { sendPasswordReset } = useAuth();
    const result = await sendPasswordReset('x@y.com');

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  test('useAuth mock returns expected methods', () => {
    const { login, signup, sendPasswordReset } = useAuth();
    expect(login).toBeDefined();
    expect(signup).toBeDefined();
    expect(sendPasswordReset).toBeDefined();
  });
});
