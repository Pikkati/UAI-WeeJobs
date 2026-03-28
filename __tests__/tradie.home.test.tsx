import React from 'react';

jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1', name: 'Test' }, isLoading: false }) }));
jest.mock('../context/JobsContext', () => ({ useJobs: () => ({ jobs: [] }) }));

test('Tradie home module loads', () => {
  const RN = require('react-native');
  RN.Dimensions = { get: () => ({ width: 400, height: 800 }) };
  const TradieHome = require('../app/tradie/home').default;
  expect(typeof TradieHome).toBe('function');
});
