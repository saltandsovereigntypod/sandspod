import { LibraryBrowser } from '../../../../components/library/LibraryBrowser';
import { grimoireLibraryHref } from '../../../../lib/library';

// The Living Library, a section of your Grimoire: search every entry and
// your My Practice notes. (More → Living Library used to open it; that
// route, /more/library, now brings you here.)
export default function GrimoireLibrary() {
  return (
    <LibraryBrowser
      back="/grimoire"
      backLabel="Back to your Grimoire"
      entryHref={grimoireLibraryHref}
      sourcingHref="/grimoire/library/sourcing"
      closedHref="/grimoire/library/closed"
    />
  );
}
