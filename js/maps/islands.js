const rings = [
  { x:  50, y: 12, z:   0, radius: 3.5, rotation: [0, 0, 0] },
  { x:  35, y: 18, z:  35, radius: 3.5, rotation: [0, Math.PI/4, 0] },
  { x:   0, y: 22, z:  55, radius: 3.5, rotation: [0, Math.PI/2, 0] },
  { x: -35, y: 18, z:  35, radius: 3.5, rotation: [0, Math.PI*3/4, 0] },
  { x: -55, y: 15, z:   0, radius: 3.5, rotation: [0, Math.PI, 0] },
  { x: -35, y: 20, z: -35, radius: 3.5, rotation: [0, Math.PI*5/4, 0] },
  { x:   0, y: 25, z: -55, radius: 3.5, rotation: [0, Math.PI*3/2, 0] },
  { x:  35, y: 20, z: -35, radius: 3.5, rotation: [0, Math.PI*7/4, 0] },
  { x:   0, y: 40, z:   0, radius: 4.0, rotation: [Math.PI/2, 0, 0] },
];

export const islands = {
  name: 'Острова',
  description: 'Тропический архипелаг. Пролети 9 колец по кругу + финальное сверху.',
  mode: 'rings',
  skyColor: 0x6fc5e8,
  groundColor: 0x2a8a9a,
  groundBump: 0.4,
  sunColor: 0xfff0d0,
  sunIntensity: 1.3,
  hemiIntensity: 0.8,
  ambIntensity: 0.3,
  spawn: { x: 0, y: 20, z: 90 },
  trees: Array.from({ length: 60 }, () => {
    const a = Math.random() * Math.PI * 2;
    const r = 30 + Math.random() * 200;
    return {
      x: Math.cos(a) * r,
      z: Math.sin(a) * r,
      trunkR: 0.3,
      trunkH: 3 + Math.random() * 2,
      coneR: 2.5,
      coneH: 5,
    };
  }),
  buildings: [
    // "пальмы"-острова в виде холмиков
    { x:  50, z:   0, w: 20, h: 3, d: 20, color: 0x4a9a5a },
    { x:   0, z:  55, w: 18, h: 3, d: 18, color: 0x4a9a5a },
    { x: -50, z:   0, w: 20, h: 3, d: 20, color: 0x4a9a5a },
    { x:   0, z: -55, w: 20, h: 3, d: 20, color: 0x4a9a5a },
    { x:  35, z:  35, w: 14, h: 2, d: 14, color: 0x4a9a5a },
    { x: -35, z:  35, w: 14, h: 2, d: 14, color: 0x4a9a5a },
    { x: -35, z: -35, w: 14, h: 2, d: 14, color: 0x4a9a5a },
    { x:  35, z: -35, w: 14, h: 2, d: 14, color: 0x4a9a5a },
  ],
  stars: [],
  rings,
};