import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

import StripeCheckoutStub from '../components/StripeCheckoutStub';

describe('StripeCheckoutStub', () => {
  it('calls onSuccess after processing payment', async () => {
    const onSuccess = jest.fn();
    const onCancel = jest.fn();

    const { getByText } = render(
      <StripeCheckoutStub
        visible={true}
        amount={12.34}
        description="Test payment"
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    );

    const payButton = getByText('Pay £12.34');
    // Use fake timers only for the internal payment delay to avoid
    // interfering with testing-library's global cleanup hooks.
    jest.useFakeTimers();
    try {
      await act(async () => {
        fireEvent.press(payButton);
        // advance timers past the internal 1500ms delay
        jest.advanceTimersByTime(1600);
        // allow any pending promises to resolve
        await Promise.resolve();
      });

      expect(onSuccess).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('calls onCancel when Cancel pressed', () => {
    const onSuccess = jest.fn();
    const onCancel = jest.fn();

    const { getByText } = render(
      <StripeCheckoutStub
        visible={true}
        amount={5}
        description="Cancel test"
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
