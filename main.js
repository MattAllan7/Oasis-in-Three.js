import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { degToRad, randFloat } from 'three/src/math/MathUtils.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Loaders >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const mtlLoader = new MTLLoader();
const objLoader = new OBJLoader();
const gltfLoader = new GLTFLoader();

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Scene >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const scene = new THREE.Scene();

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Camera >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
camera.position.set( 0, 500, 0 );

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Renderer >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Camera Controls >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

// Temporary orbit controls. 
const orbitControls = new OrbitControls( camera, renderer.domElement );

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Light >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

// Sunlight
const sunlightColor = new THREE.Color(0xF5E5C1);
const sunlightIntensity = 3;
const sunlight = new THREE.DirectionalLight(sunlightColor, sunlightIntensity);
sunlight.position.set(200, 500, 800);

// Shadows
sunlight.castShadow = true;
sunlight.shadow.mapSize.width = 1024;
sunlight.shadow.mapSize.height = 1024;
sunlight.shadow.camera.top = 600;
sunlight.shadow.camera.bottom = -600;
sunlight.shadow.camera.left = -600;
sunlight.shadow.camera.right = 600;
sunlight.shadow.camera.far = 2048;
sunlight.shadow.camera.updateProjectionMatrix();

scene.add(sunlight);

const sunlightHelper = new THREE.DirectionalLightHelper(sunlight, 50);
scene.add(sunlightHelper);

// Ambient light
const ambientColor = new THREE.Color(0xD68142);
const ambientIntensity = 0.1;
const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
scene.add(ambientLight);

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Ground >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const textureLoader = new THREE.TextureLoader();

// Height map logic from: https://www.youtube.com/watch?v=wULUAhckH9w. 
// Height map image from: https://www.deviantart.com/elmininostock/art/Sand-Dunes-Height-Map-seamless-591456783. 
// Sand texture from: https://texturelabs.org/textures/soil_126/. 

// Ground geometry
const groundWidth = 1024;
const groundHeight = 1024;
const groundWidthSeg = 128; 
const groundHeightSeg = 128;
const groundGeo = new THREE.PlaneGeometry(
  groundWidth, 
  groundHeight, 
  groundWidthSeg, 
  groundHeightSeg
);

// Ground material
const groundColor = new THREE.Color(0xCCB681);

const sandTexture = textureLoader.load("./images/sandTexture.png");
sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
sandTexture.repeat.set(8, 8);
sandTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

let displacementMap = textureLoader.load("./images/heightMap.png");
let displacementScale = 80;

let normalMap = textureLoader.load("./images/normalMap.jpg");

const groundMat = new THREE.MeshStandardMaterial({
  color: groundColor, 
  map: sandTexture,
  displacementMap: displacementMap, 
  displacementScale: displacementScale,
  normalMap: normalMap,
  side: THREE.DoubleSide,
  wireframe: false, 
});

// Ground mesh
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
groundMesh.position.set(0, 0, 0);
groundMesh.receiveShadow = true;
groundMesh.rotateX(degToRad(-90));

scene.add(groundMesh);

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Water >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

// Water plane
const waterWidth = 128;
const waterHeight = 128;
const waterWidthSeg = 1; 
const waterHeightSeg = 1;
const waterGeo = new THREE.PlaneGeometry(
  waterWidth, 
  waterHeight, 
  waterWidthSeg, 
  waterHeightSeg
);

// Water material
const waterColor = new THREE.Color(0x65B6C7)
const waterMat = new THREE.MeshStandardMaterial({
  color: waterColor, 
  transparent: true, 
  opacity: 0.75, 
  side: THREE.DoubleSide,
});

// Water mesh
const waterMesh = new THREE.Mesh(waterGeo, waterMat);
waterMesh.receiveShadow = false;
waterMesh.rotateX(degToRad(-90));
waterMesh.position.set(0, 17, 0);
scene.add(waterMesh);

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Cacti >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const cactusMaterial = await mtlLoader.loadAsync("models/Cactus/cactus.mtl");
cactusMaterial.preload();

objLoader.setMaterials(cactusMaterial);
const cactusOBJ = await objLoader.loadAsync("models/Cactus/cactus.obj");

cactusOBJ.scale.set(2, 2, 2);

const cacti = [
  {x: -400, y: 35, z: -400},
  {x: -100, y: 28, z: -300},
  {x: 250, y: 26, z: -450},
  {x: 350, y: 20, z: -50},
  {x: 300, y: 25, z: 150},
  {x: 150, y: 27, z: 300},
  {x: 375, y: 33, z: 375},
  {x: -100, y: 33, z: 350},
  {x: -300, y: 25, z: 200},
  {x: -400, y: 21, z: 25},
  {x: -250, y: 15, z: -100},
]

cacti.forEach(cactus => {
  createCactus(cactus.x, cactus.y, cactus.z);
});

function createCactus(x, y, z) {
  let cactus = cactusOBJ.clone();

  cactus.position.set(x, y, z);
  cactus.rotateY(degToRad(randFloat(0, 360)));

  // Shadows
  cactus.traverse((child) => {
    if (child.isMesh) {
      child.receiveShadow = true;
      child.castShadow = true;
    }
  });
  
  scene.add(cactus);
}

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Trees >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const treeGLTF = await gltfLoader.loadAsync("models/PalmTree.glb");
treeGLTF.scene.scale.set(4, 4, 4);

const trees = [
  {x: 50, y:18, z:50, r: 45},
  {x: -70, y:18, z:10, r: 270},
  {x: 20, y:18, z:-65, r: 150},
];

trees.forEach(tree => {
  createTree(tree.x, tree.y, tree.z, tree.r);
});

function createTree(x, y, z, r) {
  let tree = treeGLTF.scene.clone();

  tree.position.set(x, y, z);
  tree.rotateY(degToRad(r));

  // Shadows
  tree.traverse((child) => {
    if (child.isMesh) {
      child.receiveShadow = true;
      child.castShadow = true;
    }
  });

  scene.add(tree);
}

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Rocks >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const rockGLTF = await gltfLoader.loadAsync("models/Rock.glb");

const rocks = [
  {x: 75, y: 20, z: 25},
  {x: 45, y: 20, z: -55},
  {x: -25, y: 20, z: -75},
  {x: -65, y: 20, z: -20},
  {x: -75, y: 20, z: 0},
  {x: -45, y: 20, z: 55},
];

rocks.forEach(rock => {
  createRock(rock.x, rock.y, rock.z);
});

function createRock(x, y, z) {
  let rock = rockGLTF.scene.clone();

  rock.position.set(x, y, z);
  rock.rotateY(degToRad(randFloat(0, 360)));
  const rockScale = randFloat(2, 4);
  rock.scale.set(rockScale, rockScale, rockScale);

  // Shadows
  rock.traverse((child) => {
    if (child.isMesh) {
      child.receiveShadow = true;
      child.castShadow = true;
    }
  });

  scene.add(rock);
}

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Animate >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

function animate() {
  requestAnimationFrame(animate);

  orbitControls.update();

  render();
}

function render() {
    renderer.render(scene, camera);
}

animate();