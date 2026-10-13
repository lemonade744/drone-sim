export const DEG = Math.PI / 180;
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));


// Нормализация угла к диапазону [-π, π]
export function normalizeAngle(a) {
  a = a % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  if (a < -Math.PI) a += Math.PI * 2;
  return a;
}