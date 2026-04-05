describe('CustomerDashboard module', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('module loads as a function', () => {
    jest.doMock('expo-router', () => ({ router: { push: jest.fn() } }));
    jest.doMock('../context/AuthContext', () => ({
      useAuth: () => ({ user: { id: 'u1' } }),
    }));
    jest.doMock('../context/JobsContext', () => ({
      useJobs: () => ({ jobs: [], loading: false }),
    }));

    const RN = require('react-native');
    RN.Dimensions = { get: () => ({ width: 400, height: 800 }) };

    const Dashboard = require('../app/customer/dashboard').default;
    expect(typeof Dashboard).toBe('function');
  });
});
