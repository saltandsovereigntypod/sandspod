// Points the practice tools at whoever is signed in, so their entries sync.

import { useEffect } from 'react';

import { useSession } from '../session';
import { setCraftAccount } from './store';

export function useCraftAccount() {
  const { session } = useSession();
  const id = session?.user?.id ?? null;
  useEffect(() => setCraftAccount(id), [id]);
}
