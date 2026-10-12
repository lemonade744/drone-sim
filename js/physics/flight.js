import * as THREE from 'three';
import { updateMultirotor } from './multirotor.js';
import { updateAirplane } from './airplane.js';

const GRAVITY = 9.81;
const LAND_VSPEED_MAX = 4.0;
const LAND_TILT_MAX = Math.PI * 30 / 180;
const CRASH_VSPEED = 7.0;
const DRONE_RADIUS = 1.2;
const GROUND_Y = 1.2;

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
      angVel: { pitch: 0, roll: 0, yaw: 0 },
      lastThrottle: GRAVITY,
    };

    this.status = 'flying';
    this.standTop = GROUND_Y;

    this.catapultPos = new THREE.Vector3();
    this.catapultPitch = 0;
    this.catapultYaw = 0;
    this.launchGraceTimer = 0;

    const sp = this.findSafeSpawn();
    this.spawnPoint = sp;
    this._placeAtSpawn();

    if (this.drone.model.startOnGround) {
      this._placeOnCatapult();
    }
  }

  findSafeSpawn() {
    const startOnGround = this.drone.model.startOnGround;
    const preferred = this.map.spawn ?? { x: 0, y: 12, z: 0 };
    const preferredY = startOnGround ? this.drone.bottomOffset : preferred.y;

    if (this._isFree(preferred.x, preferredY, preferred.z)) {
      return { x: preferred.x, y: preferredY, z: preferred.z };
    }

    const cx = preferred.x, cz = preferred.z;
    const cy = startOnGround ? this.drone.bottomOffset : Math.max(preferred.y, 20);
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
    return {
      x: 0,
      y: startOnGround ? this.drone.bottomOffset : maxTop + 25,
      z: 0,
    };
  }

  _isFree(x, y, z) {
    if (this.drone.model.startOnGround) {
      for (const c of this.colliders) {
        const dx = x - c.x, dz = z - c.z;
        const rr = c.r + DRONE_RADIUS + 1.5;
        if (dx*dx + dz*dz >= rr*rr) continue;
        if (c.top > y - this.drone.bottomOffset + 0.5) return false;
      }
      return true;
    }

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
    const yaw = this.map.spawn?.yaw ?? 0;
    this.drone.group.position.set(sp.x, sp.y, sp.z);
    this.state.vel.set(0, 0, 0);
    this.state.yaw = yaw;
    this.state.pitch = 0;
    this.state.roll = 0;
    this.state.angVel.pitch = 0;
    this.state.angVel.roll = 0;
    this.state.angVel.yaw = 0;
    this.drone.group.rotation.set(0, yaw, 0, 'YXZ');
  }

  _placeOnCatapult() {
    const sp = this.spawnPoint;
    const yaw = this.map.spawn?.yaw ?? 0;
    // Угол катапульты: +20° — нос вверх (положительный pitch = нос вверх)
    const launchPitch = +20 * Math.PI / 180;

    this.catapultPitch = launchPitch;
    this.catapultYaw = yaw;

    // Дрон на верхней части катапульты
    this.catapultPos.set(sp.x, this.drone.bottomOffset + 0.8, sp.z);
    this.drone.group.position.copy(this.catapultPos);
    this.drone.group.rotation.set(this.catapultPitch, this.catapultYaw, 0, 'YXZ');

    this.state.pitch = this.catapultPitch;
    this.state.yaw = this.catapultYaw;
    this.state.roll = 0;
    this.state.vel.set(0, 0, 0);
    this.state.angVel.pitch = 0;
    this.state.angVel.roll = 0;
    this.state.angVel.yaw = 0;

    this.status = 'on_catapult';
    if (this.drone.catapult) this.drone.catapult.visible = true;
  }

  launchFromCatapult() {
    // Умеренная скорость — 14 м/с
    const launchSpeed = 14;
    const euler = new THREE.Euler(this.catapultPitch, this.catapultYaw, 0, 'YXZ');
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(euler);
    this.state.vel.copy(forward).multiplyScalar(launchSpeed);

    this.status = 'flying';
    this.launchGraceTimer = 1.0;
    if (this.drone.catapult) this.drone.catapult.visible = false;
  }

  respawn() {
    this.status = 'flying';
    this.standTop = GROUND_Y;
    this.launchGraceTimer = 0;
    this._placeAtSpawn();
    if (this.drone.model.startOnGround) {
      this._placeOnCatapult();
    }
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

    if (this.launchGraceTimer > 0) this.launchGraceTimer -= dt;

    // Упавший
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

    // На катапульте
    if (this.status === 'on_catapult') {
      drone.group.position.copy(this.catapultPos);
      drone.group.rotation.set(this.catapultPitch, this.catapultYaw, 0, 'YXZ');
      state.vel.set(0, 0, 0);
      state.pitch = this.catapultPitch;
      state.yaw = this.catapultYaw;
      state.roll = 0;
      state.angVel.pitch = 0;
      state.angVel.roll = 0;
      state.angVel.yaw = 0;

      if (ctrl.thrust > 0) {
        this.launchFromCatapult();
      } else {
        drone.spinRotors(dt, 0);
        return;
      }
    }

    // Сел
    if (this.status === 'landed') {
      if (ctrl.thrust > 0) {
        this.status = 'flying';
      } else {
        drone.group.position.y = this.standTop;
        state.vel.set(0, 0, 0);
        state.angVel.pitch = 0;
        state.angVel.roll = 0;
        state.angVel.yaw = 0;
        drone.spinRotors(dt, 0);
        return;
      }
    }

    // Физика
    if (drone.model.flightModel === 'airplane') {
      updateAirplane(dt, ctrl, drone, state, this.status);
    } else {
      updateMultirotor(dt, ctrl, drone, state, this.status);
    }

    const prevX = drone.group.position.x;
    const prevY = drone.group.position.y;
    const prevZ = drone.group.position.z;

    drone.group.position.addScaledVector(state.vel, dt);
    const px = drone.group.position.x;
    const py = drone.group.position.y;
    const pz = drone.group.position.z;

    // Коллизия с объектами
    if (this.hitsObstacle(px, py, pz)) {
      drone.group.position.set(prevX, prevY, prevZ);
      state.vel.multiplyScalar(0.2);
      this.crash();
      drone.group.rotation.set(state.pitch, state.yaw, state.roll, 'YXZ');
      drone.spinRotors(dt, 0);
      return;
    }

    // Касание земли / поверхности (только если grace-таймер кончился)
    if (this.launchGraceTimer <= 0) {
      const objTop = this.surfaceTopUnder(px, pz);
      const bottomY = py - this.drone.bottomOffset;

      if (objTop > 0.5 && bottomY <= objTop + 0.4) {
        drone.group.position.y = objTop + this.drone.bottomOffset;
        this.handleTouchdown(true, objTop + this.drone.bottomOffset);
      } else if (bottomY <= 0) {
        drone.group.position.y = this.drone.bottomOffset;
        this.handleTouchdown(false, this.drone.bottomOffset);
      }
    } else {
      if (drone.group.position.y < this.drone.bottomOffset) {
        drone.group.position.y = this.drone.bottomOffset;
        if (state.vel.y < 0) state.vel.y = 0;
      }
    }

    // Потолок карты
    if (drone.group.position.y > 300) {
      drone.group.position.y = 300;
      if (state.vel.y > 0) state.vel.y = 0;
    }

    drone.group.rotation.set(state.pitch, state.yaw, state.roll, 'YXZ');
  }

  handleTouchdown(onObject, standY) {
    const { state, drone } = this;
    const vSpeed = Math.abs(state.vel.y);
    const tilt = Math.max(Math.abs(state.pitch), Math.abs(state.roll));
    const horizSpeed = Math.hypot(state.vel.x, state.vel.z);

    const isPlane = drone.model.flightModel === 'airplane';
    const maxTilt    = isPlane ? Math.PI * 20 / 180 : LAND_TILT_MAX;
    const maxVSpeed  = isPlane ? 5 : LAND_VSPEED_MAX;
    const maxHSpeed  = isPlane ? 25 : 3;
    const crashVSpeed = isPlane ? 10 : CRASH_VSPEED;
    const crashHSpeed = isPlane ? 45 : 6;

    const doCrash =
      vSpeed > crashVSpeed ||
      tilt > maxTilt * 1.6 ||
      horizSpeed > crashHSpeed;

    if (doCrash) { this.crash(); return; }

    const softLand =
      vSpeed < maxVSpeed &&
      tilt < maxTilt &&
      horizSpeed < maxHSpeed;

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
    this.standTop = GROUND_Y;
  }
}