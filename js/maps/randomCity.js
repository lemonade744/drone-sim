// генерация звёзд для города над крышами
function randomStars({ colliders, isPointFree }) {
  const stars = [];
  const count = 12;
  const maxAttempts = 500;
  let attempts = 0;

  // Собираем верхушки зданий как "опоры"
  const rooftops = colliders
    .filter(c => c.top > 10)
    .map(c => ({ x: c.x, z: c.z, top: c.top, r: c.r }));

  while (stars.length < count && attempts < maxAttempts) {
    attempts++;
    let x, y, z;

    if (rooftops.length > 0 && Math.random() < 0.7) {
      // Над случайной крышей + запас 5-15 м
      const roof = rooftops[Math.floor(Math.random() * rooftops.length)];
      x = roof.x + (Math.random() - 0.5) * 4;
      z = roof.z + (Math.random() - 0.5) * 4;
      y = roof.top + 5 + Math.random() * 15;
    } else {
      // Свободная точка в радиусе 150 м от центра
      const a = Math.random() * Math.PI * 2;
      const r = 40 + Math.random() * 110;
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
      y = 15 + Math.random() * 40;
    }

    // Проверка, что не внутри здания и не слишком близко к другим звёздам
    if (!isPointFree(x, y, z, colliders, 4)) continue;
    let tooClose = false;
    for (const s of stars) {
      const d = Math.hypot(s.x - x, s.z - z);
      if (d < 25) { tooClose = true; break; }
    }
    if (tooClose) continue;

    stars.push({ x, y, z });
  }

  return stars;
}

// здания — те же, что были, но ставим их плотнее
const buildings = [
  { x:  20, z:  20, w: 8,  h: 18, d: 8,  color: 0x6b7078 },
  { x:  32, z:  20, w: 6,  h: 26, d: 6,  color: 0x707880 },
  { x:  20, z:  32, w: 10, h: 14, d: 10, color: 0x5e646c },
  { x:  32, z:  32, w: 6,  h: 32, d: 6,  color: 0x778088 },
  { x: -30, z:  25, w: 10, h: 22, d: 10, color: 0x6b7078 },
  { x: -42, z:  25, w: 8,  h: 30, d: 8,  color: 0x707880 },
  { x: -30, z: -30, w: 12, h: 26, d: 12, color: 0x5e646c },
  { x: -42, z: -30, w: 8,  h: 34, d: 8,  color: 0x778088 },
  { x:  40, z: -10, w: 8,  h: 24, d: 8,  color: 0x6b7078 },
  { x:  55, z:  30, w: 10, h: 20, d: 10, color: 0x707880 },
  { x: -50, z:   5, w: 8,  h: 28, d: 8,  color: 0x5e646c },
  { x: -20, z: -55, w: 10, h: 32, d: 10, color: 0x778088 },
  { x:  70, z: -20, w: 6,  h: 22, d: 6,  color: 0x6b7078 },
  { x: -65, z: -10, w: 6,  h: 26, d: 6,  color: 0x707880 },
  { x:   0, z:   0, w: 12, h: 40, d: 12, color: 0x808890 },
  { x:   0, z:  60, w: 8,  h: 18, d: 8,  color: 0x6b7078 },
  { x:  35, z:  55, w: 8,  h: 22, d: 8,  color: 0x707880 },
  { x:  45, z:  45, w: 8,  h: 28, d: 8,  color: 0x6b7078 },
  { x: -45, z:  45, w: 10, h: 25, d: 10, color: 0x707880 },
  { x:  60, z: -40, w: 8,  h: 30, d: 8,  color: 0x5e646c },
  { x: -55, z: -50, w: 10, h: 27, d: 10, color: 0x778088 },
];

export const randomCity = {
  name: 'Город (рандом)',
  description: 'Каждый раз 12 звёзд в новых местах над крышами и в переулках.',
  mode: 'stars',
  skyColor: 0x9ab8d8,
  groundColor: 0x2b2b30,
  groundBump: 0.15,
  sunColor: 0xffe8c0,
  sunIntensity: 1.1,
  hemiIntensity: 0.5,
  ambIntensity: 0.35,
  spawn: { x: 0, y: 15, z: 90, yaw: 0 },
  trees: [],
  buildings,
  randomStars,
  stars: [],   // на случай, если генератор не сработает
  rings: [],
};