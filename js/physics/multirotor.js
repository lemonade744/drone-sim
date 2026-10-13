import * as THREE from 'three';
import { clamp } from '../utils/math.js';

const GRAVITY = 9.81;
const LINEAR_DRAG = 0.5;
const VERT_DRAG = 0.15;
const ANGULAR_DRAG = 3.2;
const YAW_SPEED = 1.8;

const PARAMS = {
  quadcopter: {
    hoverThrust: GRAVITY,
    maxThrustUp: GRAVITY * 2.0,
    maxThrustDown: GRAVITY * 1.6,
    pitchAccel: 4.0,
    rollAccel: 3.5,
  },
  octocopter: {
    hoverThrust: GRAVITY,
    maxThrustUp: GRAVITY * 2.2,
    maxThrustDown: GRAVITY * 1.6,
    pitchAccel: 3.0,
    rollAccel: 2.8,
  },
};

const DIVE_SPEED_BONUS = 1.35;
const DIVE_PITCH_THRESHOLD = Math.PI * 30 / 180;

export function updateMultirotor(dt, ctrl, drone, state, status) {
  const params = PARAMS[drone.model.key] || PARAMS.quadcopter;

  // Угловая динамика
  state.angVel.pitch += ctrl.pitch * params.pitchAccel * dt;
  state.angVel.roll  += ctrl.roll  * params.rollAccel  * dt;
  state.angVel.pitch *= Math.exp(-ANGULAR_DRAG * dt);
  state.angVel.roll  *= Math.exp(-ANGULAR_DRAG * dt);

  state.pitch += state.angVel.pitch * dt;
  state.roll  += state.angVel.roll  * dt;

  state.yaw += ctrl.yaw * YAW_SPEED * dt;

  // === Газ симметричный ===
  // W → тяга вверх по нормали, до maxThrustUp
  // S → тяга "в обратную сторону" от нормали, до maxThrustDown
  // Нейтраль = hoverThrust (держится только если нормаль вверх)
  let throttle;
  if (ctrl.thrust > 0) {
    // W: от hover до max вверх
    throttle = params.hoverThrust + ctrl.thrust * (params.maxThrustUp - params.hoverThrust);
  } else if (ctrl.thrust < 0) {
    // S: от hover (0) до -maxThrustDown
    // При нулевой тяге дрон не висит, а падает. При перевёрнутом корпусе
    // отрицательная тяга тянет вверх — дрон взлетает.
    throttle = params.hoverThrust + ctrl.thrust * params.maxThrustDown;
    // ctrl.thrust = -1 → throttle = hover - maxDown = G - G = 0
    // ctrl.thrust = -0.5 → throttle = G - 0.5G = 0.5G
  } else {
    // Нейтральное положение — висит
    throttle = params.hoverThrust;
  }
  throttle = Math.max(0, throttle);
  state.lastThrottle = throttle;

  // Вектор тяги — по нормали корпуса (или против неё, если throttle < hover)
  const euler = new THREE.Euler(state.pitch, state.yaw, state.roll, 'YXZ');
  const thrustDir = new THREE.Vector3(0, 1, 0).applyEuler(euler);

  const acc = new THREE.Vector3();
  // Тяга = throttle по нормали корпуса. Всё остальное (гравитация) - отдельно.
  // При нейтрали throttle = hover = G, тяга = G по нормали, гравитация -G вниз.
  // Нормально горизонт: 0. Перевёрнут: тяга вниз, гравитация вниз → падение.
  // При перевёрнутом корпусе и throttle=0 → тяга 0, гравитация -G → падение.
  // Чтобы взлетать вверх ногами, нужно S: throttle < hover, тяга идёт "против"
  // нормали → вверх в мировой системе. Но в нашей формуле throttle просто скаляр,
  // он не может быть отрицательным, чтобы реально тянуть вниз нормали.
  //
  // Решение: интерпретируем "S" как вычитание из нейтральной тяги.
  // Пусть thrustScalar = throttle - hoverThrust (может быть отрицательным).
  // Это и есть "дополнительная тяга" относительно висящего положения.
  const thrustScalar = throttle - params.hoverThrust;

  // Тяга = (hover + thrustScalar) по нормали. Гравитация отдельно:
  acc.addScaledVector(thrustDir, params.hoverThrust);
  acc.addScaledVector(thrustDir, thrustScalar);

  // Гравитация вниз
  acc.y -= GRAVITY;

  // === Бонус скорости при пикировании ===
  let speedBonus = 1.0;
  const absPitch = Math.abs(state.pitch);
  if (absPitch > DIVE_PITCH_THRESHOLD) {
    const t = clamp((absPitch - DIVE_PITCH_THRESHOLD) / (Math.PI / 2 - DIVE_PITCH_THRESHOLD), 0, 1);
    speedBonus = 1.0 + (DIVE_SPEED_BONUS - 1.0) * t;
  }
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