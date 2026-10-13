import * as THREE from 'three';
import { isPointFree } from './world.js';

export function buildCollectibles(map, colliders = []) {
  // Фиксированные звёзды/кольца из карты (включая звёзды в арках)
  let starsData = map.stars ?? [];
  let ringsData = map.rings ?? [];

  // Процедурная генерация (если задана) — ДОБАВЛЯЕТСЯ к фиксированным
  if (typeof map.randomStars === 'function') {
    const random = map.randomStars({ colliders, isPointFree });
    starsData = [...starsData, ...random];
  }
  if (typeof map.randomRings === 'function') {
    const random = map.randomRings({ colliders, isPointFree });
    ringsData = [...ringsData, ...random];
  }

  const items = [];

  // === Звёзды ===
  starsData.forEach((s, idx) => {
    const geo = new THREE.OctahedronGeometry(1.2, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffdd33,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8,
      metalness: 0.6,
      roughness: 0.3,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(s.x, s.y, s.z);
    mesh.castShadow = true;

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(2.0, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffdd33, transparent: true, opacity: 0.18 })
    );
    mesh.add(halo);

    items.push({
      kind: 'star',
      mesh,
      halo,
      mat,
      pos: new THREE.Vector3(s.x, s.y, s.z),
      radius: 2.5,
      collected: false,
      index: idx,
    });
  });

  // === Кольца ===
  ringsData.forEach((r, idx) => {
    const ringGeo = new THREE.TorusGeometry(r.radius ?? 3.5, 0.35, 10, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00e0ff,
      emissive: 0x0066aa,
      emissiveIntensity: 0.7,
      metalness: 0.5,
      roughness: 0.4,
    });
    const mesh = new THREE.Mesh(ringGeo, ringMat);
    mesh.position.set(r.x, r.y, r.z);
    if (r.rotation) mesh.rotation.set(...r.rotation);
    mesh.castShadow = true;

    const disc = new THREE.Mesh(
      new THREE.RingGeometry((r.radius ?? 3.5) - 0.5, (r.radius ?? 3.5) - 0.1, 24),
      new THREE.MeshBasicMaterial({ color: 0x00e0ff, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
    );
    disc.rotation.copy(mesh.rotation);
    mesh.add(disc);

    items.push({
      kind: 'ring',
      mesh,
      disc,
      mat: ringMat,
      pos: new THREE.Vector3(r.x, r.y, r.z),
      radius: (r.radius ?? 3.5) * 0.9,
      collected: false,
      index: starsData.length + idx,
    });
  });

  const REMOVE_COLLECTED = true;

  function markCollected(it) {
    if (REMOVE_COLLECTED) {
      it.mesh.visible = false;
    } else {
      it.mat.emissiveIntensity = 0.1;
      it.mat.color.setHex(0x444450);
      it.mat.emissive.setHex(0x000000);
      if (it.halo) it.halo.material.opacity = 0.04;
      if (it.disc) it.disc.material.opacity = 0.04;
    }
  }

  return {
    items,
    isComplete() {
      return items.every(it => it.collected);
    },
    update(dt, dronePos, onCollect) {
      const t = performance.now() * 0.001;
      if (!this._prevInside) this._prevInside = new Map();

      for (const it of items) {
        if (it.collected) continue;

        if (it.kind === 'star') {
          it.mesh.rotation.y += dt * 1.2;
          it.mesh.rotation.x = Math.sin(t) * 0.3;
        } else {
          it.mesh.rotation.z = Math.sin(t * 0.8 + it.index) * 0.15;
        }

        const d = dronePos.distanceTo(it.pos);

        if (it.kind === 'star') {
          if (d < it.radius) {
            it.collected = true;
            markCollected(it);
            onCollect(it);
          }
        } else {
          const inside = d < it.radius;
          const was = this._prevInside.get(it) ?? false;
          if (was && !inside && d < it.radius * 1.5) {
            it.collected = true;
            markCollected(it);
            onCollect(it);
          }
          this._prevInside.set(it, inside);
        }
      }
    },
    reset() {
      if (this._prevInside) this._prevInside.clear();
      for (const it of items) {
        it.collected = false;
        it.mesh.visible = true;
      }
    },
  };
}