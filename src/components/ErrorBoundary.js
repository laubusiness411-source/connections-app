import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

// Catches render crashes anywhere below and shows a recoverable screen
// instead of a white screen. Class component (required for boundaries).
export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.warn('ErrorBoundary caught:', error?.message, info?.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          {this.state.error?.message || 'An unexpected error occurred.'}
        </Text>
        <TouchableOpacity style={styles.btn} onPress={this.reset} activeOpacity={0.85}>
          <Text style={styles.btnText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

// Static colors on purpose: this screen must render even if theming breaks.
const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#F4F2EE',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  title: { color: '#191919', fontSize: 20, fontWeight: '800' },
  message: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 28,
  },
  btn: {
    backgroundColor: '#0A66C2',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 34,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
