import React from 'react';
// Ensure our react-native mock is used before testing-library imports it.
jest.mock('react-native', () => require('../__mocks__/react-native.js'));
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

import PostJobScreen from '../../app/customer/post-job';

test('PostJobScreen posts a job and navigates to customer jobs', async () => {
  const { getByPlaceholderText, getByText, queryByText } = render(<PostJobScreen />);

  // Fill required inputs
  const titleInput = getByPlaceholderText('e.g. Fix leaking kitchen tap');
  fireEvent.changeText(titleInput, 'Fix leaking kitchen tap in kitchen sink');

  const descriptionInput = getByPlaceholderText('Describe the job in detail (at least 30 characters)...');
  fireEvent.changeText(descriptionInput, 'The sink is leaking badly from the faucet and needs replacement.');

  const budgetInput = getByPlaceholderText('Enter your budget (min £10)');
  fireEvent.changeText(budgetInput, '50');

  // Submit
  const postButton = getByText('Post Job');
  fireEvent.press(postButton);

  await waitFor(() => {
    expect(mockInsert).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/customer/jobs');
    expect(queryByText('Success')).toBeNull(); // Alert not rendered in RN testing environment
  });
});
