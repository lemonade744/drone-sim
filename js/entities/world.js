import * as THREE from 'three';
import { loadModel, cloneModel, getModelCollider } from './assetLoader.js';

export async function buildWorld(map) {
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

  if (!map.hideGrid) {
    const grid = new THREE.GridHelper(400, 40, 0x224422, 0x224422);
    grid.position.y = 0.05;
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    objects.push(grid);
  }

  // === Деревья ===
  (map.trees ?? []).forEach(t => {
    const g = makeTree(t);
    objects.push(g.group);
    colliders.push(g.collider);
  });

  // === Здания ===
  (map.buildings ?? []).forEach(b => {
    const bld = makeBuilding(b);
    objects.push(bld.mesh);
    colliders.push(bld.collider);
  });

  // === GLTF-модели ===
  if (map.models && map.models.length > 0) {
    for (const modelDef of map.models) {
      try {
        const source = await loadModel(modelDef.path);
        const inst = cloneModel(source);

        inst.position.set(
          modelDef.x ?? 0,
          modelDef.y ?? 0,
          modelDef.z ?? 0
        );
        inst.rotation.y = modelDef.rotationY ?? 0;
        const s = modelDef.scale ?? 1;
        inst.scale.set(s, s, s);

        objects.push(inst);

        if (modelDef.collider !== false) {
          if (modelDef.collider === 'auto' || modelDef.collider === undefined) {
            const col = getModelCollider(inst, modelDef.x ?? 0, modelDef.z ?? 0);
            if (col.r > 1 && col.top > 0.5) {
              colliders.push(col);
            }
          } else if (typeof modelDef.collider === 'object') {
            colliders.push({
              x: modelDef.collider.x ?? modelDef.x,
              z: modelDef.collider.z ?? modelDef.z,
              r: modelDef.collider.r ?? 3,
              top: modelDef.collider.top ?? 5,
            });
          }
        }
      } catch (e) {
        console.warn(`Модель не загружена: ${modelDef.path}`, e);
      }
    }
  }

  // === Прямые коллайдеры из карты ===
  if (map.extraColliders && map.extraColliders.length > 0) {
    for (const c of map.extraColliders) {
      colliders.push({ ...c, r: c.r ?? 1, top: c.top ?? 10 });
    }
  }

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

export function isPointFree(x, y, z, colliders, radius = 3) {
  for (const c of colliders) {
    if (c.bottom !== undefined) continue;
    const dx = x - c.x, dz = z - c.z;
    const rr = (c.r ?? Math.max(c.hw ?? 0, c.hd ?? 0)) + radius;
    if (dx*dx + dz*dz >= rr*rr) continue;
    if (y > c.top + radius) continue;
    return false;
  }
  return true;
}