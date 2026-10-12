// Pages, Field Notes and people someone has hidden from the Community Grimoire.
// Kept on the device (guests can hide things too). No provider needed: any
// screen can call useHiddenCommunity().

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import type { HiddenCommunity } from './model';

const KEY = 'community.hidden';

let state: HiddenCommunity = { posts: [], authors: [] };
let loaded = false;
const listeners = new Set<() => void>();

function set(next: HiddenCommunity) {
  state = next;
  listeners.forEach((listener) => listener());
  AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
}

async function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const saved = raw ? (JSON.parse(raw) as Partial<HiddenCommunity>) : {};
    state = {
      posts: Array.from(new Set([...(saved.posts ?? []), ...state.posts])),
      authors: Array.from(new Set([...(saved.authors ?? []), ...state.authors])),
    };
    listeners.forEach((listener) => listener());
  } catch {
    // Nothing saved yet, or unreadable: start empty.
  }
}

export function hidePost(id: string) {
  if (!state.posts.includes(id)) set({ ...state, posts: [...state.posts, id] });
}

export function blockAuthor(userId: string) {
  if (!state.authors.includes(userId)) set({ ...state, authors: [...state.authors, userId] });
}

export function showEverything() {
  set({ posts: [], authors: [] });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useHiddenCommunity(): HiddenCommunity {
  useEffect(() => {
    void load();
  }, []);
  return useSyncExternalStore(subscribe, () => state, () => state);
}
