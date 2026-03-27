// Temporary module declarations to satisfy TypeScript in CI until proper types are installed
declare module 'expo-router';
declare module 'expo-status-bar';
declare module 'react-native-safe-area-context';
declare module 'expo-image-picker';
declare module 'expo-linear-gradient';
declare module 'expo-web-browser';
declare module '@react-navigation/bottom-tabs';
declare module '@react-navigation/elements';
declare module 'expo-haptics';
declare module 'react-native-reanimated';
declare module 'expo-symbols';
declare module 'expo-blur';
declare module 'expo-image-picker';
declare module 'expo-router';

// Fallback for any other untyped modules used in the codebase
declare module '*';
