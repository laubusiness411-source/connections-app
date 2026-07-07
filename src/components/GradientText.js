import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Brand/hero text. Now flat accent color for a cleaner, structured look
// (name kept for compatibility with existing call sites).
export default function GradientText({ children, style }) {
  const { theme } = useTheme();
  return <Text style={[style, { color: theme.colors.accent }]}>{children}</Text>;
}
