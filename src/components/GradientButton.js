import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Primary CTA with a diagonal gradient fill. `style` controls layout
// (e.g. flex/width); `gradStyle` overrides the inner padding/radius.
export default function GradientButton({
  title,
  onPress,
  disabled,
  style,
  gradStyle,
  textStyle,
  colors = ['#8E7BFF', '#6C5CE7'],
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={style}
    >
      <LinearGradient
        colors={disabled ? ['#2A2A38', '#2A2A38'] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.grad, gradStyle]}
      >
        <Text style={[styles.text, disabled && styles.textDisabled, textStyle]}>
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
  textDisabled: { color: '#6A6A78' },
});
