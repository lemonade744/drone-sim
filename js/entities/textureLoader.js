import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = new Map();

export function loadTexture(path, repeatX = 1, repeatY = 1) {
  const key = `${path}|${repeatX}|${repeatY}`;
  if (cache.has(key)) return cache.get(key);

  const tex = loader.load(path);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;

  cache.set(key, tex);
  return tex;
}