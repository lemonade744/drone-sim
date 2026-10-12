import * as THREE from 'three';
import { clamp } from '../utils/math.js';

const GRAVITY = 9.81;
const HOVER_THRUST = GRAVITY;
const LINEAR_DRAG = 0.5;
const VERT_DRAG = 0.15;
const ANGULAR_DRAG = 3.2;
const PITCH_ACCEL = 4.0;
const ROLL_ACCEL = 3.5;
const YAW_SPEED = 1.8;
const MAX_PITCH = Math.PI * 75 / 180;
const MAX_ROLL = Math.PI * 70 / 180;
const LAND_VSPEED_MAX = 4.0;
const LAND_TILT_MAX = Math.PI * 30 / 180;
const CRASH_VSPEED = 7.0;
const DRONE_RADIUS = 1.0;

export class Flight {
  constructor(drone, colliders, map) {
    this.drone = drone;
    this.colliders = colliders;
    this.map = map;

    this.state = {
      vel: new THREE.Vector3(),
      yaw: 0,
      pitch: 0,
      roll: 0,
      angVel: { pitch: 0, roll: 0 },
      lastThrottle: HOVER_THRUST,
    };

    this.status = 'flying';
    this.standTop = 1.2;

    const sp = this.findSafeSpawn();
    this.spawnPoint = sp;
    this._placeAtSpawn();
  }

