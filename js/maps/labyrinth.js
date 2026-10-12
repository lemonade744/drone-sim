// Лабиринт: сетка стен 5x5, коридоры шириной ~12 м
const CELL = 20;        // расстояние между центрами стен
const WALL_W = 8;       // ширина стены по XZ
const GAP = CELL - WALL_W; // 12 м — ширина коридора

const walls = [];
// Схема лабиринта: 1 = стена, 0 = проход. 5x5.
// Рисуем "зигзаг" — есть путь через весь лабиринт
const grid = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
];
for (let gz = 0; gz < 5; gz++) {
  for (let gx = 0; gx < 5; gx++) {
    if (grid[gz][gx] !== 1) continue;
    walls.push({
      x: (gx - 2) * CELL,
      z: (gz - 2) * CELL,
      w: WALL_W,
      h: 22,
      d: WALL_W,
      color: 0x708090,
    });
  }
}

// Кольца строго в коридорах (проверено вручную по сетке выше)
const rings = [
  // проход между первым и вторым рядом стен, летим по X от -40 до +40
  { x: -30, y: 26, z: -30, radius: 3.0, rotation: [0, Math.PI/2, 0] },
  { x: -10, y: 26, z: -30, radius: 3.0, rotation: [0, Math.PI/2, 0] },
  { x:  10, y: 26, z: -30, radius: 3.0, rotation: [0, Math.PI/2, 0] },
  // поворот вниз по Z
  { x:  30, y: 28, z: -20, radius: 3.0, rotation: [0, 0, 0] },
  { x:  30, y: 30, z:   0, radius: 3.0, rotation: [0, 0, 0] },
  // поворот влево, летим по X от +30 до -30
  { x:  10, y: 30, z:  20, radius: 3.0, rotation: [0, Math.PI/2, 0] },
  { x: -10, y: 28, z:  20, radius: 3.0, rotation: [0, Math.PI/2, 0] },
  { x: -30, y: 26, z:  20, radius: 3.0, rotation: [0, Math.PI/2, 0] },
  // финальное над центром
  { x:   0, y: 40, z:   0, radius: 3.5, rotation: [Math.PI/2, 0, 0] },
];

export const labyrinth = {
  name: 'Лабиринт',
  description: 'Сетка каменных стен. Пролети через 9 колец по коридорам — не задень стены.',
  mode: 'rings',
  skyColor: 0x8a90a0,
  groundColor: 0x404850,
  groundBump: 0.1,
  sunColor: 0xdde0ff,
  sunIntensity: 1.0,
  hemiIntensity: 0.55,
  ambIntensity: 0.4,
  spawn: { x: 0, y: 15, z: 90, yaw: 0 },
  trees: [],
  buildings: walls,
  stars: [],
  rings,
};