import { Text, View } from 'react-native';

import type { RitualPlan } from '../../lib/covens/builder';
import { addNoticeKey, noticeEntries, noticeKeyLabel, noticeLine, type NoticeRule, type NoticeWords, type SeriesName } from '../../lib/covens/notices';
import type { Assignee, PickEntry } from '../../lib/covens/picker';
import { type } from '../../theme';
import { Button } from '../Button';
import { Card } from '../more/ui';
import { SearchPicker } from './SearchPicker';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * "Who hears about it", in the planner (a rite's Details, a meeting's
 * panel): who gets a note on their phone when it's put on the calendar,
 * moved or taken off it, in words, and where that comes from. Those the
 * coven's head allows (coven_permission 'notices') choose for this one
 * gathering; everyone else sees it. As the website's (covens/coven/builder.js).
 */
export function NoticeWho({
  plan,
  kind,
  occasion,
  occasionName,
  audience,
  rules,
  words,
  names,
  series,
  who,
  whoSuggest,
  canChoose,
  onChange,
}: {
  plan: RitualPlan;
  kind: 'rite' | 'meeting';
  occasion: string;
  occasionName: string;
  audience?: Assignee[];
  rules: NoticeRule[];
  words: NoticeWords;
  names?: string[];
  series?: SeriesName[];
  /** The planner's WHO entries (its roles, positions and people). */
  who: PickEntry[];
  whoSuggest: string[];
  canChoose: boolean;
  onChange: (notify: string[] | null) => void;
}) {
  const own = plan.notify ?? [];
  const line = noticeLine({ kind, occasion, occasion_name: occasionName, plan, audience }, rules, { ...words, roles: plan.roles }, { names, series });
  const entries = noticeEntries(who, { parts: plan.roles.length > 0 });
  return (
    <Card>
      <Text style={type.eyebrow}>Who hears about it</Text>
      <Text style={type.body}>{line}</Text>
      <Text style={type.caption}>
        A note on their phone when it goes on the coven’s calendar, if its date or time changes, and if it comes off. Drafts never ring.
        {kind === 'meeting' && audience?.length ? ' Only those the meeting is for ever hear about it.' : ''}
      </Text>
      {canChoose ? (
        <View>
          <SearchPicker
            label="For this one"
            chips={own.map((k) => ({ key: k, label: cap(noticeKeyLabel(k, { ...words, roles: plan.roles })) }))}
            entries={entries}
            suggestions={[...whoSuggest.slice(0, 3), 'parts', 'none'].filter((k) => entries.some((e) => e.key === k))}
            onAdd={(entry) => onChange(addNoticeKey(own, entry.key))}
            onRemove={(key) => {
              const next = own.filter((k) => k !== key);
              onChange(next.length ? next : null);
            }}
            placeholder="The whole coven, Elders, the Chair, no one…"
            empty="As the coven’s rules say."
          />
          {own.length > 0 && <Button label="Follow the coven’s rules instead" variant="text" onPress={() => onChange(null)} />}
        </View>
      ) : (
        <Text style={type.caption}>Those the coven’s head allows choose who hears.</Text>
      )}
    </Card>
  );
}
