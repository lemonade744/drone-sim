import * as THREE from 'three';
import { clamp } from '../utils/math.js';

const GRAVITY = 9.81;
const LINEAR_DRAG = 0.5;
const VERT_DRAG = 0.15;
const ANGULAR_DRAG = 3.2;
const YAW_SPEED = 1.8;

// Тангаж и крен больше не ограничены — можно перевернуться
// MAX_PITCH и MAX_ROLL не используются

// Параметры по типу
const PARAMS = {
  quadcopter: {
    hoverThrust: GRAVITY,
    maxThrust: GRAVITY * 2.0,
    pitchAccel: 4.0,
    rollAccel: 3.5,
  },
  octocopter: {
    hoverThrust: GRAVITY,
    maxThrust: GRAVITY * 2.2,
    pitchAccel: 3.0,
    rollAccel: 2.8,
  },
};

// Множитель скорости при пикировании — небольшой бонус к горизонтальной скорости
const DIVE_SPEED_BONUS = 1.35;
// Порог pitch, при котором включается бонус (в радианах, ~30°)
const DIVE_PITCH_THRESHOLD = Math.PI * 30 / 180;

export function updateMultirotor(dt, ctrl, drone, state, status) {
  const params = PARAMS[drone.model.key] || PARAMS.quadcopter;

  // Угловая динамика — без ограничений по углам
  state.angVel.pitch += ctrl.pitch * params.pitchAccel * dt;
  state.angVel.roll  += ctrl.roll  * params.rollAccel  * dt;
  state.angVel.pitch *= Math.exp(-ANGULAR_DRAG * dt);
  state.angVel.roll  *= Math.exp(-ANGULAR_DRAG * dt);

  state.pitch += state.angVel.pitch * dt;
  state.roll  += state.angVel.roll  * dt;
  // Убираем clamp на pitch и roll — можно свободно вращаться

  state.yaw += ctrl.yaw * YAW_SPEED * dt;

  // Тяга
  let throttle;
  if (ctrl.thrust > 0) throttle = params.hoverThrust + ctrl.thrust * (params.maxThrust - params.hoverThrust);
  else if (ctrl.thrust < 0) throttle = params.hoverThrust * (1 + 0.9 * ctrl.thrust);
  else throttle = params.hoverThrust;
  throttle = Math.max(0, throttle);
  state.lastThrottle = throttle;

  // Вектор тяги — по нормали корпуса
  const euler = new THREE.Euler(state.pitch, state.yaw, state.roll, 'YXZ');
  const thrustDir = new THREE.Vector3(0, 1, 0).applyEuler(euler);

  const acc = new THREE.Vector3();
  acc.addScaledVector(thrustDir, throttle);
  acc.y -= GRAVITY;

  // === Бонус горизонтальной скорости при пикировании ===
  // Когда нос задран вперёд (pitch > 0 = нос вниз в нашей системе после всех
  // преобразований, но ты пробовал управление — вот честный расчёт):
  // pitch < 0 = нос вниз (пикирование). Усиливаем разгон вперёд.
  let speedBonus = 1.0;
  const absPitch = Math.abs(state.pitch);
  if (absPitch > DIVE_PITCH_THRESHOLD) {
    // Бонус растёт от 1.0 до DIVE_SPEED_BONUS по мере увеличения pitch
    const t = clamp((absPitch - DIVE_PITCH_THRESHOLD) / (Math.PI / 2 - DIVE_PITCH_THRESHOLD), 0, 1);
    speedBonus = 1.0 + (DIVE_SPEED_BONUS - 1.0) * t;
  }

  // Применяем бонус к проекции ускорения на горизонталь
  const horizAcc = new THREE.Vector3(acc.x, 0, acc.z).multiplyScalar(speedBonus - 1);
  acc.x += horizAcc.x;
  acc.z += horizAcc.z;

  // Сопротивление
  acc.x -= state.vel.x * LINEAR_DRAG;
  acc.z -= state.vel.z * LINEAR_DRAG;
  acc.y -= state.vel.y * VERT_DRAG;

  state.vel.addScaledVector(acc, dt);

  drone.spinRotors(dt, throttle / (2 * GRAVITY));
}