// "Begin together": hands a ritual's steps to Rituals together's start
// screen, where the host opens it for others to join. Used on a ready-made
// working, a saved ritual or spell, and a coven gathering.

import { router, type Href } from 'expo-router';

import { Button } from '../Button';
import { setPendingStart } from '../../lib/together/api';
import type { LiveStart } from '../../lib/together/live';

export function beginTogether(start: LiveStart, coven: { coven_id?: string | null; gathering_id?: string | null } = {}) {
  setPendingStart({ ...start, ...coven });
  router.push('/rituals/together?start=1' as Href);
}

export function BeginTogetherButton({ start, coven, disabled }: { start: () => LiveStart | null; coven?: { coven_id?: string | null; gathering_id?: string | null }; disabled?: boolean }) {
  return (
    <Button
      label="Begin together"
      variant="outline"
      disabled={disabled}
      accessibilityHint="Do it live with your coven or friends, each from where you are"
      onPress={() => {
        const s = start();
        if (s && s.steps.length) beginTogether(s, coven);
      }}
    />
  );
}
