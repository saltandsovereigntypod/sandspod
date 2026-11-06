// Drop in (lib/craft/psychic/dropin.ts): the shared controller for practising
// in meditation. DropInProvider sits over every Psychic screen (its _layout),
// holds the sound's player (the Meditation module's own engine, sitSound) so
// it keeps playing as you move from the drop-in to the exercise, remembers
// your settings on this device, and stops the sound on End or when you leave
// the Psychic section. DropIn is the card on each exercise's start screen;
// SoundPill is the small "sound playing" strip with volume and End;
// useRevealTimer and CountdownRing are the reveal window.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePathname } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform, Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useAccessibility } from '../../lib/accessibility/store';
import { PROGRAM_NOTICE, programEnd } from '../../lib/meditation/programs';
import { useNoticeSeen } from '../meditation/ProgramPlayer';
import { countdownLabel, DEFAULT_SETTINGS, dropProgram, DROP_LENGTHS, DROP_SOUNDS, dropDone, dropLabel, guidedAt, meditationUse, mixFor, MAX_REVEAL, MIN_REVEAL, PSYCHIC_SETTINGS_KEY, REVEAL_PRESETS, revealAt, revealLabel, scaleMix, cleanSettings, VOLUME_STEPS, type MeditationUse, type PsychicSettings, type RevealState } from '../../lib/craft/psychic/dropin';
import { WARMUPS } from '../../lib/craft/psychic/warmups';
import { listenPlan, listenState, stopAt } from '../../lib/meditation/listen';
import { clockLabel, elapsedOf, pauseClock, resumeClock, startClock, type SitClock } from '../../lib/meditation/timer';
import { colors, fonts } from '../../theme';
import { Button } from '../Button';
import { ringSitBell } from '../meditation/SitTimer';
import { useSitSound } from '../meditation/sitSound';
import { lastListenMix } from '../meditation/SoundForm';
import { Body, Card, Chip, Chips, SectionLabel, Toggle, ui } from '../rituals/ui';

type Run = { clock: SitClock; endMs: number | null };

type Ctl = {
  settings: PsychicSettings;
  set: (patch: Partial<PsychicSettings>) => void;
  /** Sound is playing (or fading out). */
  playing: boolean;
  /** When the drop-in began, or null when not dropping in. */
  droppedAt: number | null;
  beginDrop: () => void;
  /** Leave the drop-in for the exercise; the sound carries on. */
  start: () => void;
  /** Stop the sound and the drop-in. */
  end: () => void;
  /** What the session should record about meditation. */
  meditation: () => MeditationUse | undefined;
};

const Ctx = createContext<Ctl | null>(null);

export function useDropIn(): Ctl {
  const c = useContext(Ctx);
  if (!c) throw new Error('useDropIn needs DropInProvider');
  return c;
}

const PLAN = listenPlan(null);

