import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Tappable circular avatar: shows the chosen photo, or initials as a
// fallback. Tapping opens the photo library to pick/replace the image.
export default function AvatarPicker({ name, photoUri, onChange, size = 96 }) {
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

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  img: { backgroundColor: '#1E1E28' },
  fallback: {
    backgroundColor: '#6C5CE7',
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
    backgroundColor: '#16161D',
    borderWidth: 2,
    borderColor: '#0B0B0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: { color: '#fff', fontSize: 14 },
  hint: { color: '#6A6A78', fontSize: 12, marginTop: 8 },
});
