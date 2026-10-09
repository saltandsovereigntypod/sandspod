// Saves and deletions of a signed-in person's altars, kept on the device until
// they reach saved_altars. The altar list shows them straight away; the store
// sends them in order and retries when the connection returns, the same way
// the grimoire store queues page edits.

import { altarFromRow } from './snapshot.ts';
import type { AltarData, SavedAltar } from './types.ts';

export type AltarOp =
  | {
      kind: 'save';
      id: string;
      name: string;
      data: AltarData;
      /** True until the row is known to exist in saved_altars. */
      isNew: boolean;
      createdAt: string;
      updatedAt: string;
    }
  | { kind: 'delete'; id: string };

export type FailedAltarOp = { op: AltarOp; message: string };

/**
 * Adds an operation, folding it into an earlier one for the same altar. The
 * first `locked` operations are being sent and are never changed, so anything
 * for those altars goes after them.
 */
export function enqueue(queue: AltarOp[], op: AltarOp, locked = 0): AltarOp[] {
  const head = queue.slice(0, locked);
  let tail = queue.slice(locked);
  const earlier = tail.find((o) => o.id === op.id);
  const sending = head.find((o) => o.id === op.id);

  if (op.kind === 'delete' && earlier?.kind === 'save' && earlier.isNew && !sending) {
    // Never reached the account, so there is nothing to delete there.
    return [...head, ...tail.filter((o) => o.id !== op.id)];
  }
  if (op.kind === 'save' && earlier?.kind === 'save') {
    op = { ...op, isNew: earlier.isNew, createdAt: earlier.createdAt };
  }
  tail = tail.filter((o) => o.id !== op.id);
  return [...head, ...tail, op];
}

/** The altar list as it will be once every queued operation has been sent. */
export function applyOps(altars: SavedAltar[], ops: AltarOp[]): SavedAltar[] {
  let result = altars;
  for (const op of ops) {
    if (op.kind === 'delete') {
      result = result.filter((a) => a.id !== op.id);
      continue;
    }
    const saved = altarFromRow({
      id: op.id,
      name: op.name,
      altar_data: op.data,
      created_at: op.createdAt,
      updated_at: op.updatedAt,
    });
    result = result.some((a) => a.id === op.id) ? result.map((a) => (a.id === op.id ? saved : a)) : [saved, ...result];
  }
  return result;
}

/** Reads what persist() wrote, dropping anything that isn't a valid operation. */
export function parsePending(raw: string | null): { queue: AltarOp[]; failed: FailedAltarOp[] } {
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    const isOp = (o: unknown): o is AltarOp => {
      const op = o as AltarOp | null;
      return !!op && typeof op.id === 'string' && (op.kind === 'delete' || (op.kind === 'save' && !!op.data));
    };
    const queue = Array.isArray(parsed?.queue) ? parsed.queue.filter(isOp) : [];
    const failed = Array.isArray(parsed?.failed)
      ? parsed.failed.filter((f: FailedAltarOp) => isOp(f?.op) && typeof f.message === 'string')
      : [];
    return { queue, failed };
  } catch {
    return { queue: [], failed: [] };
  }
}