export function DropInProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PsychicSettings>(DEFAULT_SETTINGS);
  const [run, setRun] = useState<Run | null>(null);
  const [droppedAt, setDroppedAt] = useState<number | null>(null);
  const used = useRef({ guided: false, dropMs: 0, sound: false });
  const pathname = usePathname();

  useEffect(() => {
    AsyncStorage.getItem(PSYCHIC_SETTINGS_KEY)
      .then((raw) => raw && setSettings(cleanSettings(JSON.parse(raw))))
      .catch(() => {});
  }, []);

  const mix = useMemo(() => {
    const m = mixFor(settings);
    return m ? scaleMix(m, settings.volume) : null;
  }, [settings]);
  const program = useMemo(() => dropProgram(settings), [settings]);
  const clock = run?.clock ?? startClock(0);
  useSitSound(run ? (program ? program.mix : mix) : null, PLAN, clock, run?.endMs ?? null, program);

  const set = useCallback((patch: Partial<PsychicSettings>) => {
    setSettings((s) => {
      const next = cleanSettings({ ...s, ...patch });
      void AsyncStorage.setItem(PSYCHIC_SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // The fade-out after End finishes: drop the player.
  const latest = useRef(run);
  useEffect(() => {
    latest.current = run;
  });
  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => {
      const r = latest.current;
      if (r && listenState(elapsedOf(r.clock, Date.now()), r.endMs).done) setRun(null);
    }, 500);
    return () => clearInterval(id);
  }, [run]);

  // No sound in the background without a native build: pause as the app leaves, play on as it returns.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (next) => {
      const r = latest.current;
      if (!r) return;
      const t = Date.now();
      setRun({ ...r, clock: next === 'active' ? resumeClock(r.clock, t) : pauseClock(r.clock, t) });
    });
    return () => sub.remove();
  }, []);

  const stopSound = useCallback(() => {
    const r = latest.current;
    if (!r || r.endMs !== null) return;
    const t = Date.now();
    const c = resumeClock(r.clock, t);
    setRun({ clock: c, endMs: stopAt(elapsedOf(c, t), null) });
  }, []);

  const end = useCallback(() => {
    stopSound();
    setDroppedAt(null);
    used.current = { guided: false, dropMs: 0, sound: false };
  }, [stopSound]);

  // Leaving the Psychic section ends the sound; unmounting (the layout going away) does too.
  useEffect(() => {
    if (!pathname.startsWith('/rituals/craft/psychic')) void Promise.resolve().then(end);
  }, [pathname, end]);

  const beginDrop = useCallback(() => {
    void (async () => {
      let s = settings;
      if (s.sound === 'listen' && !s.listenMix) {
        const m = await lastListenMix();
        if (m) {
          s = { ...s, listenMix: m };
          set({ listenMix: m });
        }
      }
      const t = Date.now();
      setDroppedAt(t);
      used.current = { guided: s.guided && s.warmups.length > 0, dropMs: 0, sound: !!mixFor(s) };
      if (mixFor(s) && !latest.current) setRun({ clock: startClock(t), endMs: dropProgram(s) ? programEnd(dropProgram(s)!) : null });
    })();
  }, [settings, set]);

  const start = useCallback(() => {
    setDroppedAt((at) => {
      if (at !== null) used.current.dropMs = Date.now() - at;
      return null;
    });
  }, []);

  const meditation = useCallback(() => meditationUse(settings, !!latest.current && latest.current.endMs === null, used.current.guided, used.current.dropMs), [settings]);

  const value = useMemo<Ctl>(() => ({ settings, set, playing: !!run, droppedAt, beginDrop, start, end, meditation }), [settings, set, run, droppedAt, beginDrop, start, end, meditation]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** A small "sound playing" strip with volume and End; nothing when no sound plays. */
export function SoundPill() {
  const d = useDropIn();
  if (!d.playing) return null;
  const i = Math.max(0, VOLUME_STEPS.findIndex((v) => v >= d.settings.volume - 0.001));
  const step = (n: number) => d.set({ volume: VOLUME_STEPS[Math.min(VOLUME_STEPS.length - 1, Math.max(0, i + n))] });
  const name = DROP_SOUNDS.find((s) => s.id === d.settings.sound)?.label ?? 'Sound';
  return (
    <View accessibilityLabel={`${name} is playing`} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, alignSelf: 'flex-start', flexWrap: 'wrap' }}>
      <Text style={{ color: colors.gold, fontFamily: fonts.body, fontSize: 13 }}>{`Sound playing · ${name}`}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Quieter" onPress={() => step(-1)} hitSlop={8}>
        <Text style={{ color: colors.cream, fontFamily: fonts.body, fontSize: 18 }}>−</Text>
      </Pressable>
      <Text style={{ color: colors.cream, fontFamily: fonts.body, fontSize: 12 }} accessibilityLabel={`Volume ${Math.round(d.settings.volume * 100)} percent`}>{`${Math.round(d.settings.volume * 100)}%`}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Louder" onPress={() => step(1)} hitSlop={8}>
        <Text style={{ color: colors.cream, fontFamily: fonts.body, fontSize: 18 }}>+</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Stop the sound" onPress={d.end} hitSlop={8}>
        <Text style={{ color: colors.cream, fontFamily: fonts.body, fontSize: 13, textDecorationLine: 'underline' }}>End</Text>
      </Pressable>
    </View>
  );
}

