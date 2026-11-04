import { Platform, useWindowDimensions } from 'react-native';

// The web app on a computer screen: the tabs become a side bar and each
// screen sits in a centred column. Phones (and the phone apps) keep the
// bottom tab bar and full-width screens exactly as they are.
export const DESKTOP_MIN_WIDTH = 900;
// Reading screens stay at a comfortable line length; the altar gets more room for its stage.
export const READING_MAX_WIDTH = 920;
export const ALTAR_MAX_WIDTH = 1280;
export const SIDEBAR_WIDTH = 208;
/** The side bar folded to a rail of icons. */
export const SIDEBAR_RAIL_WIDTH = 64;

export function useDesktopLayout(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= DESKTOP_MIN_WIDTH;
}
