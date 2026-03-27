import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PricingCard from '../components/PricingCard';

// Expo LinearGradient can be mocked to render children directly in tests
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

test('PricingCard renders and triggers onPress', () => {
  const onPress = jest.fn();
  const utils = render(
    <PricingCard
      title="Pro"
      subtitle="Best plan"
      price="$10"
      features={["Feature A", "Feature B"]}
      buttonLabel="Buy"
      onPress={onPress}
    />
  );

  expect(utils.toJSON()).toBeTruthy();
  // Press the button and ensure handler is called
  fireEvent.press(utils.getByText('Buy'));
  expect(onPress).toHaveBeenCalled();
});
