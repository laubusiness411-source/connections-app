import React, { useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

// Bottom-sheet confirmation (replaces Alert.alert for common actions).
// actions: [{ label, style: 'primary' | 'destructive' | 'default', onPress }]
// A Cancel row is always appended.
export default function ConfirmSheet({ visible, title, message, actions = [], onClose }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + 14 }]}
          onPress={() => {}}
        >
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {actions.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[
                styles.action,
                a.style === 'primary' && styles.primary,
                a.style === 'destructive' && styles.destructive,
              ]}
              onPress={() => {
                onClose?.();
                a.onPress?.();
              }}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.actionText,
                  a.style === 'primary' && styles.primaryText,
                  a.style === 'destructive' && styles.destructiveText,
                ]}
              >
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.cancel} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: t.colors.surface,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingHorizontal: 20,
      paddingTop: 22,
    },
    title: { color: t.colors.text, fontSize: 17, fontWeight: '800' },
    message: {
      color: t.colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 6,
      marginBottom: 6,
    },
    action: {
      backgroundColor: t.colors.surface2,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 10,
    },
    primary: { backgroundColor: t.colors.accent },
    destructive: { backgroundColor: t.colors.surface2 },
    actionText: { color: t.colors.text, fontSize: 15, fontWeight: '700' },
    primaryText: { color: '#fff' },
    destructiveText: { color: t.colors.danger },
    cancel: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
    cancelText: { color: t.colors.textMuted, fontSize: 15, fontWeight: '600' },
  });
