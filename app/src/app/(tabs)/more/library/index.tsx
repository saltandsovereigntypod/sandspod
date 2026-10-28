import { Redirect } from 'expo-router';

// The Living Library is a section of the Grimoire now (grimoire/library).
// This route stays so old links, help and saved places still open it.
export default function LibraryMoved() {
  return <Redirect href="/grimoire/library" />;
}
