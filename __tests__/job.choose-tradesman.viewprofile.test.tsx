import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => 'Icon' }));

const mockJob = {
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

// Provide JobsContext mock
jest.doMock(require.resolve('../context/JobsContext'), () => ({ useJobs: () => mockJob }));

// Expose mockRouterPush so factory can reference it (name starts with "mock")
const mockRouterPush = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ jobId: 'job-123' }),
  useRouter: () => ({ push: mockRouterPush, back: jest.fn() }),
}), { virtual: true });

describe('ChooseTradesmanScreen view-profile', () => {
  beforeEach(() => {
    mockJob.fetchInterests.mockClear();
    mockJob.selectTradesman.mockClear();
    mockRouterPush.mockClear();
  });

  it('navigates to public profile when card pressed', async () => {
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

    const { getByText } = render(<Screen _testInterests={testInterests} />);

    await waitFor(() => expect(getByText('1 tradesperson interested in your job')).toBeTruthy());

    // Press the tradie name (inside the card) to trigger the outer onPress
    fireEvent.press(getByText('Alice'));

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/public-profile?tradieId=t1&jobId=job-123');
    });
  });
});
