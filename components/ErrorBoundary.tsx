import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Updates from 'expo-updates';

type State = { hasError: boolean; error?: Error | null };

export default class ErrorBoundary extends React.Component<{
  children?: React.ReactNode;
}, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error } as State;
  }

  componentDidCatch(error: Error, info: any) {
    // Send to analytics/logging services if configured
    // eslint-disable-next-line no-console
    console.error('Uncaught error in component tree:', error, info);
  }

  reset = async () => {
    this.setState({ hasError: false, error: null });
    try {
      if (Updates.reloadAsync) await Updates.reloadAsync();
    } catch (e) {
      // ignore reload errors
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error?.message ?? 'An unexpected error occurred.'}</Text>
          <TouchableOpacity onPress={this.reset} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    // Render children normally when there's no error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.props.children || null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  message: { fontSize: 14, color: '#666', marginBottom: 16, textAlign: 'center' },
  button: { paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#007AFF', borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
