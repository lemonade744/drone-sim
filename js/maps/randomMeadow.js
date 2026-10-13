function randomRings({ colliders, isPointFree }) {
  const rings = [];
  const count = 10;
  const maxAttempts = 500;
  let attempts = 0;

  while (rings.length < count && attempts < maxAttempts) {
    attempts++;
    const a = Math.random() * Math.PI * 2;
    const r = 40 + Math.random() * 130;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = 14 + Math.random() * 16;

    if (!isPointFree(x, y, z, colliders, 5)) continue;

    // Не слишком близко к другим кольцам
    let tooClose = false;
    for (const rr of rings) {
      const d = Math.hypot(rr.x - x, rr.z - z);
      if (d < 30) { tooClose = true; break; }
    }
    if (tooClose) continue;

    rings.push({
      x, y, z,
      radius: 3.2,
      rotation: [0, Math.random() * Math.PI, 0],
    });
  }

  return rings;
}

// деревья тоже рандомные — 100 штук
const trees = Array.from({ length: 100 }, () => {
  const a = Math.random() * Math.PI * 2;
  const r = 30 + Math.random() * 220;
  return {
    x: Math.cos(a) * r,
    z: Math.sin(a) * r,
    trunkR: 0.25 + Math.random() * 0.2,
    trunkH: 2 + Math.random() * 2,
    coneR: 1.6 + Math.random() * 0.9,
    coneH: 4 + Math.random() * 2,
  };
});

export const randomMeadow = {
  name: 'Луг (рандом)',
  description: '10 колец в случайных местах среди деревьев. Каждый запуск — новый маршрут.',
  mode: 'rings',
  skyColor: 0x87ceeb,
  groundColor: 0x3f7a3f,
  groundBump: 1,
  sunColor: 0xffffff,
  sunIntensity: 1.2,
  hemiIntensity: 0.7,
  ambIntensity: 0.25,
  spawn: { x: 0, y: 15, z: 0, yaw: 0 },
  trees,
  buildings: [],
  randomRings,
  stars: [],
  rings: [],
};