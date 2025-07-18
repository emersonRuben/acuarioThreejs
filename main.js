import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
import { FontLoader } from 'https://unpkg.com/three@0.165.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://unpkg.com/three@0.165.0/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'https://unpkg.com/three@0.165.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.165.0/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight, false);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222e3c);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 16, 48);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 8, 0);

// Iluminación
scene.add(new THREE.AmbientLight(0x88bfff, 0.7));
const spot = new THREE.SpotLight(0xfff2cc, 1.2, 160, Math.PI/5, 0.5, 1);
spot.position.set(0, 60, 0);
scene.add(spot);

// Acuario
const ACUARIO_WIDTH = 40 * 5;
const ACUARIO_HEIGHT = 28 * 5;
const ACUARIO_DEPTH = 22 * 5;
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x99ccff,
  metalness: 0.1,
  roughness: 0.1,
  transmission: 0.85,
  thickness: 0.5,
  transparent: true,
  opacity: 0.5,
  ior: 1.33,
  side: THREE.DoubleSide
});
const aquarium = new THREE.Mesh(
  new THREE.BoxGeometry(ACUARIO_WIDTH, ACUARIO_HEIGHT, ACUARIO_DEPTH),
  glassMaterial
);
aquarium.position.y = ACUARIO_HEIGHT / 2;
scene.add(aquarium);

// Fondo de la pecera
const sand = new THREE.Mesh(
  new THREE.CylinderGeometry(ACUARIO_WIDTH/2-1, ACUARIO_WIDTH/2-1, 1, 80),
  new THREE.MeshLambertMaterial({ color: 0xf7e7b6 })
);
sand.position.y = 0.5;
scene.add(sand);

// Configuración mejorada para los textos
const createText = (text, x, z) => {
  const loader = new FontLoader();
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const geometry = new TextGeometry(text, {
      font: font,
      size: 7.5,
      height: 0.9,
      curveSegments: 3,
      bevelEnabled: false
    });
    geometry.computeBoundingBox();
    geometry.center();
    
    const material = new THREE.MeshPhongMaterial({
       color: 0xFFC0CB,
      emissive: 0x00aa88,
      specular: 0x111111,
      shininess: 30,
      transparent: true,
      opacity: 0.95
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, 1.8, z);
    mesh.rotation.x = -Math.PI / 2;
    
    const textShadow = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
    );
    textShadow.position.set(x, 1.78, z);
    textShadow.rotation.x = -Math.PI / 2;
    textShadow.scale.set(1.03, 1.03, 1.03);
    scene.add(textShadow);
    
    scene.add(mesh);
    
    const textLight = new THREE.PointLight(0x00ffaa, 0.8, 12);
    textLight.position.set(x, 3, z);
    scene.add(textLight);
    
  }, undefined, (err) => {
    console.error('Error loading font:', err);
  });
};

// Nombres en el suelo con nuevo estilo
createText("Dony Ivan Callata", -ACUARIO_WIDTH/4, -ACUARIO_DEPTH/4);
createText("Henry Elias Quispe", ACUARIO_WIDTH/4, -ACUARIO_DEPTH/4);
createText("Emerson Ruben Huacasi", 0, ACUARIO_DEPTH/4);

// Plantas del acuario
const PLANT_COUNT = 60;
const plantColors = [0x228B22, 0x2ecc40, 0x145a32, 0x7ed957, 0x3e8e41, 0x1abc9c, 0x16a085];
const algas = [];
for (let i = 0; i < PLANT_COUNT; i++) {
  const isAlga = Math.random() < 0.7;
  const color = plantColors[Math.floor(Math.random()*plantColors.length)];
  if (isAlga) {
    const segmentCount = 6 + Math.floor(Math.random()*6);
    const baseX = (Math.random()-0.5)*(ACUARIO_WIDTH-2);
    const baseZ = (Math.random()-0.5)*(ACUARIO_DEPTH-2);
    const baseY = 1.2;
    const algaSegments = [];
    let prevY = baseY;
    let prevX = baseX;
    let prevZ = baseZ;
    for (let j = 0; j < segmentCount; j++) {
      const segRadius = 0.18 + Math.random()*0.08;
      const segHeight = 1.1 + Math.random()*0.7;
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(segRadius*0.7, segRadius, segHeight, 8),
        new THREE.MeshLambertMaterial({ color })
      );
      const angle = (Math.random()-0.5)*0.5 + (j/segmentCount-0.5)*0.7;
      const x = prevX + Math.sin(angle)*0.18;
      const y = prevY + segHeight*0.85;
      const z = prevZ + Math.cos(angle)*0.18;
      seg.position.set(x, y, z);
      seg.userData = { baseX: x, baseY: y, baseZ: z, segIndex: j, algaIndex: algas.length };
      scene.add(seg);
      algaSegments.push(seg);
      prevX = x;
      prevY = y;
      prevZ = z;
    }
    algas.push(algaSegments);
  } else {
    const type = Math.random();
    let plant;
    if (type < 0.5) {
      plant = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12 + Math.random()*0.18, 0.22 + Math.random()*0.18, 5 + Math.random()*12, 8),
        new THREE.MeshLambertMaterial({ color })
      );
    } else if (type < 0.8) {
      plant = new THREE.Mesh(
        new THREE.ConeGeometry(0.25 + Math.random()*0.18, 4 + Math.random()*8, 8),
        new THREE.MeshLambertMaterial({ color })
      );
    } else {
      plant = new THREE.Mesh(
        new THREE.SphereGeometry(0.5 + Math.random()*0.4, 8, 8),
        new THREE.MeshLambertMaterial({ color })
      );
    }
    plant.position.set(
      (Math.random()-0.5)*(ACUARIO_WIDTH-2),
      1.2 + Math.random()*3,
      (Math.random()-0.5)*(ACUARIO_DEPTH-2)
    );
    plant.rotation.x = Math.PI/2 * Math.random();
    scene.add(plant);
  }
}

