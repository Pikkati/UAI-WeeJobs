declare module 'expo-image' {
  import * as React from 'react';
  import type { ImageStyle } from 'react-native';

  export type ContentFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' | string;

  export interface ExpoImageProps {
    source?: any;
    style?: ImageStyle | ImageStyle[];
    contentFit?: ContentFit;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    children?: React.ReactNode;
    [key: string]: any;
  }

  export const Image: React.ComponentType<ExpoImageProps>;
  export default Image;
}
