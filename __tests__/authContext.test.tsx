import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    storage: {} as Record<string, string>,
    getItem: jest.fn(async (k: string) => ( (global as any).__asyncStorage?.[k] ?? null )),
    setItem: jest.fn(async (k: string, v: string) => { (global as any).__asyncStorage = (global as any).__asyncStorage || {}; (global as any).__asyncStorage[k] = v; }),
    removeItem: jest.fn(async (k: string) => { (global as any).__asyncStorage = (global as any).__asyncStorage || {}; delete (global as any).__asyncStorage[k]; }),
  }
}));

// Provide a mock supabase client
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn();
const mockFrom = jest.fn();

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
      signUp: jest.fn(async () => ({ data: { user: { id: 'u1', email: 'x@x.com', confirmed_at: new Date().toISOString() } }, error: null })),
      signOut: () => mockSignOut(),
    },
    from: (table: string) => ({
      select: () => ({
        eq: (col: string, val: string) => ({ single: async () => mockFrom(table, col, val) }),
      }),
    }),
  },
}));

function TestConsumer() {
  const { login } = useAuth();
  const [result, setResult] = React.useState<any>(null);

  return (
    <>
      <ButtonTest
        onPress={async () => {
          const r = await login('test@example.com', 'password');
          setResult(r);
        }}
      />
      <ResultText result={result} />
    </>
  );
}

function ButtonTest({ onPress }: { onPress: () => void }) {
  return (
    // TouchableOpacity is fine; using a plain Text with onPress for the test
    <></>
  );
}

function ResultText({ result }: { result: any }) {
  return (
    <>
      {result ? <TextTest>{JSON.stringify(result)}</TextTest> : null}
    </>
  );
}

function TextTest({ children }: { children: any }) {
  return <>{children}</>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__asyncStorage = {};
  });

  test('successful login stores user and returns success', async () => {
    // Arrange: supabase signIn returns a confirmed user
    mockSignInWithPassword.mockResolvedValueOnce({ data: { user: { id: 'u1', email: 'test@example.com', confirmed_at: new Date().toISOString() } }, error: null });
    mockFrom.mockResolvedValueOnce({ data: { id: 'u1', email: 'test@example.com', name: 'Tester', role: 'customer', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, error: null });

    const { getByText, queryByText } = render(
      <AuthProvider>
        <HookInvoker action="login" />
      </AuthProvider>
    );

    fireEvent.press(getByText('invoke'));

    await waitFor(() => expect(queryByText(/success/)).toBeTruthy());
  });

  test('login for unconfirmed user returns needsVerification', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ data: { user: { id: 'u2', email: 'unverified@example.com', confirmed_at: null } }, error: { message: 'User not confirmed' } });

    const { getByText, queryByText } = render(
      <AuthProvider>
        <HookInvoker action="login-unverified" />
      </AuthProvider>
    );

    fireEvent.press(getByText('invoke'));

    await waitFor(() => expect(queryByText(/needsVerification/)).toBeTruthy());
  });
});

// HookInvoker is a helper component that exposes actions for tests via buttons
function HookInvoker({ action }: { action: 'login' | 'login-unverified' }) {
  const { login } = useAuth();
  const [out, setOut] = React.useState<string>('');

  const run = async () => {
    if (action === 'login') {
      const res = await login('test@example.com', 'password');
      setOut(JSON.stringify(res));
    } else {
      const res = await login('unverified@example.com', 'password');
      setOut(JSON.stringify(res));
    }
  };

  return (
    <>
      <TextButton onPress={run}>invoke</TextButton>
      {out ? <TextButton>{out}</TextButton> : null}
    </>
  );
}

function TextButton({ children, onPress }: { children?: any; onPress?: () => void }) {
  if (onPress) {
    return <button onClick={onPress}>{children}</button> as any;
  }
  return <div>{children}</div> as any;
}
