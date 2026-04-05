import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

interface VerifiedProBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function VerifiedProBadge({
  size = 'medium',
  showText = true,
}: VerifiedProBadgeProps) {
  const iconSizes = { small: 14, medium: 18, large: 24 };
  const textSizes = { small: 10, medium: 12, large: 14 };
  const paddingSizes = { small: 4, medium: 6, large: 8 };

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: paddingSizes[size],
          paddingVertical: paddingSizes[size] - 2,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { width: iconSizes[size] + 4, height: iconSizes[size] + 4 },
        ]}
      >
        <Ionicons
          name="checkmark"
          size={iconSizes[size]}
          color={Colors.white}
        />
      </View>
      {showText && (
        <Text style={[styles.text, { fontSize: textSizes[size] }]}>
          Verified Pro
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  iconContainer: {
    backgroundColor: Colors.background,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.white,
    fontWeight: '700',
  },
});