/** The drop-in card on an exercise's start screen: settings, then the drop-in itself with a Start button. */
export function DropIn({ onStart, startDisabled, startLabel = 'Start' }: { onStart: () => void; startDisabled?: boolean; startLabel?: string }) {
  const d = useDropIn();
  const s = d.settings;
  const [open, setOpen] = useState(false);
  const [seen, markSeen] = useNoticeSeen();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (d.droppedAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [d.droppedAt]);

  if (d.droppedAt !== null) {
    const elapsed = now - d.droppedAt;
    const step = s.guided ? guidedAt(s.warmups, elapsed, s.dropMinutes) : null;
    const over = dropDone(elapsed, s.dropMinutes);
    return (
      <Card accent>
        <SectionLabel>{over ? 'Ready when you are' : 'Dropping in'}</SectionLabel>
        <SoundPill />
        {step && !step.finished ? (
          <>
            <Body>{step.line}</Body>
            <Body muted>{`${step.title} · ${step.index + 1} of ${step.total}`}</Body>
          </>
        ) : (
          <Body muted>{over ? 'The drop-in time is up. Stay as long as you like, then press Start.' : 'Rest here. Press Start when you are ready.'}</Body>
        )}
        <Body muted>{s.dropMinutes === null ? `${clockLabel(elapsed)} so far` : `${clockLabel(Math.max(0, s.dropMinutes * 60_000 - elapsed))} left of ${s.dropMinutes} min`}</Body>
        <Button label={startLabel} disabled={startDisabled} onPress={() => { d.start(); onStart(); }} />
        <Button label="Stop dropping in" variant="text" onPress={d.end} />
      </Card>
    );
  }

  return (
    <Card>
      <SectionLabel>Practise in meditation</SectionLabel>
      <Body muted>{`Optional. Drop in with a sound and a guided settling, then press Start when you are ready; the sound keeps playing through the exercise. Reveal: ${revealLabel(s.revealSec)}.`}</Body>
      <SoundPill />
      <View style={ui.gapSmall}>
        {s.sound.startsWith('prog-') && seen === false && (
          <View style={ui.gapSmall}>
            <Body muted>{PROGRAM_NOTICE}</Body>
            <Button label="I understand" variant="outline" onPress={markSeen} />
          </View>
        )}
        <Button label="Drop in first" variant="outline" disabled={(s.sound === 'none' && !s.guided) || (s.sound.startsWith('prog-') && seen !== true)} onPress={d.beginDrop} />
        <Button label={open ? 'Hide drop-in and timing settings' : 'Drop-in and timing settings'} variant="text" onPress={() => setOpen(!open)} />
      </View>
      {open && (
        <View style={ui.gap}>
          <View style={ui.gapSmall}>
            <SectionLabel>Sound</SectionLabel>
            <Chips>
              {DROP_SOUNDS.map((o) => (
                <Chip key={o.id} label={o.label} selected={s.sound === o.id} onPress={() => d.set({ sound: o.id })} />
              ))}
            </Chips>
            <Body muted>{DROP_SOUNDS.find((o) => o.id === s.sound)?.line ?? ''}</Body>
            <Body muted>Made by the Meditation module; use headphones for binaural beats.</Body>
          </View>
          <Toggle label="Guided drop-in" detail="The grounding and opening warm-ups, a line at a time" value={s.guided} onChange={(v) => d.set({ guided: v })} />
          {s.guided && (
            <Chips>
              {WARMUPS.map((w) => (
                <Chip key={w.id} label={w.title} selected={s.warmups.includes(w.id)} onPress={() => d.set({ warmups: WARMUPS.map((x) => x.id).filter((x) => (x === w.id ? !s.warmups.includes(x) : s.warmups.includes(x))) })} />
              ))}
            </Chips>
          )}
          <View style={ui.gapSmall}>
            <SectionLabel>Drop in for</SectionLabel>
            <Chips>
              {DROP_LENGTHS.map((m) => (
                <Chip key={String(m)} label={dropLabel(m)} selected={s.dropMinutes === m} onPress={() => d.set({ dropMinutes: m })} />
              ))}
            </Chips>
          </View>
          <RevealSettings />
        </View>
      )}
    </Card>
  );
}

