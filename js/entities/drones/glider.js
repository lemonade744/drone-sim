import * as THREE from 'three';

export function createGlider() {
  const group = new THREE.Group();

  const fuselageMat = new THREE.MeshStandardMaterial({ color: 0xe8eef4, metalness: 0.4, roughness: 0.5 });
  const wingMat     = new THREE.MeshStandardMaterial({ color: 0xd0d8e0, metalness: 0.3, roughness: 0.55 });
  const darkMat     = new THREE.MeshStandardMaterial({ color: 0x2a2a32, metalness: 0.5, roughness: 0.5 });
  const accentMat   = new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0x550000, metalness: 0.4, roughness: 0.5 });
  const goldMat     = new THREE.MeshStandardMaterial({ color: 0xffcc44, emissive: 0x553300, metalness: 0.5, roughness: 0.4 });
  const gearMat     = new THREE.MeshStandardMaterial({ color: 0x3a3a44, metalness: 0.6, roughness: 0.55 });
  const wheelMat    = new THREE.MeshStandardMaterial({ color: 0x0a0a10, roughness: 0.9 });
  const glassMat    = new THREE.MeshStandardMaterial({
    color: 0x88ccff, emissive: 0x224466,
    metalness: 0.8, roughness: 0.1, transparent: true, opacity: 0.7,
  });

  // === Фюзеляж ===
  const fuselage = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 2.8), fuselageMat);
  fuselage.castShadow = true;
  group.add(fuselage);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.7, 14), fuselageMat);
  nose.rotation.x = -Math.PI / 2;
  nose.position.set(0, 0, -1.7);
  nose.castShadow = true;
  group.add(nose);

  const tailCone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 12), fuselageMat);
  tailCone.rotation.x = Math.PI / 2;
  tailCone.position.set(0, 0, 1.65);
  tailCone.castShadow = true;
  group.add(tailCone);

  // Кабина
  const cabin = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    glassMat
  );
  cabin.position.set(0, 0.22, -1.0);
  group.add(cabin);

  const cabinRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.03, 6, 20, Math.PI),
    goldMat
  );
  cabinRim.rotation.x = Math.PI / 2;
  cabinRim.rotation.z = Math.PI;
  cabinRim.position.set(0, 0.22, -1.0);
  group.add(cabinRim);

  // Красная полоса вдоль фюзеляжа
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 2.6), accentMat);
  stripe.position.set(0, -0.1, 0);
  group.add(stripe);

  // === Крылья ===
  const wingGeo = new THREE.BoxGeometry(2.8, 0.07, 0.75);
  const wing = new THREE.Mesh(wingGeo, wingMat);
  wing.position.set(0, 0.05, -0.15);
  wing.castShadow = true;
  group.add(wing);

  [-1, 1].forEach(side => {
    const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.55), wingMat);
    winglet.position.set(side * 1.4, 0.18, -0.15);
    winglet.castShadow = true;
    group.add(winglet);

    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.38, 0.15), accentMat);
    tip.position.set(side * 1.4, 0.18, -0.4);
    group.add(tip);

    const wingStripe = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.74), accentMat);
    wingStripe.position.set(side * 0.9, 0.01, -0.15);
    group.add(wingStripe);
  });

  // === Хвост ===
  const finGeo = new THREE.BoxGeometry(0.06, 0.75, 0.65);
  const fin = new THREE.Mesh(finGeo, wingMat);
  fin.position.set(0, 0.55, 1.35);
  fin.castShadow = true;
  group.add(fin);

  const finSlope = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.4), wingMat);
  finSlope.position.set(0, 0.48, 1.05);
  finSlope.rotation.x = -0.3;
  group.add(finSlope);

  const rudder = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.6, 0.15), accentMat);
  rudder.position.set(0, 0.55, 1.62);
  group.add(rudder);

  const stab = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.4), wingMat);
  stab.position.set(0, 0.15, 1.35);
  stab.castShadow = true;
  group.add(stab);

  [-1, 1].forEach(side => {
    const stabTip = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.07, 0.42), accentMat);
    stabTip.position.set(side * 0.62, 0.15, 1.35);
    group.add(stabTip);
  });

  // === Двигатель и винт сзади ===
  const engineBody = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.4, 12), darkMat);
  engineBody.rotation.x = Math.PI / 2;
  engineBody.position.set(0, 0, 1.95);
  engineBody.castShadow = true;
  group.add(engineBody);

  const engineRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 20), goldMat);
  engineRing.rotation.y = Math.PI / 2;
  engineRing.position.set(0, 0, 1.78);
  group.add(engineRing);

  // Винт
  const rotor = new THREE.Group();
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0x00e0ff, emissive: 0x004466,
    metalness: 0.4, roughness: 0.5,
  });
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.09), bladeMat);
    blade.rotation.z = (i / 3) * Math.PI * 2;
    rotor.add(blade);
  }
  rotor.position.set(0, 0, 2.15);
  group.add(rotor);

  // Маяк
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xff0000, emissiveIntensity: 2.0 })
  );
  beacon.position.set(0, 0.95, 1.35);
  group.add(beacon);

  // === Шасси ===
  // Носовая стойка
  const noseStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.55, 8), gearMat);
  noseStrut.position.set(0, -0.5, -1.3);
  noseStrut.castShadow = true;
  group.add(noseStrut);

  const noseMount = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.15), gearMat);
  noseMount.position.set(0, -0.25, -1.3);
  group.add(noseMount);

  const noseWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 14), wheelMat);
  noseWheel.rotation.z = Math.PI / 2;
  noseWheel.position.set(0, -0.78, -1.3);
  noseWheel.castShadow = true;
  group.add(noseWheel);

  const noseHub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8), goldMat);
  noseHub.rotation.z = Math.PI / 2;
  noseHub.position.set(0, -0.78, -1.3);
  group.add(noseHub);

  // Основные стойки
  [-0.55, 0.55].forEach(x => {
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.65, 8), gearMat);
    strut.position.set(x, -0.5, 0.2);
    strut.rotation.z = x > 0 ? -0.18 : 0.18;
    strut.castShadow = true;
    group.add(strut);

    const mount = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.2), gearMat);
    mount.position.set(x * 0.55, -0.22, 0.2);
    mount.castShadow = true;
    group.add(mount);

    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8), gearMat);
    axle.rotation.z = Math.PI / 2;
    axle.position.set(x, -0.78, 0.2);
    group.add(axle);

    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.11, 14), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, -0.82, 0.2);
    wheel.castShadow = true;
    group.add(wheel);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.13, 8), goldMat);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(x, -0.82, 0.2);
    group.add(hub);

    const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), gearMat);
    brace.position.set(x * 0.75, -0.4, 0.35);
    brace.rotation.z = x > 0 ? -0.5 : 0.5;
    brace.rotation.x = 0.3;
    group.add(brace);
  });

  // Хвостовая стойка
  const tailStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.35, 6), gearMat);
  tailStrut.position.set(0, -0.55, 1.75);
  group.add(tailStrut);

  const tailWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 10), wheelMat);
  tailWheel.rotation.z = Math.PI / 2;
  tailWheel.position.set(0, -0.72, 1.75);
  group.add(tailWheel);
    // === Катапульта (визуальная часть, видна только на старте) ===
  const catapult = new THREE.Group();

  // Направляющая — длинная балка под углом
  const railMat = new THREE.MeshStandardMaterial({ color: 0x555560, metalness: 0.7, roughness: 0.4 });
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 3.5), railMat);
  rail.position.set(0, -0.4, 0);
  catapult.add(rail);

  // Опоры катапульты — две ножки
  [-1.2, 1.2].forEach(z => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8), railMat);
    leg.position.set(0, -0.85, z);
    catapult.add(leg);

    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.25), railMat);
    foot.position.set(0, -1.28, z);
    catapult.add(foot);
  });

  // Пружина/натяжитель спереди
  const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x888890, metalness: 0.9, roughness: 0.3 }));
  spring.position.set(0, -0.4, -1.4);
  catapult.add(spring);

  // Красные маркеры на направляющей
  [-0.4, 0.4].forEach(z => {
    const marker = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0x550000 }));
    marker.position.set(0, -0.4, z);
    catapult.add(marker);
  });

  group.add(catapult);

  return {
    group,
    rotors: [rotor],
    catapult,
    bottomOffset: 0.95,
    spinRotors(dt, throttleNormalized) {
      rotor.rotation.z += 60 * dt * (0.3 + throttleNormalized * 1.5);
    },
  };
}