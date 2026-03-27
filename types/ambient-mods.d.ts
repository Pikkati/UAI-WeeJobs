// Minimal ambient module stubs to unblock TypeScript during CI.
// These are temporary and should be replaced with real types/packages.

declare module 'expo-router' {
  export type Href = string;
  export const Link: any;
  export const Stack: any;
  export const Tabs: any;
  export const router: any;
  export function useLocalSearchParams<T = Record<string, any>>(): T;
  export function useSearchParams<T = Record<string, any>>(): T;
  export function useRouter(): any;
}

declare module '@react-navigation/bottom-tabs' {
  export type BottomTabBarButtonProps = any;
  export function useBottomTabBarHeight(): number;
}

declare module '@react-navigation/elements' {
  export const PlatformPressable: any;
}

declare module 'expo-symbols' {
  export const SymbolView: any;
  export type SymbolViewProps = { name: string };
  export type SymbolWeight = string | number;
}

declare module '@expo/vector-icons/*' {
  const content: any;
  export default content;
}

declare module '@expo/vector-icons' {
  export const Ionicons: any;
  export const MaterialIcons: any;
  export default any;
}

declare module 'react-native-reanimated' {
  export function useAnimatedRef<T = any>(): any;
  export function useAnimatedStyle(...args: any[]): any;
  export function useSharedValue<T = any>(initial?: T): any;
  export function withRepeat(...args: any[]): any;
  export function withSequence(...args: any[]): any;
  export function withTiming(...args: any[]): any;
  export function interpolate(...args: any[]): any;
  export function useScrollViewOffset(...args: any[]): any;
  const Reanimated: any;
  export default Reanimated;
}
