import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import VerifiedProBadge from './VerifiedProBadge';

interface PricingCardProps {
  title: string;
  subtitle: string;
  price?: string;
  features: string[];
  buttonLabel: string;
  onPress: () => void;
  highlight?: boolean;
  ribbonText?: string;
  showBadge?: boolean;
}

export default function PricingCard({
  title,
  subtitle,
  price,
  features,
  buttonLabel,
  onPress,
  highlight = false,
  ribbonText,
  showBadge = false,
}: PricingCardProps) {
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (highlight) {
      return (
        <LinearGradient
          colors={[Colors.accent, '#f59e0b', Colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={styles.highlightInner}>{children}</View>
        </LinearGradient>
      );
    }
    return <View style={styles.card}>{children}</View>;
  };

  return (
    <View style={[styles.container, highlight && styles.containerHighlight]}>
      {ribbonText && (
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>{ribbonText}</Text>
        </View>
      )}
      
      <CardWrapper>
        <View style={styles.content}>
          {!highlight && (
            <View style={styles.labelBadge}>
              <Text style={styles.labelBadgeText}>PAYG</Text>
            </View>
          )}
          
          {showBadge && (
            <View style={styles.proBadgeContainer}>
              <VerifiedProBadge size="medium" />
            </View>
          )}
          
          <Text style={[styles.title, highlight && styles.titleHighlight]}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          
          {price && (
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{price}</Text>
              <Text style={styles.priceUnit}>/month</Text>
            </View>
          )}
          
          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={[styles.checkIcon, highlight && styles.checkIconHighlight]}>
                  <Ionicons name="checkmark" size={14} color={highlight ? Colors.background : Colors.success} />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.button, highlight && styles.buttonHighlight]} 
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, highlight && styles.buttonTextHighlight]}>
              {buttonLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </CardWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  containerHighlight: {
    marginBottom: Spacing.xl,
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gradientBorder: {
    borderRadius: BorderRadius.xl + 3,
    padding: 3,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  highlightInner: {
    backgroundColor: '#f8fafc',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  content: {
    padding: Spacing.xl,
  },
  ribbon: {
    position: 'absolute',
    top: -10,
    left: -10,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    zIndex: 10,
    transform: [{ rotate: '-5deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ribbonText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  labelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  labelBadgeText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  proBadgeContainer: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: Spacing.xs,
  },
  titleHighlight: {
    fontSize: 26,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: Spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1e293b',
  },
  priceUnit: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 4,
  },
  featuresList: {
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  checkIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  checkIconHighlight: {
    backgroundColor: Colors.accent,
  },
  featureText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  button: {
    backgroundColor: Colors.background,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  buttonHighlight: {
    backgroundColor: Colors.accent,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextHighlight: {
    color: Colors.white,
  },
});
