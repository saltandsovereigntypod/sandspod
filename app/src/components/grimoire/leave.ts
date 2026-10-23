import { router, useNavigation, type Href } from 'expo-router';

// Leaving a Grimoire page. A page opened from another tab (the altar's "Record
// in Grimoire", a holy day, a Library link) sits alone on the Grimoire's stack,
// so going "back" would cross to the other tab and leave the page on top of the
// Grimoire for next time. Back within the stack when there's something under
// it; otherwise replace it, so the Grimoire tab ends up where it should.
export function useLeave(fallback: Href) {
  const navigation = useNavigation();
  return () => {
    if (navigation.getState()?.index) router.back();
    else router.replace(fallback);
  };
}
