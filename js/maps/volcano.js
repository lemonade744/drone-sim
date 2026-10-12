const rings = [];
// спираль вплотную к ступеням вулкана, летим вверх
for (let i = 0; i < 14; i++) {
  const a = (i / 14) * Math.PI * 2.5;   // 2.5 оборота
  // радиус плавно растёт, чтобы облетать ступени
  const r = 26 + i * 3;   // от 26 до 65
  rings.push({
    x: Math.cos(a) * r,
    z: Math.sin(a) * r,
    y: 14 + i * 2.5,      // от 14 до 46
    radius: 3.0,
    rotation: [0, a + Math.PI/2, 0],
  });
}

export const volcano = {
  name: 'Вулкан',
  description: 'Опасный кратер. 14 колец по спирали вокруг вулкана — не задень ступени.',
  mode: 'rings',
  skyColor: 0x3a1818,
  groundColor: 0x2a1a1a,
  groundBump: 1.5,
  sunColor: 0xff6030,
  sunIntensity: 1.4,
  hemiIntensity: 0.35,
  ambIntensity: 0.3,
  spawn: { x: 0, y: 15, z: 120, yaw: 0 },
  trees: [],
  buildings: [
    // ступени конуса
    { x: 0, z: 0, w: 44, h: 15, d: 44, color: 0x3a1a10 },
    { x: 0, z: 0, w: 34, h: 25, d: 34, color: 0x4a2018 },
    { x: 0, z: 0, w: 24, h: 35, d: 24, color: 0x5a2820 },
    { x: 0, z: 0, w: 14, h: 42, d: 14, color: 0xff4020 },
    // побочные конусы
    { x:  80, z:  30, w: 14, h: 14, d: 14, color: 0x3a1a10 },
    { x: -70, z:  50, w: 12, h: 12, d: 12, color: 0x3a1a10 },
    { x:  40, z: -80, w: 16, h: 16, d: 16, color: 0x3a1a10 },
    { x: -50, z: -60, w: 14, h: 13, d: 14, color: 0x3a1a10 },
  ],
  stars: [],
  rings,
};