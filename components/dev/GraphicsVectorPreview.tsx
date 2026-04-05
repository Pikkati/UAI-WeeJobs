import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import { BorderRadius, Colors } from '../../constants/theme';
import type { GraphicsAsset } from '../../lib/assets/graphicsManifest';

function PreviewFrame({ children, dark = true }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <View
      style={[
        styles.frame,
        dark ? styles.frameDark : styles.frameLight,
      ]}
    >
      {children}
    </View>
  );
}

export default function GraphicsVectorPreview({
  asset,
  previewTheme,
}: {
  asset: GraphicsAsset;
  previewTheme: 'light' | 'dark';
}) {
  const dark = previewTheme === 'dark';

  switch (asset.id) {
    case 'brand-logo-primary-svg':
      return (
        <PreviewFrame dark={dark}>
          <Svg width="220" height="58" viewBox="0 0 240 64">
            <Rect width="240" height="64" rx="20" fill="#0F172A" />
            <Circle cx="36" cy="32" r="18" fill="#2563EB" />
            <Path d="M27 32L33 38L45 25" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <SvgText x="64" y="30" fill="white" fontSize="20" fontWeight="700">WeeJobs</SvgText>
            <SvgText x="64" y="47" fill="#93C5FD" fontSize="10" letterSpacing="1.6">NO JOB TOO WEE</SvgText>
          </Svg>
        </PreviewFrame>
      );
    case 'brand-logo-stacked-svg':
      return (
        <PreviewFrame dark={dark}>
          <Svg width="132" height="132" viewBox="0 0 160 160">
            <Rect width="160" height="160" rx="28" fill="#0F172A" />
            <Circle cx="80" cy="48" r="24" fill="#2563EB" />
            <Path d="M68 48L76 56L92 40" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <SvgText x="80" y="98" fill="white" fontSize="24" fontWeight="700" textAnchor="middle">WeeJobs</SvgText>
            <SvgText x="80" y="120" fill="#93C5FD" fontSize="10" letterSpacing="1.8" textAnchor="middle">NO JOB TOO WEE</SvgText>
          </Svg>
        </PreviewFrame>
      );
    case 'brand-logo-mark-svg':
    case 'favicon-primary-svg':
      return (
        <PreviewFrame dark={dark}>
          <Svg width="112" height="112" viewBox="0 0 128 128">
            <Rect width="128" height="128" rx="32" fill="#0F172A" />
            <Circle cx="64" cy="64" r="34" fill="#2563EB" />
            <Path d="M47 64L58 75L82 51" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </PreviewFrame>
      );
    case 'brand-logo-primary-white-svg':
      return (
        <PreviewFrame dark={false}>
          <Svg width="220" height="58" viewBox="0 0 240 64">
            <Rect width="240" height="64" rx="20" fill="white" />
            <Circle cx="36" cy="32" r="18" fill="#2563EB" />
            <Path d="M27 32L33 38L45 25" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <SvgText x="64" y="30" fill="#0F172A" fontSize="20" fontWeight="700">WeeJobs</SvgText>
            <SvgText x="64" y="47" fill="#2563EB" fontSize="10" letterSpacing="1.6">NO JOB TOO WEE</SvgText>
          </Svg>
        </PreviewFrame>
      );
    case 'illustration-empty-state-no-jobs':
      return (
        <PreviewFrame dark={dark}>
          <Svg width="220" height="160" viewBox="0 0 240 180">
            <Rect width="240" height="180" rx="28" fill="#0F172A" />
            <Circle cx="120" cy="72" r="42" fill="#111827" stroke="#334155" strokeWidth="2" />
            <Rect x="90" y="58" width="60" height="38" rx="10" stroke="#60A5FA" strokeWidth="3" />
            <Path d="M108 58V52C108 47.58 111.58 44 116 44H124C128.42 44 132 47.58 132 52V58" stroke="#60A5FA" strokeWidth="3" />
            <Path d="M90 74H150" stroke="#60A5FA" strokeWidth="3" />
            <SvgText x="120" y="132" fill="white" fontSize="16" fontWeight="700" textAnchor="middle">No jobs yet</SvgText>
            <SvgText x="120" y="150" fill="#94A3B8" fontSize="11" textAnchor="middle">Post your first task to start matching</SvgText>
          </Svg>
        </PreviewFrame>
      );
    case 'illustration-empty-state-no-messages':
      return (
        <PreviewFrame dark={dark}>
          <Svg width="220" height="160" viewBox="0 0 240 180">
            <Rect width="240" height="180" rx="28" fill="#0F172A" />
            <Circle cx="120" cy="72" r="42" fill="#111827" stroke="#334155" strokeWidth="2" />
            <Path d="M92 92H89C84.58 92 81 88.42 81 84V58C81 53.58 84.58 50 89 50H126C130.42 50 134 53.58 134 58V84C134 88.42 130.42 92 126 92H112L100 102V92Z" stroke="#60A5FA" strokeWidth="3" strokeLinejoin="round" />
            <Path d="M134 64H149C153.42 64 157 67.58 157 72V89C157 93.42 153.42 97 149 97H140L130 105V97" stroke="#60A5FA" strokeWidth="3" strokeLinejoin="round" />
            <SvgText x="120" y="132" fill="white" fontSize="16" fontWeight="700" textAnchor="middle">No messages yet</SvgText>
            <SvgText x="120" y="150" fill="#94A3B8" fontSize="11" textAnchor="middle">Conversations appear once a job starts</SvgText>
          </Svg>
        </PreviewFrame>
      );
    case 'illustration-avatar-placeholder':
      return (
        <PreviewFrame dark={dark}>
          <Svg width="136" height="136" viewBox="0 0 160 160">
            <Rect width="160" height="160" rx="80" fill="#0F172A" />
            <Circle cx="80" cy="62" r="24" fill="#2563EB" />
            <Path d="M42 126C50 103.33 62.67 92 80 92C97.33 92 110 103.33 118 126" fill="#2563EB" />
            <Path d="M42 126C50 103.33 62.67 92 80 92C97.33 92 110 103.33 118 126" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
          </Svg>
        </PreviewFrame>
      );
    case 'illustration-badge-verified-pro':
      return (
        <PreviewFrame dark={dark}>
          <Svg width="120" height="120" viewBox="0 0 120 120">
            <Circle cx="60" cy="60" r="42" fill="#0F172A" stroke="#2563EB" strokeWidth="4" />
            <Path d="M60 20L68 33L83 36L73 48L75 63L60 57L45 63L47 48L37 36L52 33L60 20Z" fill="#2563EB" />
            <Path d="M46 61L55 70L74 51" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </PreviewFrame>
      );
    case 'lottie-empty-state-pulse-fallback':
      return (
        <PreviewFrame dark={dark}>
          <Svg width="220" height="160" viewBox="0 0 240 180">
            <Rect width="240" height="180" rx="28" fill="#0F172A" />
            <Circle cx="120" cy="72" r="36" stroke="#2563EB" strokeWidth="8" />
            <SvgText x="120" y="132" fill="white" fontSize="16" fontWeight="700" textAnchor="middle">Animated state</SvgText>
            <SvgText x="120" y="150" fill="#94A3B8" fontSize="11" textAnchor="middle">Fallback shown when motion is disabled</SvgText>
          </Svg>
        </PreviewFrame>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    minHeight: 140,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameDark: {
    backgroundColor: '#020617',
  },
  frameLight: {
    backgroundColor: '#F8FAFC',
  },
});
