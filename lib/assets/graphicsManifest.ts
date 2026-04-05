import type { ImageSourcePropType } from 'react-native';

export type GraphicsThemeSupport = 'light' | 'dark' | 'both';
export type GraphicsRtlSupport = 'not-applicable' | 'mirrored-required' | 'supported';
export type GraphicsStatus = 'shipped' | 'legacy' | 'missing';

export type GraphicsAsset = {
  id: string;
  type: 'logo' | 'hero' | 'icon' | 'app-icon' | 'favicon' | 'splash' | 'illustration';
  path: string;
  fileName: string;
  status: GraphicsStatus;
  usage: string[];
  alt: string;
  accessibilityLabel: string;
  themeSupport: GraphicsThemeSupport;
  rtlSupport: GraphicsRtlSupport;
  sourceReference: string | null;
  notes?: string[];
};

export type GraphicsGap = {
  id: string;
  type: GraphicsAsset['type'];
  recommendedPath: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
};

export type GraphicsManifest = {
  version: number;
  updatedAt: string;
  namingConvention: {
    case: string;
    formatPolicy: string[];
  };
  coverage: {
    status: 'partial' | 'complete';
    shippedCount: number;
    missingCount: number;
    notes: string[];
  };
  assets: GraphicsAsset[];
  gaps: GraphicsGap[];
};

const manifest = require('../../assets/manifest.json') as GraphicsManifest;

const assetSources: Record<string, ImageSourcePropType> = {
  'assets/images/weejobs-logo.png': require('../../assets/images/weejobs-logo.png'),
  'assets/images/hero-handyman.png': require('../../assets/images/hero-handyman.png'),
  'assets/images/icon.png': require('../../assets/images/icon.png'),
  'assets/images/adaptive-icon.png': require('../../assets/images/adaptive-icon.png'),
  'assets/images/favicon.png': require('../../assets/images/favicon.png'),
  'assets/images/splash-icon.png': require('../../assets/images/splash-icon.png'),
  'assets/images/react-logo.png': require('../../assets/images/react-logo.png'),
  'assets/images/react-logo@2x.png': require('../../assets/images/react-logo@2x.png'),
  'assets/images/react-logo@3x.png': require('../../assets/images/react-logo@3x.png'),
  'assets/images/partial-react-logo.png': require('../../assets/images/partial-react-logo.png'),
};

export function getGraphicsManifest(): GraphicsManifest {
  return manifest;
}

export function getGraphicsAssetSource(path: string): ImageSourcePropType | null {
  return assetSources[path] ?? null;
}

export function getGraphicsManifestSummary() {
  const shipped = manifest.assets.filter((asset) => asset.status === 'shipped');
  const legacy = manifest.assets.filter((asset) => asset.status === 'legacy');
  const missing = manifest.gaps;

  return {
    shippedCount: shipped.length,
    legacyCount: legacy.length,
    missingCount: missing.length,
    typeCounts: manifest.assets.reduce<Record<string, number>>((acc, asset) => {
      acc[asset.type] = (acc[asset.type] ?? 0) + 1;
      return acc;
    }, {}),
  };
}