// Burbujas
const bubbleGeometry = new THREE.SphereGeometry(0.11, 8, 8);
const bubbleMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x99e6ff,
  transparent: true,
  opacity: 0.5,
  roughness: 0.2,
  metalness: 0.1
});
const bubbles = [];
for (let i = 0; i < 120; i++) {
  const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
  bubble.position.set(
    (Math.random()-0.5)*(ACUARIO_WIDTH-4),
    Math.random()*(ACUARIO_HEIGHT-2)+1,
    (Math.random()-0.5)*(ACUARIO_DEPTH-4)
  );
  scene.add(bubble);
  bubbles.push(bubble);
}

// Parámetros de boids
const NUM_BOIDS = 40;
const RADIO_SEPARACION = 25 * 3;
const RADIO_ALINEACION = 50 * 3;
const RADIO_COHESION = 50 * 3;
const BORDER_DISTANCE = 30;
const BORDER_STRENGTH = 0.25;
const NUM_GROUPS = 4;

class Boid {
  constructor(x, y, z, group) {
    this.position = new THREE.Vector3(x, y, z);
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const speed = 0.7 + Math.random() * 0.5;
    this.velocity = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi)
    ).multiplyScalar(speed);
    this.acceleration = new THREE.Vector3();
    this.maxSpeed = 0.32 + Math.random() * 0.10;
    this.maxForce = 0.008 + Math.random() * 0.004;
    this.oscFreq = 1.2 + Math.random() * 0.7;
    this.oscAmp = 0.18 + Math.random() * 0.08;
    this.group = group;
    this.noiseStrength = 0.012 + Math.random() * 0.008;
    this.lastLookDir = new THREE.Vector3(1,0,0);
  }

  applyBehaviors(boids) {
    const groupBoids = boids.filter(b => b.group === this.group);
    const separation = this.separate(groupBoids).multiplyScalar(1.7);
    const alignment = this.align(groupBoids).multiplyScalar(1.0);
    const cohesion = this.cohesion(groupBoids).multiplyScalar(0.9);
    const border = this.avoidBorders().multiplyScalar(1.5);
    const noise = new THREE.Vector3(
      (Math.random()-0.5)*this.noiseStrength,
      (Math.random()-0.5)*this.noiseStrength,
      (Math.random()-0.5)*this.noiseStrength
    );
    this.acceleration.add(separation);
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(border);
    this.acceleration.add(noise);
  }

  separate(boids) {
    let steer = new THREE.Vector3();
    let count = 0;
    for (let other of boids) {
      let d = this.position.distanceTo(other.position);
      if (other !== this && d > 0 && d < RADIO_SEPARACION) {
        let diff = this.position.clone().sub(other.position).normalize().divideScalar(d);
        steer.add(diff);
        count++;
      }
    }
    if (count > 0) {
      steer.divideScalar(count);
    }
    if (steer.length() > 0) {
      steer.setLength(this.maxSpeed);
      steer.sub(this.velocity);
      if (steer.length() > this.maxForce) {
        steer.setLength(this.maxForce);
      }
    }
    return steer;
  }

  align(boids) {
    let sum = new THREE.Vector3();
    let count = 0;
    for (let other of boids) {
      let d = this.position.distanceTo(other.position);
      if (other !== this && d < RADIO_ALINEACION) {
        sum.add(other.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.divideScalar(count);
      sum.setLength(this.maxSpeed);
      let steer = sum.sub(this.velocity);
      if (steer.length() > this.maxForce) {
        steer.setLength(this.maxForce);
      }
      return steer;
    }
    return new THREE.Vector3();
  }

  cohesion(boids) {
    let sum = new THREE.Vector3();
    let count = 0;
    for (let other of boids) {
      let d = this.position.distanceTo(other.position);
      if (other !== this && d < RADIO_COHESION) {
        sum.add(other.position);
        count++;
      }
    }
    if (count > 0) {
      sum.divideScalar(count);
      return this.seek(sum);
    }
    return new THREE.Vector3();
  }

  seek(target) {
    let desired = target.clone().sub(this.position);
    if (desired.length() > 0) {
      desired.setLength(this.maxSpeed);
      let steer = desired.sub(this.velocity);
      if (steer.length() > this.maxForce) {
        steer.setLength(this.maxForce);
      }
      return steer;
    }
    return new THREE.Vector3();
  }

  avoidBorders() {
    let steer = new THREE.Vector3();
    if (this.position.x < -ACUARIO_WIDTH/2 + BORDER_DISTANCE) {
      steer.x += BORDER_STRENGTH;
    } else if (this.position.x > ACUARIO_WIDTH/2 - BORDER_DISTANCE) {
      steer.x -= BORDER_STRENGTH;
    }
    if (this.position.y < 1.5 + BORDER_DISTANCE) {
      steer.y += BORDER_STRENGTH;
    } else if (this.position.y > ACUARIO_HEIGHT-2.5*3 - BORDER_DISTANCE) {
      steer.y -= BORDER_STRENGTH;
    }
    if (this.position.z < -ACUARIO_DEPTH/2 + BORDER_DISTANCE) {
      steer.z += BORDER_STRENGTH;
    } else if (this.position.z > ACUARIO_DEPTH/2 - BORDER_DISTANCE) {
      steer.z -= BORDER_STRENGTH;
    }
    return steer;
  }

  update() {
    const desired = this.velocity.clone().add(this.acceleration);
    const maxTurnAngle = Math.PI / 18;
    const currentDir = this.velocity.clone().normalize();
    const desiredDir = desired.clone().normalize();
    let angle = currentDir.angleTo(desiredDir);
    if (angle > maxTurnAngle) {
      const axis = new THREE.Vector3().crossVectors(currentDir, desiredDir).normalize();
      const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, maxTurnAngle);
      const newDir = currentDir.clone().applyQuaternion(quaternion);
      this.velocity.copy(newDir.multiplyScalar(this.velocity.length()));
    } else {
      this.velocity.copy(desiredDir.multiplyScalar(this.velocity.length()));
    }
    if (this.velocity.length() > this.maxSpeed) {
      this.velocity.setLength(this.maxSpeed);
    } else if (this.velocity.length() < 0.13) {
      this.velocity.setLength(0.13);
    }
    this.position.add(this.velocity);
    this.acceleration.multiplyScalar(0);
  }
}

