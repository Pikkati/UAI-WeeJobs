import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

let supabaseUrl = '';
let supabaseAnonKey = '';

try {
  // Defensive access to process.env for test environments where `process` may be proxied or missing
  const proc: any = typeof process !== 'undefined' ? process : (globalThis as any).process;
  if (proc && proc.env) {
    supabaseUrl = proc.env.EXPO_PUBLIC_SUPABASE_URL || '';
    supabaseAnonKey = proc.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  }
} catch (e) {
  // ignore and keep empty strings
}

if (supabaseUrl && !supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

// If environment variables are missing, export a lightweight mock-compatible supabase
// object to avoid throwing during test imports. In real environments the client
// will be created normally when env vars are present.
const _fallbackSupabase = {
  from: () => ({
    select: () => ({
      order: () => Promise.resolve({ data: [], error: null }),
      eq: () => Promise.resolve({ data: [], error: null }),
      in: () => Promise.resolve({ data: [], error: null }),
      single: () => Promise.resolve({ data: null, error: null }),
    }),
    update: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
  }),
  functions: { invoke: async () => ({ data: null, error: null }) },
} as any;

// Prefer a test-provided supabase mock when available (set via global.__TEST_SUPABASE__ in jest setup)
export const supabase = ((): any => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g: any = typeof global !== 'undefined' ? (global as any) : (globalThis as any);
    if (g && g.__TEST_SUPABASE__) return g.__TEST_SUPABASE__;
  } catch (e) {
    // ignore
  }

  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  return _fallbackSupabase;
})();

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

export type InterestStatus = 'interested' | 'shortlisted' | 'selected' | 'rejected' | 'withdrawn';

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
