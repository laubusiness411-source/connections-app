import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Primary CTA. Flat, structured, solid accent (name kept for compatibility
// with existing call sites; `colors` overrides the fill with its last color).
export default function GradientButton({
  title,
  onPress,
  disabled,
  style,
  gradStyle,
  textStyle,
  colors,
}) {
  const { theme } = useTheme();
  const fill = disabled
    ? theme.colors.surface2
    : colors
      ? colors[colors.length - 1]
      : theme.colors.accent;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={style}
    >
      <View style={[styles.btn, { backgroundColor: fill }, gradStyle]}>
        <Text
          style={[
            styles.text,
            disabled && { color: theme.colors.textFaint },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
