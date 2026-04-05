import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import { Image } from 'expo-image';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import type { GraphicsAsset } from '../../lib/assets/graphicsManifest';
import GraphicsVectorPreview from './GraphicsVectorPreview';

function MetaPill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

export default function GraphicsAssetCard({
  asset,
  source,
  previewTheme,
  rtlEnabled,
}: {
  asset: GraphicsAsset;
  source: any;
  previewTheme: 'light' | 'dark';
  rtlEnabled: boolean;
}) {
  const previewBackground =
    previewTheme === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
  const previewBorder = previewTheme === 'dark' ? Colors.border : '#CBD5E1';
  const isRenderableRaster = Boolean(source) && !asset.path.endsWith('.svg');
  const isRenderableVector =
    asset.path.endsWith('.svg') || asset.path.endsWith('.json');

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{asset.id}</Text>
          <Text style={styles.path}>{asset.path}</Text>
        </View>
        <MetaPill label={asset.type} />
      </View>

      <View
        style={[
          styles.previewBox,
          { backgroundColor: previewBackground, borderColor: previewBorder },
        ]}
      >
        {isRenderableRaster ? (
          <Image
            source={source}
            style={styles.previewImage}
            contentFit="contain"
            accessibilityLabel={asset.accessibilityLabel}
          />
        ) : isRenderableVector ? (
          <GraphicsVectorPreview asset={asset} previewTheme={previewTheme} />
        ) : (
          <View style={styles.placeholderState}>
            <Text style={styles.placeholderTitle}>Preview placeholder</Text>
            <Text style={styles.placeholderCopy}>
              {asset.path.endsWith('.svg')
                ? 'Vector asset registered; add SVG runtime rendering for visual preview.'
                : 'No local runtime source has been mapped for this asset yet.'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.metaWrap}>
        <MetaPill label={`theme: ${asset.themeSupport}`} />
        <MetaPill label={`rtl: ${asset.rtlSupport}`} />
        <MetaPill label={rtlEnabled ? 'preview rtl on' : 'preview rtl off'} />
        <MetaPill label={`status: ${asset.status}`} />
      </View>

      <Text style={styles.alt}>{asset.alt}</Text>
      <Text style={styles.usage}>Used in: {asset.usage.join(', ')}</Text>
      {asset.sourceReference ? (
        <Text style={styles.sourceReference}>Source: {asset.sourceReference}</Text>
      ) : null}

      {asset.notes?.length ? (
        <View style={styles.notesWrap}>
          {asset.notes.map((note) => (
            <Text key={note} style={styles.note}>
              • {note}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  title: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  path: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  previewBox: {
    minHeight: 160,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: Spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 128,
  },
  placeholderState: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  placeholderTitle: {
    color: Colors.white,
    fontWeight: '600',
  },
  placeholderCopy: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  metaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(37,99,235,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.35)',
  },
  pillText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  alt: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '500',
  },
  usage: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  sourceReference: {
    color: Colors.accent,
    fontSize: 12,
    lineHeight: 18,
  },
  notesWrap: {
    gap: 4,
  },
  note: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
