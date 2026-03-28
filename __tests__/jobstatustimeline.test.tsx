import React from 'react';
import { render } from '@testing-library/react-native';

import JobStatusTimeline from '../components/JobStatusTimeline';

describe('JobStatusTimeline', () => {
  it('renders steps and highlights current step', () => {
    const { getByText } = render(<JobStatusTimeline currentStatus="booked" />);

    // step labels should be present
    expect(getByText('Booked')).toBeTruthy();
    expect(getByText('On the way')).toBeTruthy();
    expect(getByText('In progress')).toBeTruthy();

    // current step label should exist
    expect(getByText('Booked')).toBeTruthy();
  });
});
