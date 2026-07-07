import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Single-select row of pill chips, shared across onboarding and edit-profile.
export default function ChipSelect({ options, value, onChange }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.wrap}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onChange(opt)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 8,
    },
    chipSelected: { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
    chipText: { color: t.colors.textMuted, fontSize: 14, fontWeight: '600' },
    chipTextSelected: { color: t.colors.onAccent },
  });
