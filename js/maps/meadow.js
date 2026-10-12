const rings = [];
for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 1.2 - Math.PI * 0.6;
  const radius = 60 + i * 8;
  rings.push({
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
    y: 16 + Math.sin(i * 1.3) * 4,   // поднято с 12, ±6 до 16, ±4
    radius: 3.5,
    rotation: [0, angle + Math.PI / 2, 0],
  });
}

export const meadow = {
  name: 'Луг',
  description: 'Открытая зелёная зона. Пролети через 8 колец по дуге, начиная от старта.',
  mode: 'rings',
  skyColor: 0x87ceeb,
  groundColor: 0x3f7a3f,
  groundBump: 1,
  sunColor: 0xffffff,
  sunIntensity: 1.2,
  hemiIntensity: 0.7,
  ambIntensity: 0.25,

  spawn: { x: 0, y: 12, z: 30, yaw: 0 },

  trees: Array.from({ length: 80 }, () => {
    const a = Math.random() * Math.PI * 2;
    const r = 40 + Math.random() * 220;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const trunkR = 0.25 + Math.random() * 0.2;
    const trunkH = 2 + Math.random() * 2;
    const coneR = 1.6 + Math.random() * 0.9;
    const coneH = 4 + Math.random() * 2;
    return { x, z, trunkR, trunkH, coneR, coneH };
  }),
  buildings: [],
  rings,
};