const rings = [];
// Каньон — узкий проход между скалами, кольца вдоль ущелья
for (let i = 0; i < 10; i++) {
  const t = i / 9;
  rings.push({
    x: Math.sin(t * Math.PI * 2) * 40,
    z: -200 + t * 400,
    y: 15 + Math.sin(t * Math.PI * 3) * 8,
    radius: 3.2,
    rotation: [0, t * Math.PI * 0.4, 0],
  });
}

// Скалы-стены с двух сторон
const buildings = [];
for (let i = 0; i < 20; i++) {
  const z = -200 + i * 22;
  const h = 25 + Math.random() * 25;
  const offL = 30 + Math.random() * 20;
  const offR = 30 + Math.random() * 20;
  buildings.push({ x: -offL, z, w: 15, h, d: 15, color: 0x8a6d4a });
  buildings.push({ x:  offR, z, w: 15, h: h + 5, d: 15, color: 0x8a6d4a });
}

export const canyon = {
  name: 'Каньон',
  description: 'Узкое ущелье между скал. Пролети 10 колец вдоль каньона.',
  mode: 'rings',
  skyColor: 0xd4a56a,
  groundColor: 0xb08050,
  groundBump: 1.8,
  sunColor: 0xffd090,
  sunIntensity: 1.3,
  hemiIntensity: 0.6,
  ambIntensity: 0.35,
  spawn: { x: 0, y: 20, z: -240 },
  trees: [],
  buildings,
  stars: [],
  rings,
};