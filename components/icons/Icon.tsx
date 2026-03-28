import React from 'react';
import { View } from 'react-native';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
};

// Minimal Icon scaffold: replace with real SVG imports or an icon system later.
export function Icon({ name, size = 24, color = '#000', accessibilityLabel }: IconProps) {
  // Placeholder implementation to keep module-load safe in tests.
  return <View accessibilityLabel={accessibilityLabel || `icon-${name}`} style={{ width: size, height: size }} />;
}

export default Icon;
