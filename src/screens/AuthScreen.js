import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientText from '../components/GradientText';
import GradientButton from '../components/GradientButton';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const isLogin = mode === 'login';
  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 6;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        // App's auth listener handles routing on success.
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        // If email confirmation is on, there's no session yet.
        if (!data.session) {
          Alert.alert(
            'Check your email',
            'We sent you a confirmation link. Confirm it, then log in.'
          );
          setMode('login');
        }
      }
    } catch (e) {
      Alert.alert('Something went wrong', e.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <GradientText style={styles.logo}>GoalMatch</GradientText>
          <Text style={styles.tagline}>
            tell us your goal. we'll find your people.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              placeholderTextColor="#5A5A68"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            <Text style={styles.label}>password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="at least 6 characters"
              placeholderTextColor="#5A5A68"
              secureTextEntry
              autoCapitalize="none"
            />

            <GradientButton
              title={isLogin ? 'log in' : 'create account'}
              onPress={submit}
              disabled={!valid || busy}
              style={styles.submit}
            />
            {busy && (
              <ActivityIndicator color="#6C5CE7" style={styles.spinner} />
            )}
          </View>

          <TouchableOpacity
            onPress={() => setMode(isLogin ? 'signup' : 'login')}
            hitSlop={10}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>
              {isLogin
                ? "new here? create an account"
                : 'already have an account? log in'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F' },
  flex: { flex: 1 },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logo: { fontSize: 44, fontWeight: '800', color: '#6C5CE7', textAlign: 'center' },
  tagline: {
    color: '#9A9AAB',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 36,
  },
  form: {},
  label: {
    color: '#B8B8C7',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
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
  submit: { marginTop: 28 },
  spinner: { marginTop: 16 },
  toggle: { marginTop: 24, alignItems: 'center' },
  toggleText: { color: '#8A8A99', fontSize: 14, fontWeight: '600' },
});
