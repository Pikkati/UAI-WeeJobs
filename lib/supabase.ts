import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

let supabaseUrl = '';
let _supabaseAnonKey = '';

try {
  // Defensive access to process.env for test environments where `process` may be proxied or missing
  const proc: any =
    typeof process !== 'undefined' ? process : (globalThis as any).process;
  if (proc && proc.env) {
    supabaseUrl = proc.env.EXPO_PUBLIC_SUPABASE_URL || '';
    _supabaseAnonKey = proc.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  }
} catch {
  // ignore and keep empty strings
}

if (
  supabaseUrl &&
  !supabaseUrl.startsWith('http://') &&
  !supabaseUrl.startsWith('https://')
) {
  supabaseUrl = `https://${supabaseUrl}`;
}

// If environment variables are missing, export a lightweight mock-compatible
// supabase object to avoid throwing during test imports. Make the queries
// chainable and thenable so code can await at any point in the chain.
const _fallbackSupabase = (() => {
  const createChain = (singleResult = false) => {
    const promiseValue = singleResult
      ? { data: null, error: null }
      : { data: [], error: null };
    // Reusable chain object. Methods return the same object to allow chaining.
    const q: any = {
      select: (..._args: any[]) => q,
      order: (..._args: any[]) => q,
      eq: (..._args: any[]) => q,
      neq: (..._args: any[]) => q,
      in: (..._args: any[]) => q,
      update: (..._args: any[]) => q,
      insert: (..._args: any[]) => q,
      single: () => Promise.resolve({ data: null, error: null }),
      then: (onFulfilled: any, onRejected?: any) =>
        Promise.resolve(promiseValue).then(onFulfilled, onRejected),
      catch: (onRejected: any) =>
        Promise.resolve(promiseValue).catch(onRejected),
    };
    return q;
  };

  return {
    from: (_table?: string) => createChain(false),
    auth: {
      signUp: async (_opts: any) => ({ data: null, error: null }),
      signInWithPassword: async (_opts: any) => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
    },
    functions: { invoke: async () => ({ data: null, error: null }) },
  } as any;
})();

// Export a dynamic supabase proxy that prefers a test-provided global override
// when present. Using a proxy ensures tests can set `global.__TEST_SUPABASE__`
// at any time (before or after module import) and code will always reference
// the current test instance.
let _realClient: any = null;
const resolveClient = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g: any =
      typeof global !== 'undefined' ? (global as any) : (globalThis as any);
    if (g && g.__TEST_SUPABASE__) {
      // Prefer returning the stable test container object directly so any
      // Jest mock functions assigned to it keep their original identity
      // and binding. The `jest-setup.js` file provides a default container
      // with the fallback chainable API so tests can safely `Object.assign`
      // into it without losing behavior.

      try {
        // Prefer returning the stable test container object directly so any
        // Jest mock functions assigned to it keep their original identity
        // and binding. The `jest-setup.js` file provides a default container
        // with the fallback chainable API so tests can safely `Object.assign`
        // into it without losing behavior.
        // eslint-disable-next-line no-console
        console.log(
          'DEBUG(supabase.resolveClient) global.__TEST_SUPABASE__ keys:',
          Object.keys(g.__TEST_SUPABASE__ || {}),
        );
        // eslint-disable-next-line no-console
        console.log(
          'DEBUG(supabase.resolveClient) returning global.__TEST_SUPABASE__ directly to preserve mock identity',
        );
        try {
          const testFromRes =
            g.__TEST_SUPABASE__.from && g.__TEST_SUPABASE__.from('users');
          // eslint-disable-next-line no-console
          console.log(
            'DEBUG(supabase.resolveClient) direct __TEST_SUPABASE__.from("users") typeof:',
            typeof testFromRes,
            testFromRes && Object.keys(testFromRes || {}),
          );
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(
            'DEBUG(supabase.resolveClient) direct __TEST_SUPABASE__.from call threw:',
            e && (e as any).message ? (e as any).message : e,
          );
        }
      } catch {
        // ignore debug failures
      }
      return g.__TEST_SUPABASE__;
    }
  } catch {
    // ignore
  }

  // If we already have a real client (created from env vars), return it.
  if (_realClient) return _realClient;

  // Re-read env vars at call-time so tests that mutate `process.env`
  // before requiring this module still behave correctly.
  let url = '';
  let key = '';
  try {
    const proc: any =
      typeof process !== 'undefined' ? process : (globalThis as any).process;
    if (proc && proc.env) {
      url = proc.env.EXPO_PUBLIC_SUPABASE_URL || '';
      key = proc.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
    }
  } catch {
    // ignore
  }

  if (url && key) {
    _realClient = createClient(url, key, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    return _realClient;
  }

  // Do not cache the fallback client into _realClient so future calls
  // can re-evaluate env changes; return the shared fallback object.
  return _fallbackSupabase;
};

// Wrap an instance so that nested objects' methods are bound to their
// owning object. This ensures test-provided mocks and real clients behave
// consistently when consumers call `client.auth.signUp()` or similar.
const wrapInstance = (target: any): any => {
  if (!target || typeof target !== 'object') return target;
  return new Proxy(target, {
    get(t, prop: string) {
      const val = (t as any)[prop as any];
      if (typeof val === 'function') {
        // If this is a Jest mock function, return a bound wrapper that
        // preserves the mock metadata so tests can still inspect call
        // information while ensuring `this` is correctly bound to the
        // owning object. Fall back to binding for normal functions.
        if ((val as any)._isMockFunction) {
          const orig = val as any;
          const boundWrapper = function boundWrapper(
            this: any,
            ...args: any[]
          ) {
            return orig.apply(t, args);
          };
          try {
            // Attempt to preserve common Jest mock metadata properties.
            (boundWrapper as any)._isMockFunction = true;
            if ((orig as any).mock)
              (boundWrapper as any).mock = (orig as any).mock;
            if ((orig as any).getMockName)
              (boundWrapper as any).getMockName = (
                orig as any
              ).getMockName.bind(orig);
            // Copy any own properties to retain call counts and helpers.
            Object.getOwnPropertyNames(orig).forEach((k) => {
              try {
                if (!(k in boundWrapper))
                  (boundWrapper as any)[k] = (orig as any)[k];
              } catch {
                // ignore non-writable properties
              }
            });
          } catch {
            // best-effort preservation; ignore on failure
          }
          return boundWrapper;
        }
        return val.bind(t);
      }
      if (val && typeof val === 'object') return wrapInstance(val);
      return val;
    },
  });
};

