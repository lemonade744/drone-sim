import * as THREE from 'three';

export function createDrone() {
  const group = new THREE.Group();

  const dark = new THREE.MeshStandardMaterial({ color: 0x1a1a24, metalness: 0.7, roughness: 0.35 });
  const mid  = new THREE.MeshStandardMaterial({ color: 0x2b2b3a, metalness: 0.6, roughness: 0.5 });
  const accent = new THREE.MeshStandardMaterial({ color: 0x00e0ff, emissive: 0x005577, metalness: 0.4, roughness: 0.5 });
  const red = new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0x880000 });

  // Корпус — центральный блок
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.1), dark);
  body.castShadow = true;
  group.add(body);

  // Верхняя "кабина" — низкий цилиндр
  const cabin = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.22, 14), mid);
  cabin.position.y = 0.26;
  cabin.castShadow = true;
  group.add(cabin);

  // Акцентная полоса вокруг корпуса
  const stripe = new THREE.Mesh(
    new THREE.TorusGeometry(0.58, 0.04, 6, 24),
    accent
  );
  stripe.rotation.x = Math.PI / 2;
  stripe.position.y = 0.06;
  group.add(stripe);

  // Красный нос — конус спереди
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.4, 10), red);
  nose.rotation.x = -Math.PI / 2;
  nose.position.set(0, 0, -0.75);
  group.add(nose);

  // Хвостовой красный маяк
  const tailLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff0000, emissiveIntensity: 1.5 })
  );
  tailLight.position.set(0, 0, 0.68);
  group.add(tailLight);

  // === Лучи и винты ===
  const rotors = [];
  const armDefs = [
    { x:  1, z:  1, color: accent },
    { x: -1, z:  1, color: accent },
    { x:  1, z: -1, color: accent },
    { x: -1, z: -1, color: accent },
  ];

  armDefs.forEach(a => {
    // Луч — слегка поднят над корпусом
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 1.5), mid);
    arm.position.set(a.x * 0.75, 0.06, a.z * 0.75);
    arm.rotation.y = Math.atan2(a.x, a.z);
    arm.castShadow = true;
    group.add(arm);

    // Мотор
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.22, 10), dark);
    motor.position.set(a.x * 1.35, 0.15, a.z * 1.35);
    motor.castShadow = true;
    group.add(motor);

    // Кольцо под мотором
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 6, 16), accent);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(a.x * 1.35, 0.05, a.z * 1.35);
    group.add(ring);

    // Пропеллер — две лопасти
    const rotor = new THREE.Group();
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x005522, metalness: 0.3, roughness: 0.6 });
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.06), bladeMat);
    const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.06), bladeMat);
    blade2.rotation.y = Math.PI / 2;
    rotor.add(blade1, blade2);
    rotor.position.set(a.x * 1.35, 0.28, a.z * 1.35);
    group.add(rotor);
    rotors.push(rotor);
  });

  // === Жёсткое шасси: 4 стойки + полозья ===
  const gearMat = new THREE.MeshStandardMaterial({ color: 0x555566, metalness: 0.5, roughness: 0.6 });
  const feetMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.9 });

  const legs = [
    { x:  0.55, z:  0.55 },
    { x: -0.55, z:  0.55 },
    { x:  0.55, z: -0.55 },
    { x: -0.55, z: -0.55 },
  ];

  // Вертикальные стойки
  legs.forEach(l => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.55, 8), gearMat);
    leg.position.set(l.x, -0.4, l.z);
    leg.castShadow = true;
    group.add(leg);
  });

  // Полозья — две длинные балки под левой и правой парой
  [-0.55, 0.55].forEach(z => {
    const skid = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.12), gearMat);
    skid.position.set(0, -0.68, z);
    skid.castShadow = true;
    group.add(skid);

    // Накладки-подошвы на концах полоза
    [-0.55, 0.55].forEach(x => {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.07, 0.16), feetMat);
      foot.position.set(x, -0.71, z);
      foot.castShadow = true;
      group.add(foot);
    });
  });

  // Поперечные перемычки между полозами (спереди и сзади) — визуально усиливают "шасси"
  [-0.4, 0.4].forEach(x => {
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 1.2), gearMat);
    cross.position.set(x, -0.68, 0);
    group.add(cross);
  });

  // Габаритный "низ" относительно центра группы — используется для посадки
  const bottomOffset = 0.72; // насколько центр корпуса выше "подошв"

  group.position.set(0, 10, 0);

  return {
    group,
    rotors,
    bottomOffset,
    spinRotors(dt, throttleNormalized) {
      const spd = 30 * dt * (0.6 + throttleNormalized * 0.9);
      rotors.forEach((r, i) => { r.rotation.y += (i % 2 === 0 ? spd : -spd) * 3; });
    },
  };
}