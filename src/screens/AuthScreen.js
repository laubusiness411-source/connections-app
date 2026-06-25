import React, { useState, useMemo } from 'react';
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
import { useTheme } from '../theme/ThemeContext';

export default function AuthScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [mode, setMode] = useState('signup');
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
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
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
              placeholderTextColor={theme.colors.inputPlaceholder}
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
              placeholderTextColor={theme.colors.inputPlaceholder}
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
              <ActivityIndicator color={theme.colors.accent} style={styles.spinner} />
            )}
          </View>

          <TouchableOpacity
            onPress={() => setMode(isLogin ? 'signup' : 'login')}
            hitSlop={10}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>
              {isLogin
                ? 'new here? create an account'
                : 'already have an account? log in'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.bg },
    flex: { flex: 1 },
    body: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
    logo: { fontSize: 44, fontWeight: '800', color: t.colors.accent, textAlign: 'center' },
    tagline: {
      color: t.colors.textMuted,
      fontSize: 16,
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 36,
    },
    form: {},
    label: {
      color: t.colors.textSoft,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 8,
    },
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
    submit: { marginTop: 28 },
    spinner: { marginTop: 16 },
    toggle: { marginTop: 24, alignItems: 'center' },
    toggleText: { color: t.colors.textMuted, fontSize: 14, fontWeight: '600' },
  });
