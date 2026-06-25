import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeContext';

// Tappable circular avatar: shows the chosen photo, or initials as fallback.
export default function AvatarPicker({ name, photoUri, onChange, size = 96 }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2)
    : '?';

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permission needed',
        'Enable photo access in Settings to set a profile picture.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      onChange(result.assets[0].uri);
    }
  };

  const dim = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity onPress={pick} activeOpacity={0.85}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={[styles.img, dim]} />
        ) : (
          <View style={[styles.fallback, dim]}>
            <Text style={[styles.initials, { fontSize: size * 0.36 }]}>
              {initials}
            </Text>
          </View>
        )}
        <View style={styles.editBadge}>
          <Text style={styles.editIcon}>✎</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.hint}>
        {photoUri ? 'Tap to change photo' : 'Tap to add a photo'}
      </Text>
    </View>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    wrap: { alignItems: 'center' },
    img: { backgroundColor: t.colors.surface3 },
    fallback: {
      backgroundColor: t.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    initials: { color: '#fff', fontWeight: '700' },
    editBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: t.colors.surface,
      borderWidth: 2,
      borderColor: t.colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editIcon: { color: t.colors.text, fontSize: 14 },
    hint: { color: t.colors.textFaint, fontSize: 12, marginTop: 8 },
  });