/** Reveal after: presets, custom minutes and seconds, or manual; plus the countdown options. */
export function RevealSettings() {
  const { settings: s, set } = useDropIn();
  const custom = s.revealSec !== null && !REVEAL_PRESETS.includes(s.revealSec);
  const [showCustom, setShowCustom] = useState(custom);
  const sec = s.revealSec ?? 90;
  const bump = (delta: number) => set({ revealSec: Math.min(MAX_REVEAL, Math.max(MIN_REVEAL, sec + delta)) });
  return (
    <View style={ui.gapSmall}>
      <SectionLabel>Reveal after</SectionLabel>
      <Chips>
        {REVEAL_PRESETS.map((v) => (
          <Chip key={String(v)} label={v === null ? 'Manual (I’ll tap reveal)' : revealLabel(v)} selected={!showCustom && s.revealSec === v} onPress={() => { setShowCustom(false); set({ revealSec: v }); }} />
        ))}
        <Chip label="Custom" selected={showCustom} onPress={() => { setShowCustom(true); if (s.revealSec === null) set({ revealSec: 90 }); }} />
      </Chips>
      {showCustom && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <Chip label="− 1 min" onPress={() => bump(-60)} />
          <Chip label="+ 1 min" onPress={() => bump(60)} />
          <Chip label="− 10 s" onPress={() => bump(-10)} />
          <Chip label="+ 10 s" onPress={() => bump(10)} />
          <Body muted>{revealLabel(s.revealSec ?? sec)}</Body>
        </View>
      )}
      <Body muted>{s.revealSec === null ? 'You tap when you are ready to move on.' : 'ESP: the window before each guess unlocks. Remote viewing and psychometry: the impressions window before the reveal step. Tomorrow’s card: the window before the guess is locked in.'}</Body>
      <Toggle label="Hide the countdown" detail="Keep the timer, lose the ring, so it does not distract" value={s.hideCountdown} onChange={(v) => set({ hideCountdown: v })} />
      <Toggle label="Gentle chime" detail="The altar bell, once, when the window ends" value={s.chime} onChange={(v) => set({ chime: v })} />
    </View>
  );
}

/** The reveal window: start it, read its state, restart it. Chimes once as it ends. */
export function useRevealTimer(): { state: RevealState; start: () => void; reset: () => void; locked: boolean } {
  const { settings } = useDropIn();
  const prefs = useAccessibility();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const sec = settings.revealSec;
  useEffect(() => {
    if (startedAt === null || sec === null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [startedAt, sec]);
  const state = revealAt(startedAt === null ? null : now - startedAt, sec);
  const chimed = useRef(false);
  useEffect(() => {
    if (state.phase === 'running') chimed.current = false;
    if (state.phase === 'ready' && sec !== null && !chimed.current) {
      chimed.current = true;
      if (settings.chime) ringSitBell(1, { signal: 'bell' }, prefs);
    }
  }, [state.phase, sec, settings.chime, prefs]);
  const start = useCallback(() => {
    setNow(Date.now());
    setStartedAt(Date.now());
  }, []);
  const reset = useCallback(() => setStartedAt(null), []);
  // Manual never locks; a timer locks until it has run out.
  return { state, start, reset, locked: sec !== null && state.phase !== 'ready' };
}

/** A calm ring that fills as the window passes; with the countdown hidden, only a quiet line. */
export function CountdownRing({ state, size = 120 }: { state: RevealState; size?: number }) {
  const { settings } = useDropIn();
  if (state.phase === 'idle' || state.leftMs === null) return null;
  if (settings.hideCountdown) return <Body muted>{state.phase === 'ready' ? 'Time is up. Move on when you are ready.' : 'Take your time. It will let you know.'}</Body>;
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ alignItems: 'center' }} accessible accessibilityLabel={state.phase === 'ready' ? 'Time is up' : `${countdownLabel(state.leftMs)} left`}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.hairline} strokeWidth={4} fill="none" />
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.gold} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray={`${c * state.fraction} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        </Svg>
        <Text style={{ color: colors.cream, fontFamily: fonts.display, fontSize: 22 }}>{state.phase === 'ready' ? 'Ready' : countdownLabel(state.leftMs)}</Text>
      </View>
    </View>
  );
}
