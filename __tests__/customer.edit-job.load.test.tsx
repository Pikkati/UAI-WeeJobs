import React from 'react';
import { render } from '@testing-library/react-native';

// Mock expo-router to provide a jobId param and a router stub
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ jobId: 'j1' }),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}), { virtual: true });

describe('EditJobScreen load flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line no-undef
    const g: any = typeof global !== 'undefined' ? global : (globalThis as any);
    if (g && g.__TEST_SUPABASE__ && typeof g.__TEST_SUPABASE__.setResponse === 'function') {
      g.__TEST_SUPABASE__.setResponse('jobs', [
        {
          id: 'j1',
          customer_id: 'c1',
          name: 'Seeded Name',
          phone: '0123456789',
          email: 'x@example.com',
          area: 'Test Area',
          category: 'plumbing',
          description: 'Fix sink',
          timing: 'ASAP',
          budget: '£100',
          photos: [],
          status: 'open',
          is_garage_clearance: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    }
  });

  test('renders and pre-fills job fields from supabase', async () => {
    const EditJobScreen = require('../app/customer/edit-job').default;
    const { findByDisplayValue, getByText } = render(<EditJobScreen />);

    // Wait for name input to be populated with seeded value
    const nameInput = await findByDisplayValue('Seeded Name');
    expect(nameInput).toBeTruthy();

    // Header should render
    expect(getByText('Edit Job')).toBeTruthy();
  });
});
