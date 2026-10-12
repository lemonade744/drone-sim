// лабиринт из стен
const walls = [];
const SIZE = 20;
const CELL = 20;
// генерируем сетку стен псевдослучайно, но детерминированно
let seed = 42;
function rnd() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}
for (let gx = -4; gx <= 4; gx++) {
  for (let gz = -4; gz <= 4; gz++) {
    if (gx === 0 && gz === 0) continue; // центр свободен
    if (rnd() < 0.55) {
      walls.push({
        x: gx * CELL,
        z: gz * CELL,
        w: 8,
        h: 20 + rnd() * 10,
        d: 8,
        color: 0x708090,
      });
    }
  }
}

export const labyrinth = {
  name: 'Лабиринт',
  description: 'Каменный лабиринт. Пролети сквозь кольца над стенами, не задень их.',
  mode: 'rings',
  skyColor: 0x8a90a0,
  groundColor: 0x404850,
  groundBump: 0.2,
  sunColor: 0xdde0ff,
  sunIntensity: 1.0,
  hemiIntensity: 0.55,
  ambIntensity: 0.4,
  spawn: { x: 0, y: 15, z: 100 },
  trees: [],
  buildings: walls,
  stars: [],
  rings: (() => {
    const arr = [];
    // кольца над стенами по спирали
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const r = 30 + i * 4;
      arr.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        y: 25 + i * 1.5,
        radius: 3.5,
        rotation: [0, a + Math.PI/2, 0],
      });
    }
    return arr;
  })(),
};