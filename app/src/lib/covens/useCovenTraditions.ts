// The paths of the covens you belong to (covenTradition.ts), for putting
// their premade workings and calendars first. Read once a session and kept;
// none for guests, or when the coven's tradition can't be read yet.

import { useEffect, useState } from 'react';

import { useSession } from '../session';
import { fetchMyCovenTraditions } from './api';
import { pathsForCovens } from './covenTradition';

const NONE: string[] = [];
const cache = new Map<string, Promise<string[]>>();

export function useCovenPaths(): string[] {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [paths, setPaths] = useState<string[]>(NONE);
  useEffect(() => {
    if (!userId) return;
    let live = true;
    if (!cache.has(userId)) cache.set(userId, fetchMyCovenTraditions(userId).then(pathsForCovens).catch(() => NONE));
    cache.get(userId)!.then((p) => live && p.length && setPaths(p));
    return () => {
      live = false;
    };
  }, [userId]);
  return userId ? paths : NONE;
}
