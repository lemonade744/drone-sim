const rings = [];
// спираль вокруг вулкана
for (let i = 0; i < 11; i++) {
  const a = (i / 11) * Math.PI * 3;
  const r = 30 + i * 6;
  rings.push({
    x: Math.cos(a) * r,
    z: Math.sin(a) * r,
    y: 15 + i * 2.5,
    radius: 3.2,
    rotation: [0, a + Math.PI/2, 0],
  });
}

export const volcano = {
  name: 'Вулкан',
  description: 'Опасный кратер. Пролети 11 колец по спирали вокруг вулкана.',
  mode: 'rings',
  skyColor: 0x3a1818,
  groundColor: 0x2a1a1a,
  groundBump: 1.5,
  sunColor: 0xff6030,
  sunIntensity: 1.4,
  hemiIntensity: 0.35,
  ambIntensity: 0.3,
  spawn: { x: 0, y: 15, z: 120 },
  trees: [],
  buildings: [
    // вулкан — конус из нескольких блоков
    { x: 0, z: 0, w: 40, h: 15, d: 40, color: 0x3a1a10 },
    { x: 0, z: 0, w: 32, h: 25, d: 32, color: 0x4a2018 },
    { x: 0, z: 0, w: 22, h: 35, d: 22, color: 0x5a2820 },
    { x: 0, z: 0, w: 12, h: 42, d: 12, color: 0xff4020 },
    // мелкие кратеры
    { x:  80, z:  30, w: 12, h: 10, d: 12, color: 0x3a1a10 },
    { x: -70, z:  50, w: 10, h: 8,  d: 10, color: 0x3a1a10 },
    { x:  40, z: -80, w: 14, h: 12, d: 14, color: 0x3a1a10 },
    { x: -50, z: -60, w: 12, h: 9,  d: 12, color: 0x3a1a10 },
  ],
  stars: [],
  rings,
};