function randomRings({ colliders, isPointFree }) {
  const rings = [];
  const count = 12;
  let attempts = 0;
  while (rings.length < count && attempts < 500) {
    attempts++;
    const a = Math.random() * Math.PI * 2;
    const r = 30 + Math.random() * 150;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = 14 + Math.random() * 8;

    if (!isPointFree(x, y, z, colliders, 5)) continue;

    let tooClose = false;
    for (const rr of rings) {
      const d = Math.hypot(rr.x - x, rr.z - z);
      if (d < 25) { tooClose = true; break; }
    }
    if (tooClose) continue;

    rings.push({
      x, y, z,
      radius: 3.0,
      rotation: [0, Math.random() * Math.PI, 0],
    });
  }
  return rings;
}

const trees = Array.from({ length: 250 }, () => {
  const a = Math.random() * Math.PI * 2;
  const r = Math.random() * 250;
  return {
    x: Math.cos(a) * r,
    z: Math.sin(a) * r,
    trunkR: 0.25 + Math.random() * 0.15,
    trunkH: 3 + Math.random() * 3,
    coneR: 1.5 + Math.random() * 1.0,
    coneH: 5 + Math.random() * 3,
  };
});

export const randomForest = {
  name: 'Лес (рандом)',
  description: '12 колец в случайных точках густого леса. Никогда не знаешь, куда лететь.',
  mode: 'rings',
  skyColor: 0x9ac0d0,
  groundColor: 0x2a5a2a,
  groundBump: 1.2,
  sunColor: 0xfff0d0,
  sunIntensity: 1.1,
  hemiIntensity: 0.6,
  ambIntensity: 0.35,
  spawn: { x: 0, y: 20, z: 0, yaw: 0 },
  trees,
  buildings: [],
  randomRings,
  stars: [],
  rings: [],
};