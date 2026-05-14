export function createId(prefix: string): string {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error("crypto.randomUUID is required to create Figure model ids.");
  }
  return `${prefix}_${globalThis.crypto.randomUUID()}`;
}

