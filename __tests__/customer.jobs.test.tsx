describe('CustomerJobs module', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('module loads as a function', () => {
    jest.doMock('expo-router', () => ({ router: { push: jest.fn() } }));
    jest.doMock('../lib/supabase', () => ({ supabase: { from: () => ({ select: () => ({ in: () => ({ in: () => ({ then: (fn: any) => fn({ data: [] }) }) }) }) }) } }));
    jest.doMock('../context/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }));
    jest.doMock('../context/JobsContext', () => ({ useJobs: () => ({ jobs: [], loading: false, fetchJobs: jest.fn(), closeApplications: jest.fn() }) }));

    const RN = require('react-native');
    RN.Dimensions = { get: () => ({ width: 400, height: 800 }) };

    const Jobs = require('../app/customer/jobs').default;
    expect(typeof Jobs).toBe('function');
  });
});
