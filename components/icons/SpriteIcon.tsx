import React from 'react';
import { Icon } from './Icon';

type SpriteIconProps = {
  id: string; // icon name without prefix, e.g. 'search-outline'
  size?: number;
  color?: string;
  accessibilityLabel?: string;
};

// Minimal inline <Svg> usage is omitted to keep dependency-free; this component
// renders a placeholder View when running in test environments. Replace with
// an actual <SvgUri> or inline svg handling in the app runtime.
export function SpriteIcon({
  id,
  size = 24,
  color = '#000',
  accessibilityLabel,
}: SpriteIconProps) {
  return (
    <Icon
      name={id}
      size={size}
      color={color}
      accessibilityLabel={accessibilityLabel || `sprite-icon-${id}`}
    />
  );
}

export default SpriteIcon;
