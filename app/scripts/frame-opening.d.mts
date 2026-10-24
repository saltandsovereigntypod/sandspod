export type Pixels = { width: number; height: number; rgba: Uint8Array };
export type Opening = { left: number; top: number; width: number; height: number; oval: boolean };

export function pngSize(buf: Buffer): { width: number; height: number } | null;
export function decodePng(buf: Buffer): Pixels | null;
export function findOpening(pixels: Pixels): Opening | null;
