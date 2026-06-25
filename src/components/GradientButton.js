import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

// Primary CTA with a diagonal gradient fill (uses the active accent).
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
  const grad = colors || theme.gradient;
  const off = theme.colors.surface2;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={style}
    >
      <LinearGradient
        colors={disabled ? [off, off] : grad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.grad, gradStyle]}
      >
        <Text
          style={[
            styles.text,
            disabled && { color: theme.colors.textFaint },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  grad: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
