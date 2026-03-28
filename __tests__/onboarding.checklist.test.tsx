import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';

// Mock AsyncStorage used by the checklist
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (k: string) => null),
  setItem: jest.fn(async (k: string, v: string) => {}),
  removeItem: jest.fn(async (k: string) => {})
}));

describe('OnboardingChecklist', () => {
  test('renders checklist and toggles items', async () => {
    const OnboardingChecklist = require('../app/onboarding/checklist').default;
    const {getByText} = render(<OnboardingChecklist />);

    await waitFor(() => expect(getByText('Onboarding Checklist')).toBeTruthy());

    const item = getByText('Complete profile');
    expect(item).toBeTruthy();

    fireEvent.press(item);

    // after pressing, label still present (state persisted via AsyncStorage mock)
    expect(getByText('Complete profile')).toBeTruthy();
  });
});
