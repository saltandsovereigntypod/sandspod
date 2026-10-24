// Phone notifications for coven messages: this device's Expo push token,
// signed up to you (register_push_token) once you turn them on. Push needs a
// build of the app that carries Apple's and Google's push setup; older builds
// still get everything else, and say so here.

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '../supabase';

const TOKEN_KEY = 'coven.push.token';
export const MESSAGE_CHANNEL = 'coven-messages';

export type PushResult = { ok: true } | { ok: false; reason: 'denied' | 'unsupported' | 'offline' };

/** Ask to notify, and sign this device up for your coven messages. */
export async function enableCovenPush(): Promise<PushResult> {
  if (Platform.OS === 'web') return { ok: false, reason: 'unsupported' };
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(MESSAGE_CHANNEL, {
        name: 'Coven messages',
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: '#e2c36d',
      });
    }
    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) permission = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: true } });
    if (!permission.granted) return { ok: false, reason: 'denied' };
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    const { error } = await supabase.rpc('register_push_token', { p_token: token, p_platform: Platform.OS });
    if (error) return { ok: false, reason: 'offline' };
    await AsyncStorage.setItem(TOKEN_KEY, token).catch(() => {});
    return { ok: true };
  } catch {
    // No push entitlement in this build, or no Google Play services.
    return { ok: false, reason: 'unsupported' };
  }
}

/** This device stops getting coven messages for you. */
export async function disableCovenPush(): Promise<void> {
  const token = await AsyncStorage.getItem(TOKEN_KEY).catch(() => null);
  if (!token) return;
  await supabase.rpc('unregister_push_token', { p_token: token });
  await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
}

/** Whether this device is signed up. */
export async function covenPushOn(): Promise<boolean> {
  return !!(await AsyncStorage.getItem(TOKEN_KEY).catch(() => null));
}

/** Keep the sign-up fresh when the app opens (tokens can change). */
export async function refreshCovenPush(): Promise<void> {
  if (Platform.OS === 'web' || !(await covenPushOn())) return;
  const permission = await Notifications.getPermissionsAsync().catch(() => null);
  if (permission?.granted) await enableCovenPush();
}
