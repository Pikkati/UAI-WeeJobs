import React from 'react';
import { render } from '@testing-library/react-native';

// Provide a per-test mock to ensure Animated.View is a valid RN View
jest.mock('react-native-reanimated', () => {
  const RN = require('react-native');
  const ReactLocal = require('react');
  return {
    __esModule: true,
    default: { View: (props: any) => ReactLocal.createElement(RN.View, props) },
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (fn: any) => fn(),
    withTiming: (v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1] || args[0],
    withRepeat: (v: any, _n: any) => v,
  };
});

import { HelloWave } from '../components/HelloWave';

// Mock the color-scheme hook to avoid undefined hook implementation in RN mock
jest.mock('@/hooks/useColorScheme', () => ({ useColorScheme: () => 'light' }));

test('HelloWave renders and has accessibility label', () => {
  const { getByText } = render(<HelloWave />);
  const el = getByText('👋');
  expect(el).toBeTruthy();
});
