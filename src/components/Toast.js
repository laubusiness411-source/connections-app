import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

// Lightweight in-app toast (replaces system alerts for confirmations).
// usage: const toast = useToast(); toast.show('Application sent');

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext) || { show: () => {} };

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const show = useCallback(
    (message, opts = {}) => {
      clearTimeout(timer.current);
      setToast({
        message,
        icon: opts.icon || 'checkmark-circle',
        tone: opts.tone || 'success',
      });
      Animated.spring(anim, { toValue: 1, friction: 8, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start(
          () => setToast(null)
        );
      }, 2600);
    },
    [anim]
  );

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-70, 0] });
  const color =
    toast?.tone === 'error' ? theme.colors.danger : theme.colors.success;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            { top: insets.top + 8, opacity: anim, transform: [{ translateY }] },
          ]}
        >
          <View
            style={[
              styles.toast,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                shadowColor: '#000',
              },
            ]}
          >
            <Ionicons name={toast.icon} size={18} color={color} />
            <Text
              style={[styles.text, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  text: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
});
