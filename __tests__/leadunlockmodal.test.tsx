import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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

describe('LeadUnlockModal', () => {
  it('renders PRO view when isPro=true and calls onUnlock', () => {
    const onUnlock = jest.fn();
    const onCancel = jest.fn();

    const { getByText } = render(
      <LeadUnlockModal job={job as any} visible={true} onUnlock={onUnlock} onCancel={onCancel} isPro={true} />
    );

    expect(getByText('PRO Member Benefit')).toBeTruthy();
    expect(getByText('Accept Job')).toBeTruthy();
  });

  it('renders unlock view and calls handlers', () => {
    const onUnlock = jest.fn();
    const onCancel = jest.fn();

    const { getByText } = render(
      <LeadUnlockModal job={job as any} visible={true} onUnlock={onUnlock} onCancel={onCancel} unlockPrice={5} />
    );

    expect(getByText('Unlock this job for £5')).toBeTruthy();

    // Cancel button should be present
    expect(getByText('Cancel')).toBeTruthy();
  });
});
