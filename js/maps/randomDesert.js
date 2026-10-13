function randomStars({ colliders, isPointFree }) {
  const stars = [];
  const count = 15;
  let attempts = 0;

  while (stars.length < count && attempts < 500) {
    attempts++;
    const a = Math.random() * Math.PI * 2;
    const r = 30 + Math.random() * 140;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = 10 + Math.random() * 25;

    if (!isPointFree(x, y, z, colliders, 4)) continue;

    let tooClose = false;
    for (const s of stars) {
      const d = Math.hypot(s.x - x, s.z - z);
      if (d < 22) { tooClose = true; break; }
    }
    if (tooClose) continue;

    stars.push({ x, y, z });
  }
  return stars;
}

// пирамиды в случайных местах
const buildings = [];
for (let i = 0; i < 6; i++) {
  const a = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
  const r = 60 + Math.random() * 60;
  const w = 20 + Math.random() * 15;
  buildings.push({
    x: Math.cos(a) * r,
    z: Math.sin(a) * r,
    w,
    h: 18 + Math.random() * 15,
    d: w,
    color: 0xc08040,
  });
}

export const randomDesert = {
  name: 'Пустыня (рандом)',
  description: '15 звёзд в пустыне с пирамидами. Каждый запуск — новые координаты.',
  mode: 'stars',
  skyColor: 0xf0c890,
  groundColor: 0xd4a868,
  groundBump: 2.5,
  sunColor: 0xffe0a0,
  sunIntensity: 1.5,
  hemiIntensity: 0.75,
  ambIntensity: 0.35,
  spawn: { x: 0, y: 15, z: 100, yaw: 0 },
  trees: [],
  buildings,
  randomStars,
  stars: [],
  rings: [],
};