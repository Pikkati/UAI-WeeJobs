import React from 'react';
jest.mock('react-native');
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock auth to provide a signed-in user
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', name: 'Test User', phone: '0123456789', area: 'Test Area' },
  }),
}));

// Mock router to capture navigation
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
  router: { push: mockPush },
}));

// Mock supabase insert
const mockInsert = jest.fn(async () => ({ data: null, error: null }));
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: (table: string) => ({ insert: mockInsert }),
  },
}));

// Silence ImagePicker and expo-image imports used in the component
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn(async () => ({ canceled: true })) }));
jest.mock('expo-image', () => {
  const React = require('react');
  return { Image: (props: any) => React.createElement('Image', props) };
});

import PostJobScreen from '../app/customer/post-job';

test('PostJobScreen posts a job and navigates to customer jobs', async () => {
  const initial = {
    title: 'Fix leaking kitchen tap in kitchen sink',
    description: 'The sink is leaking badly from the faucet and needs replacement.',
    budget: '50',
    timing: 'This Week',
    category: 'Plumbing',
    area: 'Test Area',
  };

  const { getByPlaceholderText, getByTestId } = render(<PostJobScreen testInitialValues={initial} />);

  const titleInput = getByPlaceholderText('e.g. Fix leaking kitchen tap');
  expect(titleInput.props.value).toBe(initial.title);

  const descriptionInput = getByPlaceholderText('Describe the job in detail (at least 30 characters)...');
  expect(descriptionInput.props.value).toBe(initial.description);

  const budgetInput = getByPlaceholderText('Enter your budget (min £10)');
  expect(budgetInput.props.value).toBe(initial.budget);

  const submit = getByTestId('post-job-submit');
  fireEvent.press(submit);

  await waitFor(() => {
    expect(mockInsert).toHaveBeenCalled();
  });
});
