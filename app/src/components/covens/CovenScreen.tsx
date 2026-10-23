// The frame every one of a coven's screens sits in: the back header, the
// coven's name, and what to show while the coven loads, can't be found, or
// isn't open to you. `need` says who the screen is for: anyone ('public'),
// members and site moderators ('member'), or members in good standing who
// have signed the current agreements ('standing'), or its leaders ('manage')
// and reviewers ('review'), site moderators always included. A 'standing' screen still
// shows to members who aren't in good standing, under a note saying why, and
// leaves its actions off (each screen checks `standing.ok`).

import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text } from 'react-native';

import { Button } from '../Button';
import { Card, MoreScreen, Notice } from '../more/ui';
import { WEBSITE_ORIGIN } from '../../lib/altar/assetPaths';
import { useCoven } from '../../lib/covens/CovenContext';
import { colors, type } from '../../theme';

export const covenHref = (slug: string, sub = '') => `/more/covens/c/${slug}${sub ? `/${sub}` : ''}` as Href;

/** The coven's page on the website (founding, managing and moderation live there for now). */
export function openOnWebsite(slug: string, tab?: string) {
  const url = `${WEBSITE_ORIGIN}/covens/coven/?c=${encodeURIComponent(slug)}${tab ? `&tab=${tab}` : ''}`;
  void WebBrowser.openBrowserAsync(url);
}

export function CovenScreen({
  title,
  eyebrow,
  need = 'member',
  home,
  children,
  onRefresh,
}: {
  title: string;
  eyebrow?: string;
  /** The coven's own page: its name is the title, and Back goes to Covens. */
  home?: boolean;
  need?: 'public' | 'member' | 'standing' | 'manage' | 'review';
  children: ReactNode;
  onRefresh?: () => Promise<void>;
}) {
  const coven = useCoven();
  const [pulling, setPulling] = useState(false);
  const back = covenHref(coven.slug);
  const isHome = !!home;
  const frame = (body: ReactNode) => (
    <MoreScreen
      title={isHome ? coven.snapshot?.coven.name ?? title : title}
      eyebrow={isHome ? eyebrow : coven.snapshot?.coven.name ?? eyebrow}
      back={isHome ? ('/more/covens' as Href) : back}
      backLabel={isHome ? 'Back to Covens' : `Back to ${coven.snapshot?.coven.name ?? 'the coven'}`}
      refreshControl={
        <RefreshControl
          refreshing={pulling}
          tintColor={colors.gold}
          onRefresh={async () => {
            setPulling(true);
            await Promise.all([coven.refresh(), onRefresh?.()]).catch(() => {});
            setPulling(false);
          }}
        />
      }
    >
      {body}
    </MoreScreen>
  );

  if (coven.status === 'loading') return frame(<ActivityIndicator color={colors.gold} style={styles.loading} />);
  if (coven.status === 'missing')
    return frame(
      <Card>
        <Text style={type.body}>This coven couldn’t be found. It may have closed, or its link may have changed.</Text>
        <Button label="Find a coven" variant="outline" onPress={() => router.replace('/more/covens' as Href)} />
      </Card>,
    );
  if (coven.status === 'offline' && !coven.snapshot)
    return frame(
      <Card>
        <Text style={type.body}>The coven couldn’t be loaded. Check your connection and try again.</Text>
        <Button label="Try again" variant="outline" onPress={() => void coven.refresh()} />
      </Card>,
    );

  const { coven: info } = coven.snapshot!;
  if (info.status !== 'active' && !coven.perms.site && !coven.perms.founder)
    return frame(
      <Card>
        <Text style={type.body}>{info.status === 'suspended' ? 'This coven has been paused by the Salt & Sovereignty moderators.' : 'This coven has closed.'}</Text>
      </Card>,
    );

  if (need !== 'public') {
    const insider = coven.perms.member || coven.perms.site;
    if (!insider)
      return frame(
        <Card>
          <Text style={type.body}>This part of the coven is for its members.</Text>
          <Button label="About this coven" variant="outline" onPress={() => router.replace(back)} />
        </Card>,
      );
    const allowed = need === 'manage' ? coven.perms.manage || coven.perms.site : need === 'review' ? coven.perms.review || coven.perms.site : true;
    if (!allowed)
      return frame(
        <Card>
          <Text style={type.body}>{need === 'manage' ? 'Only the coven’s leaders manage it.' : 'Only the coven’s reviewers see this.'}</Text>
          <Button label="Back to the coven" variant="outline" onPress={() => router.replace(back)} />
        </Card>,
      );
    if (need === 'standing' && !coven.standing.ok && !coven.perms.site)
      return frame(
        <>
          <Card>
            {coven.standing.reasons.map((reason) => (
              <Text key={reason} style={type.body}>
                {reason}
              </Text>
            ))}
            {coven.unsigned.length > 0 && <Button label="Read and sign" onPress={() => router.push(covenHref(coven.slug, 'join'))} />}
          </Card>
          {children}
        </>,
      );
  }

  return frame(
    <>
      {coven.status === 'offline' && <Notice>Offline · this may be out of date</Notice>}
      {coven.perms.site && !coven.perms.member && need !== 'public' && <Notice tone="muted">You’re here as a Salt &amp; Sovereignty moderator.</Notice>}
      {children}
    </>,
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 40 },
});
