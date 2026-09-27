// A spell built in the spell builder, waiting to be planned. Route params
// carry only strings, so the draft itself is passed here.

import type { TemplateDraft } from './types';

let pending: TemplateDraft | null = null;

export function handOffDraft(draft: TemplateDraft) {
  pending = draft;
}

export function peekDraft(): TemplateDraft | null {
  return pending;
}

export function clearDraft() {
  pending = null;
}
