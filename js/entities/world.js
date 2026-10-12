import * as THREE from 'three';

export function buildWorld(map) {
  const objects = [];
  const colliders = [];

  // === Земля ===
  const groundGeo = new THREE.PlaneGeometry(2000, 2000, 60, 60);
  const gp = groundGeo.attributes.position;
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i), y = gp.getY(i);
    const h = Math.sin(x*0.02)*Math.cos(y*0.02)*2 + Math.sin(x*0.05+y*0.03)*0.8;
    gp.setZ(i, h * (map.groundBump ?? 1));
  }
  groundGeo.computeVertexNormals();

  const groundColor = map.groundColor ?? 0x3f7a3f;
  const ground = new THREE.Mesh(
    groundGeo,
    new THREE.MeshLambertMaterial({ color: groundColor })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  objects.push(ground);

  // Сетка на земле (для города — своя)
  const grid = new THREE.GridHelper(400, 40, 0x224422, 0x224422);
  grid.position.y = 0.05;
  grid.material.opacity = 0.25;
  grid.material.transparent = true;
  objects.push(grid);

  // === Деревья ===
  (map.trees ?? []).forEach(t => {
    const { group, collider } = makeTree(t);
    objects.push(group);
    colliders.push(collider);
  });

  // === Здания ===
  (map.buildings ?? []).forEach(b => {
    const { mesh, collider } = makeBuilding(b);
    objects.push(mesh);
    colliders.push(collider);
  });

  return { objects, colliders, ground };
}

function makeTree({ x, z, trunkR = 0.3, trunkH = 3, coneR = 2, coneH = 4 }) {
  const g = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkR, trunkR * 1.3, trunkH, 6),
    new THREE.MeshLambertMaterial({ color: 0x5a3a1a })
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  g.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(coneR, coneH, 8),
    new THREE.MeshLambertMaterial({ color: 0x2d6b2d })
  );
  leaves.position.y = trunkH + coneH / 2 - 0.5;
  leaves.castShadow = true;
  g.add(leaves);

  g.position.set(x, 0, z);

  return {
    group: g,
    collider: { x, z, r: coneR * 0.85, top: trunkH + coneH - 0.5 },
  };
}

function makeBuilding({ x, z, w, h, d, color = 0x888899 }) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color })
  );
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const r = Math.max(w, d) * 0.55;
  return { mesh, collider: { x, z, r, top: h } };
}

// Проверка: свободна ли точка (не внутри коллайдера)
export function isPointFree(x, y, z, colliders, radius = 3) {
  for (const c of colliders) {
    const dx = x - c.x, dz = z - c.z;
    const rr = c.r + radius;
    if (dx*dx + dz*dz >= rr*rr) continue;
    // Если мы выше верхушки — точка свободна
    if (y > c.top + radius) continue;
    return false;
  }
  return true;
}