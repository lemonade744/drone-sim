const stars = [
  // над башнями
  { x:  30, y: 30, z:  30 },   // h=24
  { x: -40, y: 36, z:  20 },   // h=30
  { x:  50, y: 34, z: -30 },   // h=28
  { x: -25, y: 42, z: -50 },   // h=36
  { x:   0, y: 60, z:   0 },   // центральная h=50
  { x:  60, y: 32, z:  50 },   // h=26
  { x: -60, y: 38, z: -40 },   // h=32
  { x:  20, y: 28, z: -70 },   // h=22
  { x: -30, y: 40, z:  70 },   // h=34
  { x:  70, y: 32, z: -10 },   // h=26
];

export const night = {
  name: 'Ночь',
  description: 'Тёмный город в огнях. Собери 10 звёзд в ночном небе.',
  mode: 'stars',
  skyColor: 0x0a0f1f,
  groundColor: 0x101418,
  groundBump: 0.1,
  sunColor: 0x3a4a70,
  sunIntensity: 0.35,
  hemiIntensity: 0.25,
  ambIntensity: 0.2,
  spawn: { x: 0, y: 15, z: 90, yaw: 0 },
  trees: [],
  buildings: [
    { x:  30, z:  30, w: 8,  h: 24, d: 8,  color: 0x1a1f2a },
    { x: -40, z:  20, w: 10, h: 30, d: 10, color: 0x1a1f2a },
    { x:  50, z: -30, w: 8,  h: 28, d: 8,  color: 0x1a1f2a },
    { x: -25, z: -50, w: 12, h: 36, d: 12, color: 0x1a1f2a },
    { x:   0, z:   0, w: 14, h: 50, d: 14, color: 0x1a1f2a },
    { x:  60, z:  50, w: 8,  h: 26, d: 8,  color: 0x1a1f2a },
    { x: -60, z: -40, w: 10, h: 32, d: 10, color: 0x1a1f2a },
    { x:  20, z: -70, w: 8,  h: 22, d: 8,  color: 0x1a1f2a },
    { x: -30, z:  70, w: 10, h: 34, d: 10, color: 0x1a1f2a },
    { x:  70, z: -10, w: 6,  h: 26, d: 6,  color: 0x1a1f2a },
  ],
  stars,
  rings: [],
};