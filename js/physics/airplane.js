import * as THREE from 'three';
import { clamp } from '../utils/math.js';

const GRAVITY = 9.81;
const MAX_PITCH = Math.PI * 60 / 180;
const MAX_ROLL  = Math.PI * 85 / 180;
const MAX_VSPEED = 16;

// === Параметры планера ===
const MASS = 1.0;
const THRUST_MAX     = 20;
const THRUST_CRUISE  = 11;
const THRUST_IDLE    = 3;

const CRUISE_SPEED   = 14;
const STALL_SPEED    = 7;
const LIFT_K         = GRAVITY / (CRUISE_SPEED * CRUISE_SPEED);

const AOA_OPTIMAL    = 8 * Math.PI / 180;
const AOA_STALL      = 18 * Math.PI / 180;

const DRAG_K         = 0.003;
const ANGULAR_DRAG   = 2.4;              // было 3.0 — мягче
const CONTROL_PITCH  = 1.6;              // было 2.4 — плавнее
const CONTROL_ROLL   = 2.2;              // было 3.2
const CONTROL_YAW    = 1.2;
const ROLL_STABILITY = 2.0;

// === Плавность ===
const AOA_SMOOTHING  = 3.5;              // скорость сглаживания AoA (чем меньше — плавнее)
const VEL_SMOOTHING  = 6.0;              // сглаживание интегрирования скорости

export function updateAirplane(dt, ctrl, drone, state, status) {
  const speed = state.vel.length();

  // === Управление рулями ===
  const authFactor = clamp(speed / 12, 0.3, 1.0);

  state.angVel.pitch += ctrl.pitch * CONTROL_PITCH * authFactor * dt;
  state.angVel.roll  += -ctrl.roll * CONTROL_ROLL * authFactor * dt;
  state.angVel.yaw   += ctrl.yaw * CONTROL_YAW * authFactor * dt;

  // Автовозврат крена
  if (Math.abs(ctrl.roll) < 0.1 && speed > 3) {
    state.angVel.roll += -state.roll * ROLL_STABILITY * dt;
  }

  state.angVel.pitch *= Math.exp(-ANGULAR_DRAG * dt);
  state.angVel.roll  *= Math.exp(-ANGULAR_DRAG * dt);
  state.angVel.yaw   *= Math.exp(-ANGULAR_DRAG * dt);

  state.pitch += state.angVel.pitch * dt;
  state.roll  += state.angVel.roll  * dt;
  state.yaw   += state.angVel.yaw   * dt;

  state.pitch = clamp(state.pitch, -MAX_PITCH, MAX_PITCH);
  state.roll  = clamp(state.roll,  -MAX_ROLL,  MAX_ROLL);

  // === Тяга ===
  let throttle;
  if (ctrl.thrust > 0)       throttle = THRUST_CRUISE + (THRUST_MAX - THRUST_CRUISE) * ctrl.thrust;
  else if (ctrl.thrust < 0)  throttle = THRUST_IDLE;
  else                        throttle = THRUST_CRUISE;
  state.lastThrottle = throttle;

  // === AoA ===
  const euler = new THREE.Euler(state.pitch, state.yaw, state.roll, 'YXZ');
  const invEuler = new THREE.Euler(-state.pitch, -state.yaw, -state.roll, 'YXZ');

  const velLocal = state.vel.clone().applyEuler(invEuler);

  const vForward = -velLocal.z;
  const vUp      = velLocal.y;

  let aoaRaw = 0;
  if (Math.abs(vForward) > 0.3) {
    aoaRaw = Math.atan2(vUp, Math.abs(vForward));
  }

  // === Сглаживание AoA ===
  // Инициализируем при первом вызове
  if (state.aoaSmooth === undefined) state.aoaSmooth = aoaRaw;

  const aoaAlpha = 1 - Math.exp(-AOA_SMOOTHING * dt);
  state.aoaSmooth += (aoaRaw - state.aoaSmooth) * aoaAlpha;
  const aoa = state.aoaSmooth;

  const horizSpeed = Math.abs(vForward);

  // === Силы в локальной системе корпуса ===
  const accLocal = new THREE.Vector3();

  // Тяга
  accLocal.z -= throttle;

  // Подъёмная сила
  let liftCoeff = 0;
  if (horizSpeed > STALL_SPEED) {
    if (Math.abs(aoa) < AOA_OPTIMAL) {
      liftCoeff = aoa / AOA_OPTIMAL;
    } else if (Math.abs(aoa) < AOA_STALL) {
      liftCoeff = Math.sign(aoa) * (1 + (Math.abs(aoa) - AOA_OPTIMAL) / (AOA_STALL - AOA_OPTIMAL) * 0.3);
    } else {
      liftCoeff = Math.sign(aoa) * 0.4;
    }
  }

  const dynamicPressure = horizSpeed * horizSpeed;
  const lift = LIFT_K * dynamicPressure * liftCoeff;
  accLocal.y += lift;

  // Сопротивление
  const vLocalMag = velLocal.length();
  if (vLocalMag > 0.1) {
    const dragMag = DRAG_K * vLocalMag * vLocalMag;
    const dragDirLocal = velLocal.clone().normalize().multiplyScalar(-1);
    accLocal.addScaledVector(dragDirLocal, dragMag);
  }

  // Гравитация в локальной системе
  const gravityLocal = new THREE.Vector3(0, -GRAVITY, 0).applyEuler(invEuler);
  accLocal.add(gravityLocal);

  // В мир
  const acc = accLocal.applyEuler(euler);

  // === Интегрирование скорости со сглаживанием ===
  // Вместо vel += acc*dt делаем плавный шаг (компромисс между точностью и мягкостью)
  const velAlpha = 1 - Math.exp(-VEL_SMOOTHING * dt);
  const dv = acc.clone().multiplyScalar(dt);
  state.vel.addScaledVector(dv, velAlpha / (VEL_SMOOTHING * dt) * 1.0);

  // Мягкое ограничение вертикальной скорости через tanh — без рывка
  const vyLimited = MAX_VSPEED * Math.tanh(state.vel.y / MAX_VSPEED);
  state.vel.y = vyLimited;

  // Сваливание — клюёт носом
  if (horizSpeed < STALL_SPEED && speed > 1) {
    state.pitch -= 0.5 * dt;
  }

  drone.spinRotors(dt, throttle / THRUST_MAX);
}