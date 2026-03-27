import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { JOB_CATEGORIES, CATEGORY_ICONS } from '../../constants/data';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const GRID_ITEM_SIZE = (width - Spacing.xl * 2 - Spacing.md * 2) / 3;

export default function CustomerHome() {
  const { user } = useAuth();

  const handleCategoryPress = (category: string) => {
    router.push({
      pathname: '/customer/post-job',
      params: { category },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: Spacing.md }]}
    >
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/weejobs-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <View style={styles.hero}>
        <Text style={styles.greeting}>Hi {user?.name || 'there'}!</Text>
        <Text style={styles.heroTitle}>No Job Too Wee</Text>
        <Text style={styles.heroSubtitle}>Serving Causeway Coast & Glens</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>380+</Text>
          <Text style={styles.statLabel}>Jobs Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>50+</Text>
          <Text style={styles.statLabel}>Local Trades</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>What do you need help with?</Text>

      <View style={styles.grid}>
        {JOB_CATEGORIES.slice(0, 9).map((category) => (
          <TouchableOpacity
            key={category}
            style={styles.gridItem}
            onPress={() => handleCategoryPress(category)}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={(CATEGORY_ICONS[category] || 'build') as any}
                size={28}
                color={Colors.accent}
              />
            </View>
            <Text style={styles.categoryText} numberOfLines={2}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.postJobButton}
        onPress={() => router.push('/customer/post-job')}
      >
        <Ionicons name="add-circle" size={24} color={Colors.background} />
        <Text style={styles.postJobButtonText}>Post a Job</Text>
      </TouchableOpacity>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 150,
    height: 50,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: '800',
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: Colors.accent,
    fontSize: 32,
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryText: {
    color: Colors.white,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  postJobButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  postJobButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
