// Деревья везде, кроме узких коридоров вдоль колец
const trees = [];
const rings = [];
// кольца идут по змейке через лес
for (let i = 0; i < 14; i++) {
  const t = i / 13;
  const pathX = Math.sin(t * Math.PI * 3) * 60;
  const pathZ = -180 + t * 360;
  rings.push({
    x: pathX,
    z: pathZ,
    y: 12 + Math.sin(t * Math.PI * 2) * 3,
    radius: 2.8,
    rotation: [0, 0, 0],
  });
}

const models = [
  {
    path: 'js/assets/models/Floor.glb',
    x: 0, y: 0, z: 0,
    scale: 40,       // ← подберём: если модель 10×10 м, при 40 = 400×400
    rotationY: 0,
    collider: false,
  },
];

// деревья вокруг колец, с зазором 8-15 м (пролетать можно, но впритык)
for (let i = 0; i < 300; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = Math.random() * 250;
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;

  // не сажаем ближе 6 м к любому кольцу
  let tooClose = false;
  for (const ring of rings) {
    if (Math.hypot(x - ring.x, z - ring.z) < 6) { tooClose = true; break; }
  }
  if (tooClose) continue;

  trees.push({
    x, z,
    trunkR: 0.3,
    trunkH: 4 + Math.random() * 3,
    coneR: 2 + Math.random() * 1.2,
    coneH: 6 + Math.random() * 3,
  });
}

export const forest = {
  name: 'Лес',
  description: 'Густой хвойный лес. 14 колец по змейке через чащу — деревья вплотную.',
  mode: 'rings',
  skyColor: 0x9ac0d0,
  groundColor: 0x2a5a2a,
  groundBump: 1.2,
  sunColor: 0xfff0d0,
  sunIntensity: 1.1,
  hemiIntensity: 0.6,
  ambIntensity: 0.35,
  spawn: { x: 0, y: 15, z: 0, yaw: 0 },
  trees,
  models,
  buildings: [],
  stars: [],
  rings,
};