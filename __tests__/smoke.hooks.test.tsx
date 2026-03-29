import React, { useState } from 'react';
import { render } from '@testing-library/react-native';

test('react hooks basic smoke', () => {
  function TestComp() {
    const [n] = useState(0);
    return null;
  }

  const { unmount } = render(<TestComp />);
  unmount();
});
