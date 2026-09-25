// Design tokens carried over from the website's witchcore palette
// (css/styles.css) and the approved app mockups.

export const colors = {
  night: '#070a08', // tab bar, deepest background
  ground: '#0c1510', // screen background
  surface: '#142219', // cards
  surfaceRaised: '#1c2e22', // chips, moon shadow
  cream: '#f4ecd8', // primary text, moon
  parchment: '#e6dcc2', // secondary text on dark
  muted: '#cabf9d', // captions, eyebrows
  tabInactive: '#b4ad96',
  gold: '#e2c36d', // accent, primary buttons
  goldDeep: '#b9a05d',
  fern: '#6f8465',
  forestInk: '#102118', // text on gold
  hairline: 'rgba(244,236,216,0.12)',
  goldLine: 'rgba(226,195,109,0.28)',
} as const;

export const fonts = {
  display: 'CormorantGaramond_600SemiBold',
  displayBold: 'CormorantGaramond_700Bold',
  displayItalic: 'CormorantGaramond_500Medium_Italic',
  body: 'SourceSerif4_400Regular',
  bodySemi: 'SourceSerif4_600SemiBold',
} as const;

export const radius = {
  chip: 999,
  button: 12,
  card: 20,
  tile: 16,
} as const;

export const space = {
  gutter: 20,
  section: 22,
} as const;

// Minimum touch target on every tappable element.
export const touch = 44;

export const type = {
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: colors.muted,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 36,
    color: colors.cream,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 23,
    lineHeight: 26,
    color: colors.cream,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.parchment,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
} as const;
