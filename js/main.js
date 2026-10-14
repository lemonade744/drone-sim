import * as THREE from 'three';
import { createScene } from './core/scene.js';
import { Input } from './core/input.js';
import { HUD } from './core/hud.js';
import { createDrone, droneModels } from './entities/drones/index.js';
import { buildWorld } from './entities/world.js';
import { buildCollectibles } from './entities/collectibles.js';
import { Flight } from './physics/flight.js';
import { maps } from './maps/index.js';

// === Диагностика ===
const errBox = document.createElement('pre');
errBox.style.cssText = `
  position: fixed; top: 0; left: 0; right: 0; max-height: 60%; overflow: auto;
  background: rgba(120,0,0,0.95); color: #fff; font: 12px/1.4 monospace;
  padding: 12px 16px; margin: 0; z-index: 9999; white-space: pre-wrap;
  display: none;
`;
document.body.appendChild(errBox);
function bootError(e) {
  errBox.style.display = 'block';
  errBox.textContent += ((e && (e.stack || e.message)) || String(e)) + '\n\n';
  console.error(e);
}
window.addEventListener('error', e => bootError(e.error || e.message));
window.addEventListener('unhandledrejection', e => bootError(e.reason));

const ctx = {
  scene: null, renderer: null, camera: null,
  drone: null, world: null, collectibles: null,
  flight: null, input: null, hud: null,
  currentMap: null,
  currentModel: 'quadcopter',
  elapsed: 0, started: false, finished: false,
  camPos: null, camTarget: null,
  debugGroup: null,
};

function clearScene() {
  if (!ctx.scene) return;
  while (ctx.scene.children.length > 0) {
    const obj = ctx.scene.children.pop();
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
  }
}

function createLights(map) {
  const sun = new THREE.DirectionalLight(map.sunColor ?? 0xffffff, map.sunIntensity ?? 1.2);
  sun.position.set(80, 150, 60);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -120;
  sun.shadow.camera.right = 120;
  sun.shadow.camera.top = 120;
  sun.shadow.camera.bottom = -120;
  sun.shadow.camera.far = 400;
  const hemi = new THREE.HemisphereLight(map.skyColor ?? 0x88bbff, 0x445522, map.hemiIntensity ?? 0.7);
  const amb = new THREE.AmbientLight(0xffffff, map.ambIntensity ?? 0.25);
  return { sun, hemi, amb };
}

function buildDebugGroup(colliders) {
  const group = new THREE.Group();
  group.visible = false;
  group.name = 'debugGroup';

  const matCyl = new THREE.MeshBasicMaterial({
    color: 0xff00ff, wireframe: true, transparent: true, opacity: 0.6,
  });
  const matBox = new THREE.MeshBasicMaterial({
    color: 0x00ff00, wireframe: true, transparent: true, opacity: 0.6,
  });

  for (const c of colliders) {
    if (c.type === 'box') {
      const h = c.top - (c.bottom ?? 0);
      const geo = new THREE.BoxGeometry(c.hw * 2, h, c.hd * 2);
      const m = new THREE.Mesh(geo, matBox);
      m.position.set(c.x, (c.bottom ?? 0) + h / 2, c.z);
      m.rotation.y = c.rot ?? 0;
      group.add(m);
    } else {
      const h = c.bottom !== undefined ? c.top - c.bottom : c.top;
      const geo = new THREE.CylinderGeometry(c.r, c.r, h, 12, 1, true);
      const m = new THREE.Mesh(geo, matCyl);
      const cy = c.bottom !== undefined ? c.bottom + h / 2 : c.top / 2;
      m.position.set(c.x, cy, c.z);
      group.add(m);
    }
  }
  return group;
}

async function loadMap(mapKey) {
  const map = maps[mapKey];
  if (!map) return;

  ctx.finished = false;
  ctx.started = false;
  ctx.elapsed = 0;
  ctx.currentMap = map;

  if (!ctx.scene) {
    const core = createScene();
    ctx.scene = core.scene;
    ctx.renderer = core.renderer;
    ctx.camera = core.camera;
  }
  clearScene();

  ctx.scene.background = new THREE.Color(map.skyColor ?? 0x87ceeb);
  ctx.scene.fog = new THREE.Fog(map.skyColor ?? 0x87ceeb, 150, 500);

  const { sun, hemi, amb } = createLights(map);
  ctx.scene.add(sun, hemi, amb);

  const world = await buildWorld(map);
  world.objects.forEach(o => ctx.scene.add(o));
  ctx.world = world;


  // Debug-группа
  const debugGroup = buildDebugGroup(world.colliders);
  ctx.scene.add(debugGroup);
  ctx.debugGroup = debugGroup;

  const drone = createDrone(ctx.currentModel);
  ctx.scene.add(drone.group);
  ctx.drone = drone;

  ctx.flight = new Flight(drone, world.colliders, map);

  const collectibles = buildCollectibles(map, world.colliders);
  collectibles.items.forEach(it => ctx.scene.add(it.mesh));
  ctx.collectibles = collectibles;

  ctx.hud.setMap(map.name, map.mode, collectibles.items.length, drone.model.name);
  ctx.hud.hideMenu();

  const sp = ctx.flight.spawnPoint;
  const yaw = map.spawn?.yaw ?? 0;
  const camOffset = new THREE.Vector3(0, 5, 12).applyAxisAngle(new THREE.Vector3(0,1,0), yaw);
  ctx.camera.position.set(sp.x + camOffset.x, sp.y + camOffset.y, sp.z + camOffset.z);
  ctx.camPos = null;
  ctx.camTarget = null;
}

