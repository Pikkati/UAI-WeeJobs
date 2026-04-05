import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => 'Icon' }));

// Provide a stable test override for useJobs so the component sees the same
// function identities across renders (avoids effect re-run loops).
const jobMock = {
  // Return synchronously to avoid microtask timing causing transient state issues
  fetchInterests: jest.fn().mockImplementation(() => [
    {
      id: 'i1',
      job_id: 'job-123',
      tradie_id: 't1',
      status: 'interested',
      unlock_fee_paid: false,
      unlock_fee_amount: 0,
      is_pro_at_time: false,
      distance_miles: 2.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tradie: {
        id: 't1',
        name: 'Alice',
        is_verified_pro: true,
        average_rating: 4.5,
        total_reviews: 12,
        subscription_plan: 'payg',
        jobs_completed: 20,
      },
    },
  ]),
  selectTradesman: jest.fn().mockResolvedValue(true),
};

// Mock the JobsContext directly to ensure the component receives the
// stable override regardless of import/eval order.
// Use require.resolve so the mock targets the exact module file path
jest.doMock(require.resolve('../context/JobsContext'), () => ({
  useJobs: () => jobMock,
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ jobId: 'job-123' }),
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

describe('ChooseTradesmanScreen', () => {
  it('renders interests and selects a tradie', async () => {
    const Screen = require('../app/job/choose-tradesman').default;
    const testInterests = [
      {
        id: 'i1',
        job_id: 'job-123',
        tradie_id: 't1',
        status: 'interested',
        unlock_fee_paid: false,
        unlock_fee_amount: 0,
        is_pro_at_time: false,
        distance_miles: 2.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tradie: {
          id: 't1',
          name: 'Alice',
          is_verified_pro: true,
          average_rating: 4.5,
          total_reviews: 12,
          subscription_plan: 'payg',
          jobs_completed: 20,
        },
      },
    ];

    const { getByText, queryByText } = render(
      <Screen _testInterests={testInterests} />,
    );

    await waitFor(() =>
      expect(getByText('1 tradesperson interested in your job')).toBeTruthy(),
    );

    // Select & Book -> should call selectTradesman with jobId, tradieId and pricingType
    fireEvent.press(getByText('Select & Book'));

    await waitFor(() => {
      expect(jobMock.selectTradesman).toHaveBeenCalledWith(
        'job-123',
        't1',
        'fixed',
      );
    });
  });
});