  findSafeSpawn() {
    const preferred = this.map.spawn ?? { x: 0, y: 12, z: 0 };
    if (this._isFree(preferred.x, preferred.y, preferred.z)) return { ...preferred };

    const cx = preferred.x, cz = preferred.z;
    const cy = Math.max(preferred.y, 15);
    for (let ring = 1; ring <= 20; ring++) {
      const r = ring * 8;
      const steps = Math.max(8, ring * 6);
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const x = cx + Math.cos(a) * r;
        const z = cz + Math.sin(a) * r;
        if (this._isFree(x, cy, z)) return { x, y: cy, z };
      }
    }
    let maxTop = 0;
    for (const c of this.colliders) if (c.top > maxTop) maxTop = c.top;
    return { x: 0, y: maxTop + 20, z: 0 };
  }

  _isFree(x, y, z) {
    if (y < 3) return false;
    const droneBottom = y - this.drone.bottomOffset;
    for (const c of this.colliders) {
      const dx = x - c.x, dz = z - c.z;
      const rr = c.r + DRONE_RADIUS + 0.5;
      if (dx*dx + dz*dz >= rr*rr) continue;
      if (droneBottom >= c.top + 0.5) continue;
      return false;
    }
    return true;
  }

  _placeAtSpawn() {
    const sp = this.spawnPoint;
    this.drone.group.position.set(sp.x, sp.y, sp.z);
    this.state.vel.set(0, 0, 0);
    this.state.yaw = this.state.pitch = this.state.roll = 0;
    this.state.angVel.pitch = 0;
    this.state.angVel.roll = 0;
    this.drone.group.rotation.set(0, 0, 0, 'YXZ');
  }

  respawn() {
    this.status = 'flying';
    this.standTop = 1.2;
    this._placeAtSpawn();
  }

  hitsObstacle(px, py, pz) {
    const bottomY = py - this.drone.bottomOffset;
    for (const c of this.colliders) {
      if (bottomY >= c.top - 0.05) continue;
      const dx = px - c.x;
      const dz = pz - c.z;
      const rr = c.r + DRONE_RADIUS;
      if (dx*dx + dz*dz < rr*rr) return true;
    }
    return false;
  }

  surfaceTopUnder(px, pz) {
    let best = 0;
    for (const c of this.colliders) {
      const dx = px - c.x, dz = pz - c.z;
      const rr = c.r + DRONE_RADIUS * 0.6;
      if (dx*dx + dz*dz < rr*rr && c.top > best) best = c.top;
    }
    return best;
  }

  update(dt, ctrl) {
    const { drone, state } = this;

    if (this.status === 'crashed') {
      state.vel.x *= 0.95;
      state.vel.z *= 0.95;
      state.vel.y -= GRAVITY * dt;
      if (state.vel.y < -20) state.vel.y = -20;
      drone.group.position.y += state.vel.y * dt;
      if (drone.group.position.y < this.standTop) {
        drone.group.position.y = this.standTop;
        state.vel.set(0, 0, 0);
      }
      state.roll += (Math.PI / 2 - state.roll) * Math.min(1, 3 * dt);
      drone.group.rotation.set(state.pitch, state.yaw, state.roll, 'YXZ');
      drone.spinRotors(dt, 0);
      return;
    }

    if (this.status === 'landed') {
      if (ctrl.thrust > 0) {
        this.status = 'flying';
      } else {
        drone.group.position.y = this.standTop;
        state.vel.set(0, 0, 0);
        state.angVel.pitch = 0;
        state.angVel.roll = 0;
        drone.spinRotors(dt, 0.2);
        return;
      }
    }

    // угловая динамика
    state.angVel.pitch += ctrl.pitch * PITCH_ACCEL * dt;
    state.angVel.roll  += ctrl.roll  * ROLL_ACCEL  * dt;
    state.angVel.pitch *= Math.exp(-ANGULAR_DRAG * dt);
    state.angVel.roll  *= Math.exp(-ANGULAR_DRAG * dt);
    state.pitch += state.angVel.pitch * dt;
    state.roll  += state.angVel.roll  * dt;
    state.pitch = clamp(state.pitch, -MAX_PITCH, MAX_PITCH);
    state.roll  = clamp(state.roll,  -MAX_ROLL,  MAX_ROLL);
    state.yaw  += ctrl.yaw * YAW_SPEED * dt;

    // тяга
    let throttle = HOVER_THRUST * (1 + 0.9 * ctrl.thrust);
    throttle = Math.max(0, throttle);
    state.lastThrottle = throttle;

    const euler = new THREE.Euler(state.pitch, state.yaw, state.roll, 'YXZ');
    const thrustDir = new THREE.Vector3(0, 1, 0).applyEuler(euler);

    const acc = new THREE.Vector3();
    acc.addScaledVector(thrustDir, throttle);
    acc.y -= GRAVITY;
    acc.x -= state.vel.x * LINEAR_DRAG;
    acc.z -= state.vel.z * LINEAR_DRAG;
    acc.y -= state.vel.y * VERT_DRAG;
    state.vel.addScaledVector(acc, dt);

    const prevX = drone.group.position.x;
    const prevY = drone.group.position.y;
    const prevZ = drone.group.position.z;

    drone.group.position.addScaledVector(state.vel, dt);
    const px = drone.group.position.x;
    const py = drone.group.position.y;
    const pz = drone.group.position.z;

    if (this.hitsObstacle(px, py, pz)) {
      drone.group.position.set(prevX, prevY, prevZ);
      state.vel.multiplyScalar(0.2);
      this.crash();
      drone.group.rotation.set(state.pitch, state.yaw, state.roll, 'YXZ');
      drone.spinRotors(dt, 0);
      return;
    }

    const groundY = 1.2;
    const objTop = this.surfaceTopUnder(px, pz);

    if (objTop > 0.5 && py <= objTop + this.drone.bottomOffset) {
      drone.group.position.y = objTop + this.drone.bottomOffset;
      this.handleTouchdown(true, objTop + this.drone.bottomOffset);
    } else if (py <= groundY) {
      drone.group.position.y = groundY;
      this.handleTouchdown(false, groundY);
    }

    if (drone.group.position.y > 200) {
      drone.group.position.y = 200;
      if (state.vel.y > 0) state.vel.y = 0;
    }

    drone.group.rotation.set(state.pitch, state.yaw, state.roll, 'YXZ');
    drone.spinRotors(dt, throttle / (2 * GRAVITY));
  }

  handleTouchdown(onObject, standY) {
    const { state } = this;
    const vSpeed = Math.abs(state.vel.y);
    const tilt = Math.max(Math.abs(state.pitch), Math.abs(state.roll));
    const horizSpeed = Math.hypot(state.vel.x, state.vel.z);

    const doCrash =
      vSpeed > CRASH_VSPEED ||
      tilt > LAND_TILT_MAX * 1.6 ||
      horizSpeed > 6;

    if (doCrash) { this.crash(); return; }

    const softLand = vSpeed < LAND_VSPEED_MAX && tilt < LAND_TILT_MAX && horizSpeed < 3;
    if (softLand) {
      this.status = 'landed';
      this.standTop = standY;
      state.vel.set(0, 0, 0);
    } else {
      state.vel.y = Math.max(0, -state.vel.y * 0.3);
      state.vel.x *= 0.5;
      state.vel.z *= 0.5;
    }
  }

  crash() {
    if (this.status === 'crashed') return;
    this.status = 'crashed';
    this.standTop = 1.2;
  }
}