// Peces koi
const loader = new GLTFLoader();
const KOI_COUNT = NUM_BOIDS;
const kois = [];
const boids = [];
const mixers = [];

for (let i = 0; i < KOI_COUNT; i++) {
  const x = (Math.random()-0.5)*(ACUARIO_WIDTH-6);
  const y = 2+Math.random()*(ACUARIO_HEIGHT-4);
  const z = (Math.random()-0.5)*(ACUARIO_DEPTH-6);
  const group = i % NUM_GROUPS;
  const boid = new Boid(x, y, z, group);
  boids.push(boid);
  loader.load('/acuarioThreejs/koi_fish.glb', (gltf) => {
    const koi = gltf.scene;
    koi.scale.set(1.3, 1.3, 1.3);
    koi.position.copy(boid.position);
    scene.add(koi);
    kois.push({ mesh: koi, boid });
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new AnimationMixer(koi);
      gltf.animations.forEach(clip => mixer.clipAction(clip).play());
      mixers.push(mixer);
    }
  });
}

const PREDATOR_COLOR = 0xcc2222;
const PREDATOR_SCALE = 2.2;
let predator = null;
let predatorBoid = null;
let predatorTargetIndex = null;
let predatorCooldown = 0;

loader.load('/acuarioThreejs/koi_fish.glb', (gltf) => {
  const koi = gltf.scene;
  koi.scale.set(PREDATOR_SCALE, PREDATOR_SCALE, PREDATOR_SCALE);
  koi.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.color.setHex(PREDATOR_COLOR);
      child.material.emissive.setHex(PREDATOR_COLOR);
      child.material.emissiveIntensity = 0.25;
    }
  });
  const x = (Math.random()-0.5)*(ACUARIO_WIDTH-10);
  const y = 2+Math.random()*(ACUARIO_HEIGHT-8);
  const z = (Math.random()-0.5)*(ACUARIO_DEPTH-10);
  koi.position.set(x, y, z);
  scene.add(koi);
  predator = koi;
  predatorBoid = new Boid(x, y, z, -1);
  predatorBoid.maxSpeed = 0.38;
  predatorBoid.maxForce = 0.012;
  predatorBoid.oscFreq = 1.1;
  predatorBoid.oscAmp = 0.22;
  predatorBoid.noiseStrength = 0.008;
  predatorBoid.lastLookDir = new THREE.Vector3(1,0,0);
  if (gltf.animations && gltf.animations.length > 0) {
    const mixer = new AnimationMixer(koi);
    gltf.animations.forEach(clip => mixer.clipAction(clip).play());
    mixers.push(mixer);
  }
});

