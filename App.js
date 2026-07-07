import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainTabs from './src/screens/MainTabs';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import { supabase } from './src/lib/supabase';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { FiltersProvider } from './src/context/FiltersContext';
import { ToastProvider } from './src/components/Toast';
import {
  fetchMyProfile,
  saveMyProfile,
  clearMyProfile,
  isProfileComplete,
} from './src/lib/db';

function Loading() {
  const { theme } = useTheme();
  return (
    <View style={[styles.loading, { backgroundColor: theme.colors.bg }]}>
      <ActivityIndicator color={theme.colors.accent} size="large" />
    </View>
  );
}

function ThemedStatusBar() {
  const { theme } = useTheme();
  return <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />;
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [enterAuth, setEnterAuth] = useState(false);

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
      try {
        const saved = await saveMyProfile(userId, newProfile);
        setProfile(saved);
      } catch (e) {
        Alert.alert(
          "Couldn't save your profile",
          (e.message || 'Please try again.') +
            '\n\nIf this mentions a missing table, run supabase/schema.sql in the Supabase SQL editor.'
        );
      }
    },
    [userId]
  );

  const handleUpdateProfile = useCallback(
    async (updated) => {
      try {
        const saved = await saveMyProfile(userId, updated);
        setProfile(saved);
      } catch (e) {
        Alert.alert("Couldn't save changes", e.message || 'Please try again.');
      }
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
    content = enterAuth ? (
      <AuthScreen />
    ) : (
      <WelcomeScreen
        onGetStarted={() => setEnterAuth(true)}
        onLogin={() => setEnterAuth(true)}
      />
    );
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
        <ThemeProvider>
          <FiltersProvider>
            <ToastProvider>
              <ThemedStatusBar />
              {content}
            </ToastProvider>
          </FiltersProvider>
        </ThemeProvider>
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
