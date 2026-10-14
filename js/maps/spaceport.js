function randomStars({ colliders, isPointFree }) {
  const stars = [];
  const count = 21;
  let attempts = 0;

  while (stars.length < count && attempts < 800) {
    attempts++;
    const a = Math.random() * Math.PI * 2;
    const r = 60 + Math.random() * 120;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = 15 + Math.random() * 25;

    if (!isPointFree(x, y, z, colliders, 4)) continue;

    let tooClose = false;
    for (const s of stars) {
      if (Math.hypot(s.x - x, s.z - z) < 25) { tooClose = true; break; }
    }
    if (tooClose) continue;

    stars.push({ x, y, z });
  }
  return stars;
}

const PLATFORM_X = 0;
const PLATFORM_Z = 90;

// === 8 арок вокруг центра, разные повороты и высоты ===
const archData = [
  { x:  55, z:   0, y:  0, rot: Math.PI / 2 },
  { x: -75, z:   0, y:  6, rot: -Math.PI / 2 },
  { x:   0, z:  60, y: 10, rot: 0 },
  { x:   0, z: -90, y: 16, rot: Math.PI },
  { x:  45, z:  45, y:  4, rot: Math.PI / 4 },
  { x: -40, z:  55, y: 12, rot: -Math.PI / 4 },
  { x:  50, z: -35, y: 20, rot: Math.PI * 3 / 4 },
  { x: -35, z: -50, y: 24, rot: -Math.PI * 3 / 4 },
];

const airshipData = [
  { x: -80, z: -60, y: 0,  rot: 0 },
  { x:  80, z: -60, y: 8,  rot: Math.PI / 4 },
  { x: -80, z:  60, y: 15, rot: -Math.PI / 4 },
  { x:  80, z:  60, y: 22, rot: Math.PI / 2 },
];

// === Фиксированные звёзды ===
// 1 на верхушке станции (0, 0, 0), y = 30
// 4 между сферой и корзиной каждого дирижабля — примерно y0 + 5 (ниже шара, выше корзины)
const fixedStars = [
  // Верхушка станции
  { x: 0, y: 30, z: 0 },

  // Между шаром и корзиной каждого дирижабля
  { x: airshipData[0].x, y: airshipData[0].y + 5, z: airshipData[0].z },
  { x: airshipData[1].x, y: airshipData[1].y + 5, z: airshipData[1].z },
  { x: airshipData[2].x, y: airshipData[2].y + 5, z: airshipData[2].z },
  { x: airshipData[3].x, y: airshipData[3].y + 5, z: airshipData[3].z },

  // По одной звезде внутри каждой арки — на высоте BEAM_BOTTOM (12)
  // Плюс смещение по y0, если арка поднята.
  ...archData.map(a => ({
    x: a.x,
    y: (a.y ?? 0) + 8,
    z: a.z,
  })),
];

// === Модели ===
const models = [
  // Гексагон — спавн
  {
    path: 'js/assets/models/Aero_Ground_Hexagon_Art.glb',
    x: PLATFORM_X, y: 0, z: PLATFORM_Z,
    scale: 1,
    rotationY: 0,
    collider: { x: PLATFORM_X, z: PLATFORM_Z, r: 3.5, top: 1 },
  },

  // Все 8 арок
  ...archData.map(a => ({
    path: 'js/assets/models/Aero_Door_01.glb',
    x: a.x, y: a.y, z: a.z,
    scale: 1,
    rotationY: a.rot,
    collider: false,
  })),

  // Станция — одна, в центре
  {
    path: 'js/assets/models/Aero_Station_01_Art.glb',
    x: 0, y: 0, z: 0,
    scale: 1,
    rotationY: 0,
    collider: false,
  },

  // Все 4 дирижабля
  ...airshipData.map(a => ({
    path: 'js/assets/models/Aero_Airship_01.glb',
    x: a.x, y: a.y, z: a.z,
    scale: 1,
    rotationY: a.rot,
    collider: false,
  })),
];

const extraColliders = [];

// === Коллайдеры арок ===
const LEG_OFFSET = 9.0;
const LEG_RADIUS = 0.9;
const ARCH_TOP = 10;

const BEAM_HW = 8.5;
const BEAM_HD = 1;
const BEAM_BOTTOM = 12;
const BEAM_TOP = 15;

for (const arch of archData) {
  const cosR = Math.cos(arch.rot);
  const sinR = Math.sin(arch.rot);
  const y0 = arch.y ?? 0;

  // Ножки — в диапазоне [y0, y0 + ARCH_TOP]
  for (const sign of [1, -1]) {
    const localX = sign * LEG_OFFSET;
    const worldX = arch.x + localX * cosR;
    const worldZ = arch.z - localX * sinR;

    extraColliders.push({
      x: worldX,
      z: worldZ,
      r: LEG_RADIUS,
      bottom: y0,
      top: y0 + ARCH_TOP,
    });
  }

  // Перекладина — тоже смещается по высоте
  extraColliders.push({
    type: 'box',
    x: arch.x,
    z: arch.z,
    hw: BEAM_HW,
    hd: BEAM_HD,
    rot: arch.rot,
    bottom: y0 + BEAM_BOTTOM,
    top: y0 + BEAM_TOP,
  });
}

// === Коллайдеры дирижаблей ===
for (const a of airshipData) {
  const y0 = a.y;
  const cosR = Math.cos(a.rot);
  const sinR = Math.sin(a.rot);

  // Корзина
  extraColliders.push({
    x: a.x, z: a.z,
    r: 2.5,
    bottom: y0,
    top: y0 + 1.5,
  });

  // Шар
  extraColliders.push({
    x: a.x, z: a.z,
    r: 7,
    bottom: y0 + 9,
    top: y0 + 20,
  });

  // Крылья — 2 box'а сбоку.
  // ВАЖНО: инвертируем знак sinR при повороте offset'а,
  // потому что rotationY в Three.js крутит в другую сторону.
  for (const sign of [1, -1]) {
    const lx = sign * 5.5;
    const lz = -4;

    const wx = a.x + lx * cosR + lz * sinR;
    const wz = a.z - lx * sinR + lz * cosR;

    extraColliders.push({
      type: 'box',
      x: wx, z: wz,
      hw: 5,
      hd: 1.2,
      rot: a.rot + Math.PI / 2,
      bottom: y0 + 20,
      top: y0 + 23,
    });
  }
}

// === Коллайдер станции — одна, в центре ===
const STATION_X = 0;
const STATION_Z = 0;

extraColliders.push({
  x: STATION_X, z: STATION_Z,
  r: 7.5,
  top: 28.5,
});

export const spaceport = {
  name: 'Космодром',
  description: 'Орбитальная станция. 10 звёзд среди арок, станций и дирижаблей.',
  mode: 'stars',
  skyColor: 0x3a5a8a,
  groundColor: 0x3a4a5a,
  groundBump: 0,
  hideGrid: true,
  sunColor: 0xffd8a0,
  sunIntensity: 1.6,
  hemiIntensity: 1.0,
  ambIntensity: 0.6,

  spawn: { x: PLATFORM_X, y: 3, z: PLATFORM_Z, yaw: 0, onGround: true },

  trees: [],
  buildings: [],
  models,
  extraColliders,
  randomStars,
  stars: fixedStars,
  rings: [],
};