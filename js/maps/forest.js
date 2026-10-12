const rings = [];
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2;
  const r = 70;
  rings.push({
    x: Math.cos(a) * r,
    z: Math.sin(a) * r,
    y: 10 + Math.sin(i * 1.7) * 4,
    radius: 3.0,
    rotation: [0, a + Math.PI/2, 0],
  });
}

// густой лес
const trees = [];
for (let i = 0; i < 300; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = Math.random() * 250;
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;
  // не сажаем в центре круга с кольцами
  if (Math.hypot(x, z) > 55 && Math.hypot(x, z) < 85) continue;
  trees.push({
    x, z,
    trunkR: 0.25 + Math.random() * 0.15,
    trunkH: 3 + Math.random() * 3,
    coneR: 1.5 + Math.random() * 1.0,
    coneH: 5 + Math.random() * 3,
  });
}

export const forest = {
  name: 'Лес',
  description: 'Густой хвойный лес. Пролети 12 колец по кругу между деревьями.',
  mode: 'rings',
  skyColor: 0x9ac0d0,
  groundColor: 0x2a5a2a,
  groundBump: 1.2,
  sunColor: 0xfff0d0,
  sunIntensity: 1.1,
  hemiIntensity: 0.6,
  ambIntensity: 0.35,
  spawn: { x: 0, y: 15, z: 0 },
  trees,
  buildings: [],
  stars: [],
  rings,
};