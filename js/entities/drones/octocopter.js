import * as THREE from 'three';

export function createOctocopter() {
  const group = new THREE.Group();

  const dark = new THREE.MeshStandardMaterial({ color: 0x14141c, metalness: 0.75, roughness: 0.3 });
  const mid  = new THREE.MeshStandardMaterial({ color: 0x24243a, metalness: 0.6, roughness: 0.5 });
  const accent = new THREE.MeshStandardMaterial({ color: 0xff5533, emissive: 0x881100, metalness: 0.5, roughness: 0.4 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xffcc44, emissive: 0x553300 });

  // Крупный корпус-платформа
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 1.6), dark);
  body.castShadow = true; group.add(body);

  // Верхняя "кабина"
  const cabin = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.3, 16), mid);
  cabin.position.y = 0.36; cabin.castShadow = true; group.add(cabin);

  // Двойное кольцо вокруг корпуса
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.05, 8, 32), accent);
  ring1.rotation.x = Math.PI / 2; ring1.position.y = 0.08; group.add(ring1);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.04, 8, 32), gold);
  ring2.rotation.x = Math.PI / 2; ring2.position.y = -0.15; group.add(ring2);

  // Нос
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 12), accent);
  nose.rotation.x = -Math.PI / 2; nose.position.set(0, 0, -1.05); group.add(nose);

  // Хвостовой маяк
  const tailLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xff5533, emissive: 0xff2200, emissiveIntensity: 2.0 })
  );
  tailLight.position.set(0, 0, 0.95); group.add(tailLight);

  // 8 лучей
  const rotors = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const ax = Math.cos(angle);
    const az = Math.sin(angle);
    const armLen = 1.9;

    // Луч
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, armLen), mid);
    arm.position.set(ax * armLen / 2, 0.05, az * armLen / 2);
    arm.rotation.y = Math.atan2(ax, az);
    arm.castShadow = true; group.add(arm);

    // Мотор
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.24, 12), dark);
    motor.position.set(ax * armLen, 0.16, az * armLen);
    motor.castShadow = true; group.add(motor);

    // Кольцо защиты винта
    const guard = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.025, 6, 20), accent);
    guard.rotation.x = Math.PI / 2;
    guard.position.set(ax * armLen, 0.22, az * armLen);
    group.add(guard);

    // Винт — 3 лопасти
    const rotor = new THREE.Group();
    const bladeMat = new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? 0x00ff88 : 0xffcc44,
      emissive: i % 2 === 0 ? 0x005522 : 0x554400,
      metalness: 0.3, roughness: 0.6,
    });
    for (let b = 0; b < 3; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.025, 0.08), bladeMat);
      blade.rotation.y = (b / 3) * Math.PI * 2;
      rotor.add(blade);
    }
    rotor.position.set(ax * armLen, 0.3, az * armLen);
    group.add(rotor);
    rotors.push(rotor);
  }

  // Жёсткое шасси — 4 стойки + 2 широких полоза
  const gearMat = new THREE.MeshStandardMaterial({ color: 0x404050, metalness: 0.55, roughness: 0.6 });
  const feetMat = new THREE.MeshStandardMaterial({ color: 0x0a0a10, roughness: 0.9 });
  const legPositions = [
    { x:  0.85, z:  0.85 }, { x: -0.85, z:  0.85 },
    { x:  0.85, z: -0.85 }, { x: -0.85, z: -0.85 },
  ];
  legPositions.forEach(l => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.7, 8), gearMat);
    leg.position.set(l.x, -0.55, l.z); leg.castShadow = true; group.add(leg);
  });
  [-0.85, 0.85].forEach(z => {
    const skid = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 0.16), gearMat);
    skid.position.set(0, -0.9, z); skid.castShadow = true; group.add(skid);
    [-0.85, 0.85].forEach(x => {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 0.22), feetMat);
      foot.position.set(x, -0.95, z); foot.castShadow = true; group.add(foot);
    });
  });
  // Поперечные перемычки
  [-0.5, 0.5].forEach(x => {
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 1.7), gearMat);
    cross.position.set(x, -0.9, 0); group.add(cross);
  });

  return {
    group,
    rotors,
    bottomOffset: 1.0,   // шасси выше, чем у квадрика
    spinRotors(dt, throttleNormalized) {
      const spd = 28 * dt * (0.6 + throttleNormalized * 0.9);
      rotors.forEach((r, i) => { r.rotation.y += (i % 2 === 0 ? spd : -spd) * 3; });
    },
  };
}