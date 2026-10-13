import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const cache = new Map();

// Кэшируем промисы, а не сами модели — чтобы параллельные запросы
// одного и того же файла не грузили его дважды
const pending = new Map();

export function loadModel(path) {
  if (cache.has(path)) return Promise.resolve(cache.get(path));
  if (pending.has(path)) return pending.get(path);

  const promise = new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const scene = gltf.scene;
        scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Мелкие модели — не отбрасывают тень, экономим
            if (child.geometry) {
              child.geometry.computeBoundingBox();
              const size = new THREE.Vector3();
              child.geometry.boundingBox.getSize(size);
              if (Math.max(size.x, size.y, size.z) < 1.5) {
                child.castShadow = false;
              }
            }
          }
        });
        cache.set(path, scene);
        pending.delete(path);
        resolve(scene);
      },
      undefined,
      (error) => {
        console.error(`Не удалось загрузить ${path}:`, error);
        pending.delete(path);
        reject(error);
      }
    );
  });

  pending.set(path, promise);
  return promise;
}

export function cloneModel(source) {
  const clone = source.clone(true);
  // Материалы клонируются, но текстуры — общие (по ссылке)
  return clone;
}

// Автоматический расчёт коллайдера по bounding box модели
export function getModelCollider(model, x, z) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  return {
    x: x,
    z: z,
    r: Math.max(size.x, size.z) * 0.45,
    top: size.y,
  };
}