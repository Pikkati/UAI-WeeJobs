import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

// Provide a test supabase client before importing the component so any
// call-time resolution will pick up this predictable shape.
const job = {
  id: 'job1',
  customer_id: 'c1',
  name: 'Test Job',
  phone: '123',
  area: 'Test Area',
  category: 'plumbing',
  timing: 'ASAP',
  status: 'open',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

beforeEach(() => {
  const chain: any = {
    select: (..._args: any[]) => chain,
    order: (..._args: any[]) => chain,
    then: (onFulfilled: any) => Promise.resolve({ data: [job], error: null }).then(onFulfilled),
    catch: (onRejected: any) => Promise.resolve({ data: [job], error: null }).catch(onRejected),
  };

  // Test override used by lib/supabase.resolveClient
  (global as any).__TEST_SUPABASE__ = {
    from: (_table: string) => chain,
  };
});

describe('AdminJobsScreen module', () => {
  it('can be required and exports a component', async () => {
    // Import after setting __TEST_SUPABASE__ so resolveClient uses the override
    // eslint-disable-next-line global-require
    const AdminJobsModule = require('../app/admin/jobs');
    const Comp = AdminJobsModule && AdminJobsModule.default ? AdminJobsModule.default : AdminJobsModule;
    expect(typeof Comp === 'function' || typeof Comp === 'object').toBeTruthy();
  });
});
