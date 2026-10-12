import * as THREE from 'three';

export function buildCollectibles(map) {
  const items = [];

  if (map.mode === 'stars' && map.stars) {
    map.stars.forEach((s, idx) => {
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

      // Ореол
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(2.0, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffdd33, transparent: true, opacity: 0.18 })
      );
      mesh.add(halo);

      items.push({
        kind: 'star',
        mesh,
        pos: new THREE.Vector3(s.x, s.y, s.z),
        radius: 2.5,
        collected: false,
        index: idx,
      });
    });
  }

  if (map.mode === 'rings' && map.rings) {
    map.rings.forEach((r, idx) => {
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

      // Внутренний "диск" для читаемости
      const disc = new THREE.Mesh(
        new THREE.RingGeometry((r.radius ?? 3.5) - 0.5, (r.radius ?? 3.5) - 0.1, 24),
        new THREE.MeshBasicMaterial({ color: 0x00e0ff, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
      );
      disc.rotation.copy(mesh.rotation);
      mesh.add(disc);

      items.push({
        kind: 'ring',
        mesh,
        pos: new THREE.Vector3(r.x, r.y, r.z),
        radius: (r.radius ?? 3.5) * 0.9, // для прохождения — по внутреннему радиусу
        collected: false,
        index: idx,
      });
    });
  }

  return {
    items,
    _prevInside: new Map(), // item -> bool
    isComplete() {
      return items.every(it => it.collected);
    },
    update(dt, dronePos, onCollect) {
      const t = performance.now() * 0.001;
      for (const it of items) {
        if (it.collected) continue;
        // Вращаем звезду, для кольца — лёгкое покачивание
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
            it.mesh.visible = false;
            onCollect(it);
          }
        } else {
          // Кольцо: "прошёл сквозь" = был близко И вышел за радиус
          const inside = d < it.radius;
          const was = this._prevInside.get(it) ?? false;
          if (was && !inside && d < it.radius * 1.5) {
            // вышел из зоны — считаем прохождение
            it.collected = true;
            onCollect(it);
          }
          this._prevInside.set(it, inside);
        }
      }
    },
  };
}