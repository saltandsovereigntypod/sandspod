import { useCallback, useMemo, useState } from 'react';

import { LAYOUT_SETTING, parseLayout, serializeLayout, type GrimoireLayout } from '../../lib/grimoire/layout';
import { useMySettings } from '../../lib/settings/store';

/**
 * Your Grimoire home's layout, kept in your synced settings
 * (`grimoire_layout`) so the website opens on the same home. Changes show at
 * once and save behind; the last one wins.
 */
export function usePersonalLayout(): { layout: GrimoireLayout; update: (next: GrimoireLayout) => void } {
  const { settings, save } = useMySettings();
  const savedText = typeof settings?.[LAYOUT_SETTING] === 'string' ? (settings[LAYOUT_SETTING] as string) : '';
  const saved = useMemo(() => parseLayout(savedText), [savedText]);
  // The latest change, shown until the saved copy says the same.
  const [local, setLocal] = useState<{ text: string; layout: GrimoireLayout } | null>(null);

  const update = useCallback(
    (next: GrimoireLayout) => {
      const text = serializeLayout(next);
      setLocal({ text, layout: next });
      if (settings) void save({ ...settings, [LAYOUT_SETTING]: text }).catch(() => {});
    },
    [save, settings],
  );

  return { layout: local && local.text !== savedText ? local.layout : saved, update };
}
