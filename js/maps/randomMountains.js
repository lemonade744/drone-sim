function randomStars({ colliders, isPointFree }) {
  const stars = [];
  const count = 14;
  const maxAttempts = 500;
  let attempts = 0;

  // Пики — это коллайдеры со top > 20
  const peaks = colliders.filter(c => c.top > 20);
  if (peaks.length === 0) return stars;

  while (stars.length < count && attempts < maxAttempts) {
    attempts++;

    let x, z, y;
    if (Math.random() < 0.6) {
      // Над случайным пиком
      const p = peaks[Math.floor(Math.random() * peaks.length)];
      x = p.x + (Math.random() - 0.5) * 12;
      z = p.z + (Math.random() - 0.5) * 12;
      y = p.top + 4 + Math.random() * 12;
    } else {
      // Между пиками
      const a = Math.random() * Math.PI * 2;
      const r = 30 + Math.random() * 120;
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
      y = 20 + Math.random() * 30;
    }

    if (!isPointFree(x, y, z, colliders, 4)) continue;

    let tooClose = false;
    for (const s of stars) {
      const d = Math.hypot(s.x - x, s.z - z);
      if (d < 20) { tooClose = true; break; }
    }
    if (tooClose) continue;

    stars.push({ x, y, z });
  }

  return stars;
}

// горные пики — рандомная сетка
const buildings = [];
for (let i = 0; i < 30; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = 25 + Math.random() * 120;
  const w = 8 + Math.random() * 8;
  buildings.push({
    x: Math.cos(a) * r,
    z: Math.sin(a) * r,
    w,
    h: 20 + Math.random() * 35,
    d: w,
    color: [0x8a8a90, 0x7a7a80, 0x6a6a70, 0x9a9aa0][Math.floor(Math.random() * 4)],
  });
}

export const randomMountains = {
  name: 'Горы (рандом)',
  description: '14 звёзд среди случайно расставленных горных пиков. Каждый раз новый пейзаж.',
  mode: 'stars',
  skyColor: 0x8ab0d0,
  groundColor: 0x5a6a5a,
  groundBump: 2.5,
  sunColor: 0xfff0d0,
  sunIntensity: 1.2,
  hemiIntensity: 0.6,
  ambIntensity: 0.35,
  spawn: { x: 0, y: 30, z: 150, yaw: 0 },
  trees: [],
  buildings,
  randomStars,
  stars: [],
  rings: [],
};