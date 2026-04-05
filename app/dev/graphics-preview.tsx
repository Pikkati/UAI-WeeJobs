import { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GraphicsAssetCard from '../../components/dev/GraphicsAssetCard';
import GraphicsPreviewSection from '../../components/dev/GraphicsPreviewSection';
import Icon from '../../components/icons/Icon';
import {
  getGraphicsAssetSource,
  getGraphicsManifest,
  getGraphicsManifestSummary,
} from '../../lib/assets/graphicsManifest';
import {
  BorderRadius,
  Colors,
  Spacing,
  darkColors,
  lightColors,
} from '../../constants/theme';

export default function GraphicsPreviewScreen() {
  const insets = useSafeAreaInsets();
  const manifest = getGraphicsManifest();
  const summary = getGraphicsManifestSummary();
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('dark');
  const [rtlEnabled, setRtlEnabled] = useState(false);
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState(true);
  const palette = previewTheme === 'dark' ? darkColors : lightColors;

  const shippedAssets = useMemo(
    () => manifest.assets.filter((asset) => asset.status === 'shipped'),
    [manifest.assets]
  );
  const legacyAssets = useMemo(
    () => manifest.assets.filter((asset) => asset.status === 'legacy'),
    [manifest.assets]
  );
  const partnerReadyAssets = useMemo(
    () =>
      manifest.assets.filter(
        (asset) =>
          asset.status === 'shipped' &&
          Boolean(asset.sourceReference) &&
          /\.(svg|json)$/i.test(asset.path)
      ),
    [manifest.assets]
  );
  const starterIcons = [
    'search',
    'home',
    'briefcase',
    'chatbubbles',
    'person',
    'settings',
    'arrow-back',
  ] as const;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: palette.background }]}>
      <View style={[styles.header, { borderBottomColor: palette.border }]}> 
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={palette.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: palette.text }]}>Graphics Preview</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <GraphicsPreviewSection
          title="Coverage snapshot"
          subtitle="Manifest coverage is now explicit for shipped assets, while missing design-system items stay visible as gaps instead of getting lost in the sofa cushions."
        >
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, { borderColor: palette.border, backgroundColor: palette.card }]}>
              <Text style={[styles.summaryValue, { color: palette.text }]}>{summary.shippedCount}</Text>
              <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>shipped assets</Text>
            </View>
            <View style={[styles.summaryCard, { borderColor: palette.border, backgroundColor: palette.card }]}>
              <Text style={[styles.summaryValue, { color: palette.text }]}>{summary.legacyCount}</Text>
              <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>legacy assets</Text>
            </View>
            <View style={[styles.summaryCard, { borderColor: palette.border, backgroundColor: palette.card }]}>
              <Text style={[styles.summaryValue, { color: palette.text }]}>{summary.missingCount}</Text>
              <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>missing graphics</Text>
            </View>
          </View>
        </GraphicsPreviewSection>

        <GraphicsPreviewSection
          title="Preview controls"
          subtitle="These toggles are local to the playground so designers and frontend can review variants without mutating the whole app theme state."
        >
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: palette.text }]}>Light preview</Text>
            <Switch
              value={previewTheme === 'light'}
              onValueChange={(value) => setPreviewTheme(value ? 'light' : 'dark')}
              trackColor={{ false: palette.border, true: Colors.accent }}
              thumbColor={Colors.white}
            />
          </View>
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: palette.text }]}>RTL review marker</Text>
            <Switch
              value={rtlEnabled}
              onValueChange={setRtlEnabled}
              trackColor={{ false: palette.border, true: Colors.accent }}
              thumbColor={Colors.white}
            />
          </View>
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: palette.text }]}>Reduced motion enabled</Text>
            <Switch
              value={reducedMotionEnabled}
              onValueChange={setReducedMotionEnabled}
              trackColor={{ false: palette.border, true: Colors.accent }}
              thumbColor={Colors.white}
            />
          </View>
          <Text style={[styles.helpText, { color: palette.textSecondary }]}>
            Reduced motion is currently documented in the manifest for future animation assets; there are no Lottie assets shipped yet.
          </Text>
        </GraphicsPreviewSection>

        <GraphicsPreviewSection
          title="Shipped assets"
          subtitle="This section is manifest-driven and only renders local assets we can resolve statically inside the app today."
        >
          {shippedAssets.map((asset) => (
            <GraphicsAssetCard
              key={asset.id}
              asset={asset}
              source={getGraphicsAssetSource(asset.path)}
              previewTheme={previewTheme}
              rtlEnabled={rtlEnabled}
            />
          ))}
        </GraphicsPreviewSection>

        <GraphicsPreviewSection
          title="Legacy / scaffold assets"
          subtitle="These assets exist in the repo but are not part of the intended WeeJobs design system yet. Keep them visible until they are replaced or formally retired."
        >
          {legacyAssets.map((asset) => (
            <GraphicsAssetCard
              key={asset.id}
              asset={asset}
              source={getGraphicsAssetSource(asset.path)}
              previewTheme={previewTheme}
              rtlEnabled={rtlEnabled}
            />
          ))}
        </GraphicsPreviewSection>

        <GraphicsPreviewSection
          title="Starter icon gallery"
          subtitle="These repo-owned WeeJobs icons are now ready for migration into real app surfaces and should be reviewed here before broader rollout."
        >
          <View style={styles.iconGrid}>
            {starterIcons.map((iconName) => (
              <View
                key={iconName}
                style={[
                  styles.iconCard,
                  { borderColor: palette.border, backgroundColor: palette.card },
                ]}
              >
                <Icon name={iconName} size={28} color={palette.text} />
                <Text style={[styles.iconLabel, { color: palette.textSecondary }]}>
                  {iconName}
                </Text>
              </View>
            ))}
          </View>
        </GraphicsPreviewSection>

        <GraphicsPreviewSection
          title="External partner handoff"
          subtitle="A curated editable package can now be generated for external partners, using source references that point back to the repo-managed scaffold assets."
        >
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, { borderColor: palette.border, backgroundColor: palette.card }]}>
              <Text style={[styles.summaryValue, { color: palette.text }]}>{partnerReadyAssets.length}</Text>
              <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>partner-editable assets</Text>
            </View>
          </View>
          <Text style={[styles.helpText, { color: palette.textSecondary }]}>
            Package output: `assets/source/partner-handoff/graphics-package/`
          </Text>
          <Text style={[styles.helpText, { color: palette.textSecondary }]}>
            Source map: `assets/source/figma-exports/weejobs-starter-source-map.json`
          </Text>
          <Text style={[styles.helpText, { color: palette.textSecondary }]}>
            Regenerate with `npm run assets:partner-package` after updating starter families or source references.
          </Text>
        </GraphicsPreviewSection>

        <GraphicsPreviewSection
          title="Missing standardization work"
          subtitle="These are the highest-value design-system gaps blocking a fully standardized graphics suite."
        >
          {manifest.gaps.map((gap) => (
            <View key={gap.id} style={[styles.gapCard, { borderColor: palette.border }]}> 
              <View style={styles.gapHeader}>
                <Text style={[styles.gapTitle, { color: palette.text }]}>{gap.id}</Text>
                <Text style={styles.gapPriority}>{gap.priority.toUpperCase()}</Text>
              </View>
              <Text style={[styles.gapPath, { color: palette.textSecondary }]}>
                Target: {gap.recommendedPath}
              </Text>
              <Text style={[styles.gapReason, { color: palette.textSecondary }]}>{gap.reason}</Text>
            </View>
          ))}
        </GraphicsPreviewSection>

        <GraphicsPreviewSection
          title="Parallel work split"
          subtitle="Graphics progress should not get blocked by native Android stabilization; that work stays on its own owner/branch track."
        >
          <Text style={[styles.helpText, { color: palette.textSecondary }]}>
            Keep native Android build fixes on a separate branch owner/workstream. Graphics, manifest, and preview-surface work can continue on the normal frontend/design sync path targeting UAI-Development.
          </Text>
        </GraphicsPreviewSection>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  summaryCard: {
    minWidth: 100,
    flexGrow: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 13,
    lineHeight: 20,
  },
  gapCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  gapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  gapTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  gapPriority: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  gapPath: {
    fontSize: 12,
  },
  gapReason: {
    fontSize: 13,
    lineHeight: 19,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  iconCard: {
    width: 92,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  iconLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
});