// Animación
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  // Movimiento de burbujas
  for (let bubble of bubbles) {
    bubble.position.y += 0.05 + Math.random()*0.015;
    if (bubble.position.y > ACUARIO_HEIGHT-0.5) {
      bubble.position.y = 1;
      bubble.position.x = (Math.random()-0.5)*(ACUARIO_WIDTH-4);
      bubble.position.z = (Math.random()-0.5)*(ACUARIO_DEPTH-4);
    }
  }

  // Movimiento peces koi
  for (let i = 0; i < kois.length; i++) {
    const koiObj = kois[i];
    const boid = koiObj.boid;
    boid.applyBehaviors(boids);
    boid.update();
    koiObj.mesh.position.copy(boid.position);
    if (boid.velocity.length() > 0.001) {
      const dir = boid.velocity.clone().normalize();
      const t = performance.now() * 0.001 * boid.oscFreq + i;
      const osc = Math.sin(t) * boid.oscAmp;
      const lookDir = dir.clone();
      lookDir.x += osc * 0.3;
      lookDir.y += osc * 0.1;
      boid.lastLookDir.lerp(lookDir, 0.18);
      const target = koiObj.mesh.position.clone().add(boid.lastLookDir);
      koiObj.mesh.lookAt(target);
      koiObj.mesh.rotateY(-Math.PI/2);
      koiObj.mesh.rotation.z += osc * 0.25;
    }
  }

  // Animaciones
  const delta = clock.getDelta();
  for (let mixer of mixers) {
    mixer.update(delta);
  }

  // Animación algas
  function animarAlgas(tiempo) {
    for (let alga of algas) {
      for (let seg of alga) {
        const j = seg.userData.segIndex;
        const i = seg.userData.algaIndex;
        const osc = Math.sin(tiempo*0.7 + i*0.8 + j*0.5) * 0.18 * (j/alga.length);
        seg.position.x = seg.userData.baseX + osc;
        seg.position.z = seg.userData.baseZ + osc*0.5;
      }
    }
  }
  animarAlgas(performance.now()*0.001);

  // Movimiento depredador
  if (predator && predatorBoid) {
    predatorCooldown--;
    if (predatorCooldown <= 0) {
      predatorTargetIndex = Math.floor(Math.random()*kois.length);
      predatorCooldown = 240 + Math.floor(Math.random()*180);
    }
    if (kois[predatorTargetIndex]) {
      const targetPos = kois[predatorTargetIndex].boid.position;
      const desired = targetPos.clone().sub(predatorBoid.position);
      if (desired.length() > 0.1) {
        desired.setLength(predatorBoid.maxSpeed);
        const steer = desired.sub(predatorBoid.velocity);
        if (steer.length() > predatorBoid.maxForce) {
          steer.setLength(predatorBoid.maxForce);
        }
        predatorBoid.acceleration.add(steer);
      }
    }
    predatorBoid.acceleration.add(predatorBoid.avoidBorders().multiplyScalar(1.7));
    const noise = new THREE.Vector3(
      (Math.random()-0.5)*predatorBoid.noiseStrength,
      (Math.random()-0.5)*predatorBoid.noiseStrength,
      (Math.random()-0.5)*predatorBoid.noiseStrength
    );
    predatorBoid.acceleration.add(noise);
    predatorBoid.update();
    predator.position.copy(predatorBoid.position);
    if (predatorBoid.velocity.length() > 0.001) {
      const dir = predatorBoid.velocity.clone().normalize();
      const t = performance.now() * 0.001 * predatorBoid.oscFreq + 999;
      const osc = Math.sin(t) * predatorBoid.oscAmp;
      const lookDir = dir.clone();
      lookDir.x += osc * 0.3;
      lookDir.y += osc * 0.1;
      predatorBoid.lastLookDir.lerp(lookDir, 0.18);
      const target = predator.position.clone().add(predatorBoid.lastLookDir);
      predator.lookAt(target);
      predator.rotateY(-Math.PI/2);
      predator.rotation.z += osc * 0.25;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();