import * as THREE from 'three';

export function createQuadcopter() {
  const group = new THREE.Group();

  const dark = new THREE.MeshStandardMaterial({ color: 0x1a1a24, metalness: 0.7, roughness: 0.35 });
  const mid  = new THREE.MeshStandardMaterial({ color: 0x2b2b3a, metalness: 0.6, roughness: 0.5 });
  const accent = new THREE.MeshStandardMaterial({ color: 0x00e0ff, emissive: 0x005577, metalness: 0.4, roughness: 0.5 });
  const red = new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0x880000 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.1), dark);
  body.castShadow = true; group.add(body);

  const cabin = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.22, 14), mid);
  cabin.position.y = 0.26; cabin.castShadow = true; group.add(cabin);


  const rotors = [];
  const armDefs = [
    { x:  1, z:  1 }, { x: -1, z:  1 },
    { x:  1, z: -1 }, { x: -1, z: -1 },
  ];
  armDefs.forEach(a => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 1.5), mid);
    arm.position.set(a.x * 0.75, 0.06, a.z * 0.75);
    arm.rotation.y = Math.atan2(a.x, a.z);
    arm.castShadow = true; group.add(arm);

    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.22, 10), dark);
    motor.position.set(a.x * 1.35, 0.15, a.z * 1.35);
    motor.castShadow = true; group.add(motor);


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

  // Шасси
  const gearMat = new THREE.MeshStandardMaterial({ color: 0x555566, metalness: 0.5, roughness: 0.6 });
  const feetMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.9 });
  const legs = [
    { x:  0.55, z:  0.55 }, { x: -0.55, z:  0.55 },
    { x:  0.55, z: -0.55 }, { x: -0.55, z: -0.55 },
  ];
  legs.forEach(l => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.55, 8), gearMat);
    leg.position.set(l.x, -0.4, l.z); leg.castShadow = true; group.add(leg);
  });
  [-0.55, 0.55].forEach(z => {
    const skid = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.12), gearMat);
    skid.position.set(0, -0.68, z); skid.castShadow = true; group.add(skid);
    [-0.55, 0.55].forEach(x => {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.07, 0.16), feetMat);
      foot.position.set(x, -0.71, z); foot.castShadow = true; group.add(foot);
    });
  });

  return {
    group,
    rotors,
    bottomOffset: 0.72,
    spinRotors(dt, throttleNormalized) {
      const spd = 30 * dt * (0.6 + throttleNormalized * 0.9);
      rotors.forEach((r, i) => { r.rotation.y += (i % 2 === 0 ? spd : -spd) * 3; });
    },
  };
}