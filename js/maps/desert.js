const stars = [
  { x:  40, y: 12, z:  40 },
  { x: -40, y: 15, z:  30 },
  { x:  60, y: 20, z: -20 },
  { x: -55, y: 18, z: -40 },
  { x:  20, y: 25, z: -60 },
  { x: -20, y: 30, z:  60 },
  { x:   0, y: 22, z:   0 },
  { x:  75, y: 16, z:  10 },
  { x: -70, y: 24, z:  50 },
  { x:  30, y: 35, z:  80 },
  { x: -30, y: 28, z: -80 },
];

export const desert = {
  name: 'Пустыня',
  description: 'Открытые дюны. Собери 11 звёзд в жарком небе, не забудь про пирамиды.',
  mode: 'stars',
  skyColor: 0xf0c890,
  groundColor: 0xd4a868,
  groundBump: 2.5,
  sunColor: 0xffe0a0,
  sunIntensity: 1.5,
  hemiIntensity: 0.75,
  ambIntensity: 0.35,
  spawn: { x: 0, y: 15, z: 90 },
  trees: [],
  buildings: [
    // "пирамиды"
    { x:  60, z:  50, w: 30, h: 25, d: 30, color: 0xc08040 },
    { x: -60, z:  50, w: 25, h: 20, d: 25, color: 0xb87838 },
    { x:   0, z: -70, w: 35, h: 30, d: 35, color: 0xc88048 },
    { x:  80, z: -30, w: 20, h: 18, d: 20, color: 0xb87040 },
  ],
  stars,
  rings: [],
};