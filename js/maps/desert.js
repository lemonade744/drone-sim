function randomStars({ colliders, isPointFree }) {
  const stars = [];
  const count = 8;
  let attempts = 0;
  while (stars.length < count && attempts < 800) {
    attempts++;
    const a = Math.random() * Math.PI * 2;
    const r = 40 + Math.random() * 110;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = 15 + Math.random() * 22;

    if (!isPointFree(x, y, z, colliders, 4)) continue;

    let tooClose = false;
    for (const s of stars) {
      if (Math.hypot(s.x - x, s.z - z) < 22) { tooClose = true; break; }
    }
    if (tooClose) continue;

    stars.push({ x, y, z });
  }
  return stars;
}

const buildings = [
  { x:  60, z:  50, w: 30, h: 25, d: 30, color: 0xc08040 },
  { x: -60, z:  50, w: 25, h: 20, d: 25, color: 0xb87838 },
  { x:   0, z: -70, w: 35, h: 30, d: 35, color: 0xc88048 },
  { x:  80, z: -30, w: 20, h: 18, d: 20, color: 0xb87040 },
];

// Звёзды внутри арок
const archStars = [
  { x:  20, y: 5, z:   0 },
  { x: -20, y: 5, z:   0 },
  { x:   0, y: 5, z:  20 },
  { x:   0, y: 5, z: -20 },
];

const PLATFORM_X = 0;
const PLATFORM_Z = 90;

const TILE_STEP = 28;
const TILE_GRID = 12;
const TILE_SCALE = 1;
const TILE_Y = 0;

const models = [];

// Пол — сетка тайлов
for (let gx = -TILE_GRID / 2; gx < TILE_GRID / 2; gx++) {
  for (let gz = -TILE_GRID / 2; gz < TILE_GRID / 2; gz++) {
    models.push({
      path: 'js/assets/models/Floor_Tiles_Large.glb',
      x: (gx + 0.5) * TILE_STEP,
      y: TILE_Y,
      z: (gz + 0.5) * TILE_STEP,
      scale: TILE_SCALE,
      rotationY: 0,
      collider: false,
    });
  }
}

// Гексагон под спавн
models.push({
  path: 'js/assets/models/Aero_Ground_Hexagon_Art.glb',
  x: PLATFORM_X, y: 0, z: PLATFORM_Z,
  scale: 1,
  rotationY: 0,
  collider: { x: PLATFORM_X, z: PLATFORM_Z, r: 3.5, top: 1 },
});

// Арки
const archData = [
  { x:  20, z:   0, rot: Math.PI / 2 },
  { x: -20, z:   0, rot: -Math.PI / 2 },
  { x:   0, z:  20, rot: 0 },
  { x:   0, z: -20, rot: Math.PI },
];

for (const arch of archData) {
  models.push({
    path: 'js/assets/models/Aero_Door_01.glb',
    x: arch.x, y: 0, z: arch.z,
    scale: 1,
    rotationY: arch.rot,
    collider: false,
  });
}

// === Коллайдеры арок ===
const extraColliders = [];

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

  for (const sign of [1, -1]) {
    const localX = sign * LEG_OFFSET;
    const worldX = arch.x + localX * cosR;
    const worldZ = arch.z - localX * sinR;

    extraColliders.push({
      x: worldX,
      z: worldZ,
      r: LEG_RADIUS,
      top: ARCH_TOP,
    });
  }

  extraColliders.push({
    type: 'box',
    x: arch.x,
    z: arch.z,
    hw: BEAM_HW,
    hd: BEAM_HD,
    rot: arch.rot,
    bottom: BEAM_BOTTOM,
    top: BEAM_TOP,
  });
}

export const desert = {
  name: 'Пустыня',
  description: 'Пустыня с пирамидами и заброшенным космодромом. 12 звёзд.',
  mode: 'stars',
  skyColor: 0xf0c890,
  groundColor: 0xd4a868,
  groundBump: 0,
  hideGrid: true,
  sunColor: 0xffe0a0,
  sunIntensity: 1.5,
  hemiIntensity: 0.75,
  ambIntensity: 0.35,

  spawn: { x: PLATFORM_X, y: 3, z: PLATFORM_Z, yaw: 0, onGround: true },

  trees: [],
  buildings,
  models,
  extraColliders,
  randomStars,
  stars: archStars,
  rings: [],
};