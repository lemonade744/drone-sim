const stars = [
  // в переулках между пиками
  { x:  20, y: 30, z:  40 },   // между (40,40) h=30 и (0,0) h=45
  { x: -22, y: 32, z:  30 },   // между (-45,30) h=35 и (0,0)
  { x:  30, y: 28, z: -30 },   // между (60,-30) h=28 и (30,-60) h=32
  { x: -25, y: 38, z: -35 },   // между (-50,-40) h=40 и (-30,65)...
  // над пиками
  { x:   0, y: 55, z:   0 },   // над центральным h=45
  { x:  40, y: 40, z:  40 },   // над h=30
  { x: -45, y: 45, z:  30 },   // над h=35
  { x:  60, y: 38, z: -30 },   // над h=28
  { x: -50, y: 50, z: -40 },   // над h=40
  { x:  30, y: 42, z: -60 },   // над h=32
];

export const snow = {
  name: 'Снега',
  description: 'Заснеженные горы. 10 звёзд среди ледяных пиков — часть в узких переулках.',
  mode: 'stars',
  skyColor: 0xc8dde8,
  groundColor: 0xf0f4f8,
  groundBump: 2.0,
  sunColor: 0xffffff,
  sunIntensity: 1.0,
  hemiIntensity: 0.8,
  ambIntensity: 0.4,
  spawn: { x: 0, y: 15, z: 90, yaw: 0 },
  trees: Array.from({ length: 30 }, () => {
    const a = Math.random() * Math.PI * 2;
    const r = 30 + Math.random() * 200;
    return {
      x: Math.cos(a) * r,
      z: Math.sin(a) * r,
      trunkR: 0.2,
      trunkH: 1.5,
      coneR: 1.2,
      coneH: 3,
    };
  }),
  buildings: [
    { x:  40, z:  40, w: 12, h: 30, d: 12, color: 0xd8e8f0 },
    { x: -45, z:  30, w: 14, h: 35, d: 14, color: 0xd0e0e8 },
    { x:  60, z: -30, w: 10, h: 28, d: 10, color: 0xd8e8f0 },
    { x: -50, z: -40, w: 16, h: 40, d: 16, color: 0xe0ecf4 },
    { x:   0, z:   0, w: 18, h: 45, d: 18, color: 0xe8f2f8 },
    { x:  30, z: -60, w: 12, h: 32, d: 12, color: 0xd8e8f0 },
    { x: -30, z:  65, w: 14, h: 38, d: 14, color: 0xd0e0e8 },
  ],
  stars,
  rings: [],
};