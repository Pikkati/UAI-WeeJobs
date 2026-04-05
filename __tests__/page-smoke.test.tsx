import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

// Lightweight runtime-safe mocks so pages can mount in Jest without full native env
jest.mock(
  '../lib/supabase',
  () => {
    const noop = { data: [], error: null };
    const noopResult = Promise.resolve(noop);
    const chainable = () => {
      const obj: any = {};
      const methods = [
        'select',
        'order',
        'eq',
        'in',
        'single',
        'update',
        'insert',
        'limit',
        'match',
        'ilike',
        'neq',
        'gte',
        'lte',
        'or',
      ];
      methods.forEach((m) => {
        obj[m] = function () {
          return obj;
        };
      });
      obj.then = function (resolve: any) {
        return noopResult.then(resolve);
      };
      obj.catch = function (fn: any) {
        return noopResult.catch(fn);
      };
      return obj;
    };

    return {
      supabase: {
        from: chainable,
        functions: { invoke: async () => ({ data: null, error: null }) },
      },
      Job: undefined,
      JobStatus: undefined,
    };
  },
  { virtual: true },
);
jest.mock(
  '../context/JobsContext',
  () => ({
    JobsProvider: ({ children }) => children,
    useJobs: () => ({
      jobs: [],
      loading: false,
      fetchJobs: () => Promise.resolve(),
      closeApplications: () => Promise.resolve(true),
    }),
  }),
  { virtual: true },
);

jest.mock(
  '../context/AuthContext',
  () => ({
    AuthProvider: ({ children }) => children,
    useAuth: () => ({
      user: null,
      login: async () => ({ success: false }),
      signup: async () => ({ success: false }),
    }),
  }),
  { virtual: true },
);
jest.mock(
  'expo-router',
  () => ({
    useRouter: () => ({ push: () => {} }),
    useLocalSearchParams: () => ({}),
  }),
  { virtual: true },
);

const pages = [
  '../app/public-profile',
  '../app/admin/index',
  '../app/customer/post-job',
  '../app/onboarding/login',
  '../app/onboarding/signup',
  '../app/tradie/index',
  '../app/index',
  '../app/job/pay-final',
  '../app/customer/jobs',
  '../app/tradie/home',
];

describe('page smoke: render selected app pages', () => {
  pages.forEach((p) => {
    it(`renders ${p}`, async () => {
      // Require then render the default export if present
      // Any thrown error should surface so we can add targeted mocks.
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const mod = require(p);
      const Comp = mod && (mod.default || mod);
      if (!Comp) {
        expect(mod).toBeTruthy();
        return;
      }

      // render the component; many pages are resilient to being mounted with mocks above
      const { toJSON } = render(React.createElement(Comp));
      await waitFor(() => {
        expect(toJSON()).toBeDefined();
      });
    });
  });
});
