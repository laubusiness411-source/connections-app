import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { CITIES } from '../data/cities';

// Location input with inline city suggestions as you type. Falls back to
// free text, so custom/unlisted places still work.
export default function CityAutocomplete({
  value,
  onChange,
  placeholder,
  autoFocus,
}) {
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
        placeholderTextColor="#5A5A68"
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

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#26262F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#2E2A45',
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#201C2E',
  },
  itemText: { color: '#C8C8D4', fontSize: 15 },
});
