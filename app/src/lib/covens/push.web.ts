// The web build has no phone notifications.

export const MESSAGE_CHANNEL = 'coven-messages';
export type PushResult = { ok: true } | { ok: false; reason: 'denied' | 'unsupported' | 'offline' };
export const enableCovenPush = async (): Promise<PushResult> => ({ ok: false, reason: 'unsupported' });
export const disableCovenPush = async (): Promise<void> => {};
export const covenPushOn = async (): Promise<boolean> => false;
export const refreshCovenPush = async (): Promise<void> => {};
