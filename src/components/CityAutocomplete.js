import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { CITIES } from '../data/cities';
import { useTheme } from '../theme/ThemeContext';

// Location input with inline city suggestions; falls back to free text.
export default function CityAutocomplete({
  value,
  onChange,
  placeholder,
  autoFocus,
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const q = (value || '').trim().toLowerCase();
  const exact = CITIES.some((c) => c.toLowerCase() === q);
  const suggestions =
    q.length >= 2 && !exact
      ? CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 6)
      : [];

  return (
    <View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inputPlaceholder}
        autoFocus={autoFocus}
        autoCapitalize="words"
      />
      {suggestions.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.map((c) => (
            <TouchableOpacity
              key={c}
              style={styles.item}
              onPress={() => onChange(c)}
              activeOpacity={0.7}
            >
              <Text style={styles.itemText}>📍 {c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    input: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: t.colors.text,
      fontSize: 16,
    },
    dropdown: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.borderAccent,
      borderRadius: 12,
      marginTop: 6,
      overflow: 'hidden',
    },
    item: {
      paddingHorizontal: 16,
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    itemText: { color: t.colors.textSoft, fontSize: 15 },
  });
