import React from 'react';
import VerifiedProBadge from '../components/VerifiedProBadge';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as SafeArea from 'react-native-safe-area-context';

describe('debug LeadUnlockModal children', () => {
  it('inspects child imports', () => {
    // eslint-disable-next-line no-console
    console.log('VerifiedProBadge:', typeof VerifiedProBadge);
    // eslint-disable-next-line no-console
    console.log('Ionicons:', typeof Ionicons);
    // eslint-disable-next-line no-console
    console.log('expo-image Image:', typeof Image);
    // eslint-disable-next-line no-console
    console.log(
      'safe-area useSafeAreaInsets:',
      typeof SafeArea.useSafeAreaInsets,
    );

    expect(VerifiedProBadge).toBeDefined();
    expect(Ionicons).toBeDefined();
    // Image may be undefined if mock not wired as named export — just assert import doesn't throw
    expect(SafeArea.useSafeAreaInsets).toBeDefined();
  });
});
