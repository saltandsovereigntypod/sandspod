import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { signInWithGoogle } from '../lib/googleSignIn';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius, touch, type } from '../theme';

export default function SignIn() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const creating = mode === 'create';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function continueWithGoogle() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await signInWithGoogle();
      if (result === 'signed-in') router.replace('/today');
      // 'redirecting' means the web page is leaving for Google, so stay busy.
      if (result !== 'redirecting') setBusy(false);
    } catch (error) {
      setBusy(false);
      setMessage(error instanceof Error ? error.message : 'Google sign-in did not finish. Please try again.');
    }
  }

  async function submit() {
    setBusy(true);
    setMessage(null);
    const credentials = { email: email.trim(), password };
    const { data, error } = creating
      ? await supabase.auth.signUp(credentials)
      : await supabase.auth.signInWithPassword(credentials);
    setBusy(false);
    if (error) {
      setMessage(error.message);
    } else if (data.session) {
      router.replace('/today');
    } else {
      setMessage('Check your email to confirm your account, then sign in.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.body}>
        <Button label="Back" variant="text" onPress={() => router.back()} style={styles.back} />
        <Text accessibilityRole="header" style={type.title}>
          {creating ? 'Create your sanctuary' : 'Welcome back'}
        </Text>
        <Text style={type.body}>
          {creating
            ? 'Your altar, grimoire and rituals will be saved to your account and kept in sync.'
            : 'Use the same account as the Salt & Sovereignty website.'}
        </Text>

        <Button label="Continue with Google" variant="outline" disabled={busy} onPress={continueWithGoogle} style={styles.submit} />
        <Text style={styles.or}>or use your email</Text>

        <View style={styles.field}>
          <Text style={type.caption} nativeID="email-label">
            Email
          </Text>
          <TextInput
            accessibilityLabelledBy="email-label"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor={colors.tabInactive}
          />
        </View>
        <View style={styles.field}>
          <Text style={type.caption} nativeID="password-label">
            Password
          </Text>
          <TextInput
            accessibilityLabelledBy="password-label"
            secureTextEntry
            autoComplete={creating ? 'new-password' : 'current-password'}
            textContentType={creating ? 'newPassword' : 'password'}
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
        </View>

        {message && (
          <Text accessibilityLiveRegion="polite" style={styles.message}>
            {message}
          </Text>
        )}

        <Button
          label={busy ? 'One moment…' : creating ? 'Create account' : 'Sign in'}
          disabled={busy || !email || !password}
          onPress={submit}
          style={styles.submit}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  body: { flex: 1, paddingHorizontal: 24, gap: 16 },
  back: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  field: { gap: 6 },
  input: {
    minHeight: touch + 4,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(244,236,216,0.22)',
    backgroundColor: colors.surface,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
  },
  message: { ...type.body, color: colors.gold },
  or: { ...type.caption, textAlign: 'center' },
  submit: { minHeight: 52, marginTop: 8 },
});