// Expose a helper so other modules can retrieve the resolved client
// (wrapped) without re-implementing the global override logic.
export const getSupabaseClient = () => {
  // Always wrap the resolved client so nested methods are bound to their
  // owning object. `wrapInstance` makes a best-effort to preserve Jest
  // mock metadata when binding mock functions so tests can still inspect
  // call counts and implementations.
  return wrapInstance(resolveClient());
};

// Provide a stable wrapper object with callable properties that delegate
// to the resolved client at call-time. This allows tests to `jest.spyOn`
// and `mockImplementation` the exported properties because they exist
// as real, configurable object members (unlike a Proxy-only approach).
export const supabase: any = {
  from: (...args: any[]) => {
    const inst = resolveClient();
    return inst.from(...args);
  },
  auth: {
    signUp: (...args: any[]) => {
      const inst = resolveClient();
      return inst.auth.signUp(...args);
    },
    signInWithPassword: (...args: any[]) => {
      const inst = resolveClient();
      return inst.auth.signInWithPassword(...args);
    },
    signOut: (...args: any[]) => {
      const inst = resolveClient();
      return inst.auth.signOut(...args);
    },
    resetPasswordForEmail: (...args: any[]) => {
      const inst = resolveClient();
      return inst.auth.resetPasswordForEmail(...args);
    },
  },
  functions: {
    invoke: (...args: any[]) => {
      const inst = resolveClient();
      return inst.functions.invoke(...args);
    },
  },
};

export type UserRole = 'customer' | 'tradesperson' | 'admin';
export type SubscriptionPlan = 'payg' | 'pro';
export type PricingType = 'fixed' | 'hourly';

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  area?: string;
  trade_categories?: string[];
  average_rating?: number;
  total_reviews?: number;
  is_verified_pro?: boolean;
  subscription_plan?: SubscriptionPlan;
  jobs_completed?: number;
  pricing_default?: PricingType;
  hourly_rate?: number;
  bio?: string;
  areas_covered?: string[];
  portfolio_photos?: string[];
  created_at: string;
  updated_at: string;
};

export type JobStatus =
  | 'open'
  | 'pending_customer_choice'
  | 'awaiting_customer_choice'
  | 'booked'
  | 'estimate_acknowledged'
  | 'on_the_way'
  | 'in_progress'
  | 'awaiting_quote_approval'
  | 'awaiting_invoice_payment'
  | 'awaiting_final_payment'
  | 'paid'
  | 'awaiting_confirmation'
  | 'completed'
  | 'cancelled'
  | 'cancelled_by_customer'
  | 'cancelled_by_tradie';

export type Job = {
  id: string;
  customer_id: string;
  tradie_id?: string;
  name: string;
  phone: string;
  email?: string;
  area: string;
  category: string;
  title?: string;
  description?: string;
  timing: string;
  budget?: string;
  photos?: string[];
  status: JobStatus;
  is_garage_clearance: boolean;
  postcode?: string;
  lat?: number;
  lng?: number;
  pricing_type?: PricingType;
  deposit_amount?: number;
  deposit_paid?: boolean;
  deposit_paid_at?: string;
  estimate_hours?: number;
  estimate_hourly_rate?: number;
  estimate_materials?: number;
  estimate_total?: number;
  estimate_notes?: string;
  estimate_acknowledged_at?: string;
  quote_labour?: number;
  quote_materials?: number;
  quote_notes?: string;
  quote_total?: number;
  quote_sent_at?: string;
  invoice_hours?: number;
  invoice_hourly_rate?: number;
  invoice_materials?: number;
  invoice_total?: number;
  invoice_notes?: string;
  invoice_sent_at?: string;
  final_payment_amount?: number;
  final_payment_paid?: boolean;
  final_payment_paid_at?: string;
  customer_confirmed?: boolean;
  tradie_confirmed?: boolean;
  completed_at?: string;
  cancelled_by?: 'customer' | 'tradie';
  cancellation_reason?: string;
  deposit_refunded?: boolean;
  created_at: string;
  updated_at: string;
};

export type InterestStatus =
  | 'interested'
  | 'shortlisted'
  | 'selected'
  | 'rejected'
  | 'withdrawn';

export type JobInterest = {
  id: string;
  job_id: string;
  tradie_id: string;
  status: InterestStatus;
  unlock_fee_paid: boolean;
  unlock_fee_amount?: number;
  is_pro_at_time: boolean;
  distance_miles?: number;
  created_at: string;
  updated_at: string;
  tradie?: User;
};

export type Review = {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  reviewer_role?: string;
  created_at: string;
  // Joined field when fetched with reviewer data
  reviewer?: { name: string };
};

export type Message = {
  id: string;
  job_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

export type Quote = {
  labour: number;
  materials: number;
  notes?: string;
  total: number;
};

export type TradesmanPreview = {
  id: string;
  name: string;
  distanceMiles: number;
  isVerifiedPro: boolean;
  plan: SubscriptionPlan;
  rating?: number;
  totalReviews?: number;
};
