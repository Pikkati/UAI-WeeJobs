import React from 'react';
import { render } from '@testing-library/react-native';
import Icon from '../components/icons/Icon';

describe('Icon', () => {
  it('renders a supported WeeJobs icon with an accessibility label', () => {
    const { getByLabelText } = render(
      <Icon name="home" size={24} color="#ffffff" accessibilityLabel="home icon" />
    );

    expect(getByLabelText('home icon')).toBeTruthy();
  });

  it('renders nothing for an unsupported icon name', () => {
    const { toJSON } = render(<Icon name="not-supported" />);

    expect(toJSON()).toBeNull();
  });
});
