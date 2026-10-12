import { createQuadcopter } from './quadcopter.js';
import { createOctocopter } from './octocopter.js';
// import { createGlider } from './glider.js';   // планер скрыт из выбора

export const droneModels = {
  quadcopter: {
    key: 'quadcopter',
    name: 'Квадрокоптер',
    description: 'Классический 4-винтовой дрон. Манёвренный, стабильный.',
    flightModel: 'multirotor',
    startOnGround: false,
    create: createQuadcopter,
  },
  octocopter: {
    key: 'octocopter',
    name: 'Октокоптер',
    description: 'Тяжёлый 8-винтовой. Мощная тяга, но инерция выше.',
    flightModel: 'multirotor',
    startOnGround: false,
    create: createOctocopter,
  },
  // glider временно убран из выбора
};

export function createDrone(modelKey = 'quadcopter') {
  const model = droneModels[modelKey] || droneModels.quadcopter;
  const drone = model.create();
  drone.model = model;
  return drone;
}