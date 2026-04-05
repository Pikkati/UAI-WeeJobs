import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock supabase for the report submission flow
jest.mock('../lib/supabase', () => {
  const insertMock = jest.fn(async () => ({ error: null }));
  const fromMock = jest.fn(() => ({ insert: insertMock }));
  return { supabase: { from: fromMock } };
});

import LeadUnlockModal from '../components/LeadUnlockModal';

const job = {
  id: 'j1',
  category: 'plumbing',
  area: 'Test Area',
  timing: 'ASAP',
  budget: '£100',
  description: 'Fix sink',
  photos: [],
};

describe('LeadUnlockModal reporting flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('opens report UI, selects a reason, and submits report', async () => {
    const onUnlock = jest.fn();
    const onCancel = jest.fn();

    const { getByText } = render(
      <LeadUnlockModal
        job={job as any}
        visible={true}
        onUnlock={onUnlock}
        onCancel={onCancel}
        tradieId="t1"
      />,
    );

    // Open report UI
    const reportBtn = getByText('Report this job');
    fireEvent.press(reportBtn);

    // Select a reason
    const reason = getByText('Fake or suspicious job');
    fireEvent.press(reason);

    // Submit report
    const submit = getByText('Submit Report');
    fireEvent.press(submit);

    // Wait for Alert to be called indicating success path
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });
});