function updateCamera(dt) {
  const dronePos = ctx.drone.group.position;
  const mode = ctx.hud.cameraMode;
  const st = ctx.flight.state;
  const cam = ctx.camera;

  if (!ctx.camPos) {
    ctx.camPos = new THREE.Vector3(dronePos.x, dronePos.y + 5, dronePos.z + 12);
    ctx.camTarget = new THREE.Vector3().copy(dronePos);
  }

  if (mode === 0) {
    const offset = new THREE.Vector3(0, 4.5, 11).applyAxisAngle(new THREE.Vector3(0,1,0), st.yaw);
    const desired = dronePos.clone().add(offset);
    ctx.camPos.lerp(desired, Math.min(1, 18*dt));
    cam.position.copy(ctx.camPos);
    ctx.camTarget.lerp(dronePos, Math.min(1, 20*dt));
    cam.lookAt(ctx.camTarget);
    if (ctx.camPos.distanceTo(desired) > 30) {
      ctx.camPos.copy(desired);
      cam.position.copy(ctx.camPos);
    }
  } else if (mode === 1) {
    const e = new THREE.Euler(st.pitch, st.yaw, st.roll, 'YXZ');
    const fp = new THREE.Vector3(0, 0.4, -0.6).applyEuler(e);
    cam.position.copy(dronePos.clone().add(fp));
    const lk = new THREE.Vector3(0, 0, -30).applyEuler(e);
    cam.lookAt(dronePos.clone().add(lk));
    cam.up.set(0, 1, 0).applyEuler(e);
  } else {
    cam.up.set(0, 1, 0);
    cam.position.set(dronePos.x, dronePos.y + 60, dronePos.z + 0.1);
    cam.lookAt(dronePos);
  }
}

function update(dt) {
  if (!ctx.drone) return;
  const ctrl = ctx.input.readControls();
  const camKeys = ctx.input.readCameraKeys();

  if (camKeys.cycleCamera) ctx.hud.cycleCamera();
  if (camKeys.respawn) ctx.flight.respawn();
  if (camKeys.menu) ctx.hud.toggleMenu();
  if (camKeys.debug && ctx.debugGroup) {
    ctx.debugGroup.visible = !ctx.debugGroup.visible;
  }

  ctx.flight.update(dt, ctrl);

  ctx.collectibles.update(dt, ctx.drone.group.position, () => ctx.hud.incrementScore());

  const newScore = ctx.collectibles.items.filter(it => it.collected).length;
  if (!ctx.started && newScore > 0) { ctx.started = true; ctx.elapsed = 0; }

  const allCollected = newScore === ctx.collectibles.items.length && newScore > 0;
  if (!ctx.finished && allCollected && ctx.flight.status !== 'crashed') {
    ctx.finished = true;
    ctx.hud.showFinal(ctx.elapsed);
  }

  if (ctx.started && !ctx.finished) ctx.elapsed += dt;
  ctx.hud.updateTimer(ctx.started ? ctx.elapsed : null);

  updateCamera(dt);
  ctx.hud.sync(ctx.flight, ctx.drone, ctx.camera);
}

let lastT = performance.now();
let rafId = null;

function tick() {
  try {
    const now = performance.now();
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    update(dt);
    ctx.renderer.render(ctx.scene, ctx.camera);
  } catch (e) { bootError(e); return; }
  rafId = requestAnimationFrame(tick);
}

try {
  ctx.input = new Input();
  ctx.hud = new HUD();
  ctx.hud.onMapSelected(async (mapKey, modelKey) => {
    try {
      if (modelKey) ctx.currentModel = modelKey;
      await loadMap(mapKey);
      if (rafId === null) {
        lastT = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    } catch (e) { bootError(e); }
  });
  ctx.hud.onModelSelected(modelKey => {
    ctx.currentModel = modelKey;
    if (ctx.currentMap) {
      const key = ctx.currentMap.key ?? Object.keys(maps).find(k => maps[k] === ctx.currentMap);
      loadMap(key);
    }
  });
  ctx.hud.showMenu(Object.values(maps), Object.values(droneModels));
} catch (e) { bootError(e); }