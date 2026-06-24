import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SwipeScreen from './src/screens/SwipeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { loadProfile, saveProfile, clearProfile } from './src/data/profileStorage';

export default function App() {
  // null = still loading from storage; undefined = loaded, no profile yet
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      const saved = await loadProfile();
      setProfile(saved);
      setReady(true);
    })();
  }, []);

  const handleOnboardingComplete = useCallback(async (newProfile) => {
    await saveProfile(newProfile);
    setProfile(newProfile);
  }, []);

  const handleUpdateProfile = useCallback(async (updated) => {
    await saveProfile(updated);
    setProfile(updated);
  }, []);

  const handleResetProfile = useCallback(async () => {
    await clearProfile();
    setProfile(null);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {!ready ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#6C5CE7" size="large" />
          </View>
        ) : profile ? (
          <SwipeScreen
            myProfile={profile}
            onUpdateProfile={handleUpdateProfile}
            onResetProfile={handleResetProfile}
          />
        ) : (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0B0B0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
