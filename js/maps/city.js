const stars = [
  // Переулки между кварталами (в 3 раза шире, чем раньше)
  { x:  65, y: 20, z: 130 },
  { x: -65, y: 22, z: 130 },
  { x:  65, y: 20, z:-130 },
  { x: -65, y: 22, z:-130 },

  // Вдоль главных дорог
  { x: 140, y: 18, z:  10 },
  { x:-140, y: 20, z: -10 },
  { x:  10, y: 18, z: 140 },
  { x: -10, y: 20, z:-140 },

  // Между кварталами (диагональные)
  { x: 130, y: 24, z: 130 },
  { x:-130, y: 26, z: 130 },
  { x: 130, y: 24, z:-130 },
  { x:-130, y: 26, z:-130 },

  // Над крышами высоток (высотки h=140..160)
  { x:  60, y:165, z:  60 },
  { x: -60, y:150, z:  60 },
  { x:  60, y:158, z: -60 },
  { x: -60, y:172, z: -60 },

  // Дальние точки
  { x: 220, y: 30, z:  60 },
  { x:-220, y: 32, z: -60 },
  { x:  60, y: 35, z: 220 },
  { x: -60, y: 37, z:-220 },

  // Центр перекрёстка
  { x:   0, y: 50, z:   0 },
];

const ROAD_HW = 20;          // ширина дороги — 40 м
const ROAD_LEN = 350;        // длина луча — 350 м

const roads = [
  { x: 0, z: 0, w: ROAD_HW * 2, d: ROAD_HW * 2 },
  { x:  ROAD_HW + ROAD_LEN / 2, z: 0, w: ROAD_LEN, d: ROAD_HW * 2 },
  { x: -ROAD_HW - ROAD_LEN / 2, z: 0, w: ROAD_LEN, d: ROAD_HW * 2 },
  { x: 0, z:  ROAD_HW + ROAD_LEN / 2, w: ROAD_HW * 2, d: ROAD_LEN },
  { x: 0, z: -ROAD_HW - ROAD_LEN / 2, w: ROAD_HW * 2, d: ROAD_LEN },
];

export const city = {
  name: 'Город',
  description: 'Мегаполис. 21 звезда в широких переулках между небоскрёбами.',
  mode: 'stars',
  skyColor: 0x9ab8d8,
  groundColor: 0x2b2b30,

  groundTexture: 'js/assets/textures/clean_asphalt_diff_1k.jpg',
  roadTexture:   'js/assets/textures/asphalt_track_diff_1k.jpg',
  wallTexture:   { path: 'js/assets/textures/concrete_wall_001_diff_1k.jpg', repeat: 4 },

  roads,

  groundBump: 0,
  hideGrid: true,

  sunColor: 0xffe8c0,
  sunIntensity: 1.1,
  hemiIntensity: 0.5,
  ambIntensity: 0.35,

  spawn: { x: 0, y: 25, z: 260, yaw: 0 },

  trees: [],

  buildings: [
    // Квадрант +X +Z
    { x:  90, z:  90, w: 25, h: 65, d: 25, color: 0x6b7078 },
    { x: 165, z:  90, w: 20, h: 90, d: 20, color: 0x707880 },
    { x:  90, z: 165, w: 30, h: 55, d: 30, color: 0x5e646c },
    { x: 165, z: 165, w: 25, h:105, d: 25, color: 0x778088 },

    // Квадрант -X +Z
    { x: -90, z:  90, w: 30, h: 75, d: 30, color: 0x6b7078 },
    { x:-165, z:  90, w: 25, h: 95, d: 25, color: 0x707880 },
    { x: -90, z: 165, w: 25, h: 60, d: 25, color: 0x5e646c },
    { x:-165, z: 165, w: 20, h: 85, d: 20, color: 0x778088 },

    // Квадрант -X -Z
    { x: -90, z: -90, w: 35, h: 85, d: 35, color: 0x5e646c },
    { x:-165, z: -90, w: 25, h:105, d: 25, color: 0x778088 },
    { x: -90, z:-165, w: 25, h: 65, d: 25, color: 0x6b7078 },
    { x:-165, z:-165, w: 20, h: 90, d: 20, color: 0x707880 },

    // Квадрант +X -Z
    { x:  90, z: -90, w: 25, h: 78, d: 25, color: 0x6b7078 },
    { x: 165, z: -90, w: 20, h: 90, d: 20, color: 0x707880 },
    { x:  90, z:-165, w: 30, h: 65, d: 30, color: 0x5e646c },
    { x: 165, z:-165, w: 20, h: 72, d: 20, color: 0x778088 },

    // 4 высотки в центре — 150 м высоты
    { x:  60, z:  60, w: 25, h: 150, d: 25, color: 0x808890 },
    { x: -60, z:  60, w: 25, h: 135, d: 25, color: 0x808890 },
    { x:  60, z: -60, w: 25, h: 144, d: 25, color: 0x808890 },
    { x: -60, z: -60, w: 25, h: 156, d: 25, color: 0x808890 },
  ],
  stars,
  rings: [],
};