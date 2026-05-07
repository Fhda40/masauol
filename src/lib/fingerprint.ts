export function getDeviceFingerprint(): string {
  const stored = localStorage.getItem("masoul_fp");
  if (stored) return stored;

  const raw = `${navigator.userAgent}-${screen.width}x${screen.height}-${Intl.DateTimeFormat().resolvedOptions().timeZone}-${navigator.language}-${Math.random().toString(36).slice(2)}`;
  const fp = btoa(raw).slice(0, 64);
  localStorage.setItem("masoul_fp", fp);
  return fp;
}
