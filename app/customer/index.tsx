import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
// eslint-disable-next-line import/no-unresolved
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { JOB_CATEGORIES, CATEGORY_ICONS } from '../../constants/data';
import { supabase, Job } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const GRID_ITEM_SIZE = (width - Spacing.xl * 2 - Spacing.md * 2) / 3;

export default function CustomerHome() {
  const { user } = useAuth();

  const [query, setQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null,
  );
  const [results, setResults] = React.useState<Job[]>([]);
  const [searching, setSearching] = React.useState(false);

  const handleCategoryPress = (category: string) => {
    // If user taps a category from grid, pre-filter search
    setSelectedCategory(category === selectedCategory ? null : category);
    router.push({ pathname: '/customer/post-job', params: { category } });
  };

  const runSearch = async () => {
    setSearching(true);
    try {
      let qb = supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      if (selectedCategory) qb = qb.eq('category', selectedCategory);
      if (query && query.trim()) {
        const q = `%${query.trim()}%`;
        qb = qb.or(`name.ilike.${q},description.ilike.${q}`);
      }
      const { data, error } = await qb;
      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
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

      <View style={{ marginBottom: Spacing.lg }}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs or description"
          placeholderTextColor={Colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={runSearch}
        />
        <View
          style={{
            flexDirection: 'row',
            gap: Spacing.md,
            marginTop: Spacing.sm,
          }}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory === null && styles.filterButtonActive,
            ]}
            onPress={() => {
              setSelectedCategory(null);
              runSearch();
            }}
          >
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>
          {JOB_CATEGORIES.slice(0, 6).map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.filterButton,
                selectedCategory === c && styles.filterButtonActive,
              ]}
              onPress={() => {
                setSelectedCategory(selectedCategory === c ? null : c);
              }}
            >
              <Text style={styles.filterText}>{c}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.searchRunButton} onPress={runSearch}>
            <Ionicons name="search" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginBottom: Spacing.lg }}>
        <Text style={styles.sectionTitle}>Search Results</Text>
        {searching ? (
          <ActivityIndicator color={Colors.accent} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultCard}
                onPress={() => router.push(`/job/${item.id}`)}
              >
                <Text style={styles.resultTitle}>{item.name}</Text>
                <Text style={styles.resultMeta}>
                  {item.area} • {item.category}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No jobs found</Text>
            }
          />
        )}
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
  searchInput: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
  },
  filterButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  filterButtonActive: {
    backgroundColor: Colors.accent,
  },
  filterText: {
    color: Colors.textSecondary,
  },
  searchRunButton: {
    backgroundColor: Colors.accent,
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultTitle: {
    color: Colors.white,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultMeta: {
    color: Colors.textSecondary,
  },
  emptyText: {
    color: Colors.textSecondary,
    padding: Spacing.md,
  },
});
