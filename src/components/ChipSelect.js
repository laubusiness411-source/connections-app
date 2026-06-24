import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

// Single-select row of pill chips, shared across onboarding and edit-profile.
export default function ChipSelect({ options, value, onChange }) {
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

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#26262F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
  },
  chipSelected: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  chipText: { color: '#B8B8C7', fontSize: 14, fontWeight: '600' },
  chipTextSelected: { color: '#fff' },
});
