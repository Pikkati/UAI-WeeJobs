import React from 'react';
import { ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

type SupportedIconName =
  | 'search'
  | 'home'
  | 'briefcase'
  | 'chatbubbles'
  | 'person'
  | 'user-circle'
  | 'settings'
  | 'arrow-back'
  | 'chevron-back'
  | 'home-outline'
  | 'briefcase-outline'
  | 'chatbubbles-outline';

function normalizeName(name: string): SupportedIconName | null {
  const aliases: Record<string, SupportedIconName> = {
    search: 'search',
    home: 'home',
    'home-outline': 'home-outline',
    briefcase: 'briefcase',
    'briefcase-outline': 'briefcase-outline',
    chatbubbles: 'chatbubbles',
    'chatbubbles-outline': 'chatbubbles-outline',
    person: 'person',
    'user-circle': 'user-circle',
    settings: 'settings',
    'arrow-back': 'arrow-back',
    'chevron-back': 'chevron-back',
  };

  return aliases[name] ?? null;
}

export function Icon({
  name,
  size = 24,
  color = '#000',
  accessibilityLabel,
  style,
}: IconProps) {
  const normalizedName = normalizeName(name);
  if (!normalizedName) return null;

  const strokeWidth = 1.8;

  return (
    <Svg
      accessibilityLabel={accessibilityLabel || `icon-${name}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      {normalizedName === 'search' ? (
        <>
          <Circle cx="11" cy="11" r="6.25" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M16 16L20 20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </>
      ) : null}
      {normalizedName === 'home' || normalizedName === 'home-outline' ? (
        <>
          <Path d="M4 10.5L12 4L20 10.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M6.5 9.5V19H17.5V9.5" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M10 19V13H14V19" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        </>
      ) : null}
      {normalizedName === 'briefcase' || normalizedName === 'briefcase-outline' ? (
        <>
          <Rect x="4" y="7" width="16" height="11" rx="2.5" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M9 7V5.75C9 5.06 9.56 4.5 10.25 4.5H13.75C14.44 4.5 15 5.06 15 5.75V7" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M4 11.5H20" stroke={color} strokeWidth={strokeWidth} />
        </>
      ) : null}
      {normalizedName === 'chatbubbles' || normalizedName === 'chatbubbles-outline' ? (
        <>
          <Path d="M7 16.5H6C4.9 16.5 4 15.6 4 14.5V7C4 5.9 4.9 5 6 5H13C14.1 5 15 5.9 15 7V14.5C15 15.6 14.1 16.5 13 16.5H10L7 19V16.5Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M15 9H18C19.1 9 20 9.9 20 11V16C20 17.1 19.1 18 18 18H16L13.5 20V18" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        </>
      ) : null}
      {normalizedName === 'person' || normalizedName === 'user-circle' ? (
        <>
          <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M7.8 17C8.85 15.25 10.3 14.4 12 14.4C13.7 14.4 15.15 15.25 16.2 17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </>
      ) : null}
      {normalizedName === 'settings' ? (
        <>
          <Circle cx="12" cy="12" r="2.75" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M12 4.5V6.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Path d="M12 17.8V19.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Path d="M19.5 12H17.8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Path d="M6.2 12H4.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Path d="M17.3 6.7L16.1 7.9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Path d="M7.9 16.1L6.7 17.3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Path d="M17.3 17.3L16.1 16.1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Path d="M7.9 7.9L6.7 6.7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </>
      ) : null}
      {normalizedName === 'arrow-back' || normalizedName === 'chevron-back' ? (
        <>
          <Path d="M19 12H6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Path d="M11 7L6 12L11 17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
    </Svg>
  );
}

export default Icon;
