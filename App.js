import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainTabs from './src/screens/MainTabs';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import { supabase } from './src/lib/supabase';
import {
  fetchMyProfile,
  saveMyProfile,
  clearMyProfile,
  isProfileComplete,
} from './src/lib/db';

function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color="#6C5CE7" size="large" />
    </View>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Restore any existing session and subscribe to auth changes.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setBooting(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Whenever the signed-in user changes, load their profile from the cloud.
  const userId = session?.user?.id;
  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setProfile(null);
      return;
    }
    setLoadingProfile(true);
    fetchMyProfile(userId).then((p) => {
      if (!cancelled) {
        setProfile(p);
        setLoadingProfile(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleOnboardingComplete = useCallback(
    async (newProfile) => {
      const saved = await saveMyProfile(userId, newProfile);
      setProfile(saved);
    },
    [userId]
  );

  const handleUpdateProfile = useCallback(
    async (updated) => {
      const saved = await saveMyProfile(userId, updated);
      setProfile(saved);
    },
    [userId]
  );

  const handleResetProfile = useCallback(async () => {
    const cleared = await clearMyProfile(userId);
    setProfile(cleared);
  }, [userId]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  let content;
  if (booting) {
    content = <Loading />;
  } else if (!session) {
    content = <AuthScreen />;
  } else if (loadingProfile) {
    content = <Loading />;
  } else if (!isProfileComplete(profile)) {
    content = <OnboardingScreen onComplete={handleOnboardingComplete} />;
  } else {
    content = (
      <MainTabs
        myProfile={profile}
        onUpdateProfile={handleUpdateProfile}
        onResetProfile={handleResetProfile}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {content}
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
