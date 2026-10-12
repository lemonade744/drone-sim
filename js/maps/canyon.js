// каньон: две стены по бокам, извилистые
const buildings = [];
// генерируем по 25 "зубов" вдоль Z
for (let i = 0; i < 25; i++) {
  const z = -240 + i * 20;
  // левая стена
  const offL = 25 + Math.sin(z * 0.05) * 8;  // извивается
  buildings.push({ x: -offL, z, w: 12, h: 30 + Math.sin(z*0.03)*10, d: 12, color: 0x8a6d4a });
  // правая стена
  const offR = 25 + Math.cos(z * 0.07) * 8;
  buildings.push({ x:  offR, z, w: 12, h: 32 + Math.cos(z*0.04)*10, d: 12, color: 0x8a6d4a });
}

// кольца точно в центре ущелья, между стенами, на низкой высоте
const rings = [];
for (let i = 0; i < 12; i++) {
  const t = i / 11;
  const z = -230 + t * 460;
  const offL = 25 + Math.sin(z * 0.05) * 8;
  const offR = 25 + Math.cos(z * 0.07) * 8;
  const cx = (offL - offR) / 2 + (offL - offR) * 0.1; // чуть не в центре — сложнее
  rings.push({
    x: cx,
    z,
    y: 12 + Math.sin(t * Math.PI * 3) * 4,
    radius: 3.0,
    rotation: [0, Math.sin(z * 0.02) * Math.PI * 0.3, 0],
  });
}

export const canyon = {
  name: 'Каньон',
  description: 'Извилистое ущелье. 12 колец в узком проходе между скал — точность обязательна.',
  mode: 'rings',
  skyColor: 0xd4a56a,
  groundColor: 0xb08050,
  groundBump: 1.5,
  sunColor: 0xffd090,
  sunIntensity: 1.3,
  hemiIntensity: 0.6,
  ambIntensity: 0.35,
  spawn: { x: 0, y: 20, z: -250, yaw: Math.PI },
  trees: [],
  buildings,
  stars: [],
  rings,
};