// Alpha access whitelist utilities
// Minimal, dependency-free helpers to gate endpoints during Alpha launch.

function normalize(addr: string): string {
  return (addr || '').trim().toLowerCase();
}

export function isAlphaMode(): boolean {
  const v = process.env.ALPHA_MODE;
  if (!v) return false;
  return v.toLowerCase() === 'true' || v === '1' || v.toLowerCase() === 'yes';
}

export function getWhitelist(): Set<string> {
  const raw = process.env.ALPHA_WHITELIST || '';
  const items = raw
    .split(/[,\n\s]+/)
    .map(normalize)
    .filter(Boolean);
  return new Set(items);
}

export function isWhitelisted(address: string | undefined | null): boolean {
  if (!isAlphaMode()) return true; // allow all when alpha is off
  if (!address) return false;
  const wl = getWhitelist();
  // allow wildcard "*" as anyone
  if (wl.has('*')) return true;
  return wl.has(normalize(address));
}
