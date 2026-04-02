import { supabase } from './supabase';

export type PostJobPayload = {
  customer_id?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  area: string;
  category: string;
  title: string;
  description: string;
  timing: string;
  budget: string;
  photos?: string[] | null;
  status?: string;
  is_garage_clearance?: boolean;
};

export async function postJob(payload: PostJobPayload) {
  // Support test environments that override/replace the exported `supabase`
  // by requiring at runtime. This mirrors patterns used elsewhere in the app
  // so tests can provide a mock implementation.
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  const runtimeLib: any = require('./supabase');
  const client = (runtimeLib && runtimeLib.supabase) || supabase;

  const fromObj: any = client && typeof client.from === 'function' ? client.from('jobs') : null;
  if (!fromObj || typeof fromObj.insert !== 'function') {
    throw new Error('supabase.from did not return an insert-capable object');
  }

  const res = await fromObj.insert(payload);
  return res;
}
