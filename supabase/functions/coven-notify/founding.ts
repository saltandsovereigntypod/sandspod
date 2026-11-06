// The phone notes for coven listing applications
// (supabase/migrations/20261129000000_coven_founders_live.sql; sent by
// coven-listing-notify;
// app/src/lib/covens/founding.ts): a founder asking for their coven to be
// listed in Find a coven (to the Salt & Sovereignty moderators), and the
// moderators' answer (to the founder). Pure, so it can be tested.

export type Note = { title: string; body: string; url: string };

const clip = (text: string, n = 140) => (text.length > n ? `${text.slice(0, n - 1)}…` : text);

/** To the moderators: a new application, or one sent again after changes. */
export function listingAskedNote(p: { covenName: string; who: string; again: boolean }): Note {
  return {
    title: p.again ? 'A coven sent its application again' : 'A coven asks to be listed',
    body: clip(`${p.who} asks for ${p.covenName} to be listed in Find a coven.`),
    url: '/coven/moderation',
  };
}

/** To the founder: the moderators' answer, with their note. */
export function listingAnswerNote(p: { covenName: string; covenSlug: string; status: 'approved' | 'changes' | 'declined'; note: string | null }): Note {
  const url = `/coven/leading/apply?c=${encodeURIComponent(p.covenSlug)}`;
  if (p.status === 'approved') return { title: `${p.covenName} is listed`, body: 'The moderators approved your coven. It now shows in Find a coven.', url };
  const said = p.note?.trim() ? ` “${p.note.trim()}”` : '';
  if (p.status === 'changes') return { title: `Changes asked for ${p.covenName}`, body: clip(`The moderators asked for changes before listing it.${said}`), url };
  return { title: `${p.covenName} wasn’t listed`, body: clip(`The moderators declined to list it. It can still practise by invitation.${said}`), url };
}
