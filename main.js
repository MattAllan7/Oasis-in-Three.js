import * as THREE from 'three';
import { degToRad, randFloat, randFloatSpread, randInt } from 'three/src/math/MathUtils.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Water } from 'three/addons/objects/Water.js';
import { GUI } from 'dat.gui'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Loaders >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



const cubeTextureLoader = new THREE.CubeTextureLoader()
const mtlLoader = new MTLLoader();
const objLoader = new OBJLoader();
const gltfLoader = new GLTFLoader();



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Scene >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



const scene = new THREE.Scene();



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Camera >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(-200, 50, 0);
camera.lookAt(0, 50, 0,);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Renderer >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Skybox >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Day
cubeTextureLoader.setPath('images/SkyboxDay/');
const daySkybox = await cubeTextureLoader.loadAsync([
  'front.png', 'back.png', 'top.png', 
  'bottom.png', 'right.png', 'left.png'
]);
scene.background = daySkybox;

// Night
cubeTextureLoader.setPath('images/SkyboxNight/');
const nightSkybox = await cubeTextureLoader.loadAsync([
  'front.png', 'back.png', 'top.png', 
  'bottom.png', 'right.png', 'left.png'
]);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Camera Controls >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



const cameraControls = new PointerLockControls(camera, renderer.domElement);

const moveSpeed = 500;
const movement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false, 
  down: false,
};

document.addEventListener('click', function () {cameraControls.lock();}, false);

document.addEventListener('keydown', function (event) {
  switch (event.code) {
    case 'KeyW': movement.forward = true; break;
    case 'KeyA': movement.left = true; break;
    case 'KeyS': movement.backward = true; break;
    case 'KeyD': movement.right = true; break;
    case 'Space': movement.up = true; break;
    case 'ShiftLeft': movement.down = true; break;
  }
});  

document.addEventListener('keyup', function (event) {
  switch (event.code) {
    case 'KeyW': movement.forward = false; break;
    case 'KeyS': movement.backward = false; break;
    case 'KeyA': movement.left = false; break;
    case 'KeyD': movement.right = false; break;
    case 'Space': movement.up = false; break;
    case 'ShiftLeft': movement.down = false; break;
  }
});

const timerMovement = new THREE.Timer();
timerMovement.connect(document);

/**
 * Updates the camera position based on which movement keys are currently being pressed.
 * The camera movement is frame-rate independent since the movement speed is multiplied by the time delta between frames. 
 * The camera moves in the direction it is currently facing, so the movement directions are relative to the camera's orientation.
 */
function updateMovement() {
  timerMovement.update();
  const delta = timerMovement.getDelta();
  if (movement.forward)  cameraControls.moveForward(moveSpeed * delta);
  if (movement.backward) cameraControls.moveForward(-moveSpeed * delta);
  if (movement.left)     cameraControls.moveRight(-moveSpeed * delta);
  if (movement.right)    cameraControls.moveRight(moveSpeed * delta);
  if (movement.up)       moveUp(moveSpeed * delta);
  if (movement.down)     moveUp(-moveSpeed * delta);
}


/**
 * Since PointerLockControls does not have a moveUp method a custom one is defined. 
 * Moves camera on the y-axis. 
 * 
 * @param {number} distance Amount to move position by. 
 */
function moveUp(distance) {
  camera.position.y += distance;
}



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Directional and Ambient Light >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Sunlight
const sunlightColor = new THREE.Color(0xF5E5C1);
const sunlightIntensity = 2;
const sunlight = new THREE.DirectionalLight(sunlightColor, sunlightIntensity);
sunlight.position.set(-2100, 0, -2100);

// Shadows
// From user Drew Noakes: https://stackoverflow.com/questions/10742149/how-to-create-directional-light-shadow-in-three-js
sunlight.castShadow = true;
sunlight.shadow.mapSize.width = 4096;
sunlight.shadow.mapSize.height = 4096;
sunlight.shadow.camera.top = 3000;
sunlight.shadow.camera.bottom = -3000;
sunlight.shadow.camera.left = -3000;
sunlight.shadow.camera.right = 3000;
sunlight.shadow.camera.far = 9128;
sunlight.shadow.camera.updateProjectionMatrix();


// Moonlight
const moonlightColor = new THREE.Color(0x707980);
const moonlightIntensity = 2;
const moonlight = new THREE.DirectionalLight(moonlightColor, moonlightIntensity);
moonlight.position.set(2100, 0, 2100);

// Shadows
// From user Drew Noakes: https://stackoverflow.com/questions/10742149/how-to-create-directional-light-shadow-in-three-js
moonlight.castShadow = true;
moonlight.shadow.mapSize.width = 4096;
moonlight.shadow.mapSize.height = 4096;
moonlight.shadow.camera.top = 3000;
moonlight.shadow.camera.bottom = -3000;
moonlight.shadow.camera.left = -3000;
moonlight.shadow.camera.right = 3000;
moonlight.shadow.camera.far = 9128;
moonlight.shadow.camera.updateProjectionMatrix();


// Ambient light
const ambientColor = new THREE.Color(0xFFFFFF);
const ambientIntensity = 0.01;
const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);

scene.add(ambientLight);


// Directional light group
const directionalGroup = new THREE.Group();
directionalGroup.add(sunlight, moonlight);
directionalGroup.rotation.x = Math.PI / 2;

scene.add(directionalGroup);


// Directional helpers
const sunlightHelper = new THREE.DirectionalLightHelper(sunlight, 50);
const moonlightHelper = new THREE.DirectionalLightHelper(moonlight, 50);
scene.add(sunlightHelper, moonlightHelper);

const sunlightShadowHelper = new THREE.CameraHelper(sunlight.shadow.camera);
const moonlightShadowHelper = new THREE.CameraHelper(moonlight.shadow.camera);
// scene.add(sunlightShadowHelper, moonlightShadowHelper);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< GUI >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// https://sbcode.net/threejs/dat-gui-module/


const gui = new GUI();

const lightFolder = gui.addFolder('Light');
lightFolder.add(directionalGroup.rotation, 'x', 0, Math.PI * 4, 0.001);
lightFolder.open();



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Sand >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



const textureLoader = new THREE.TextureLoader();

// Height map logic from: https://www.youtube.com/watch?v=wULUAhckH9w. 
// Height map image from: https://www.deviantart.com/elmininostock/art/Sand-Dunes-Height-Map-seamless-591456783. 


// Sand geometry
const sandPlaneWidth = 4096;
const sandPlaneHeight = 4096;
const sandPlaneWidthSeg = 1024;
const sandPlaneHeightSeg = 1024;
const sandGeo = new THREE.PlaneGeometry(
  sandPlaneWidth, 
  sandPlaneHeight, 
  sandPlaneWidthSeg, 
  sandPlaneHeightSeg,
);


// Sand material

// Map
const sandTexture = textureLoader.load("./images/Sand/daySandTexture.png");
sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
sandTexture.repeat.set(128, 128);
sandTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

// Displacement
const sandDisplacementMap = textureLoader.load("./images/Sand/sandHeightMap.jpg");
const sandDisplacementScale = 160;

// Normal
const sandNormalMap = textureLoader.load("./images/Sand/sandNormalMap.jpg");
const sandNormalScale = 3;
sandNormalMap.colorSpace = THREE.NoColorSpace;

// Create material
const sandMat = new THREE.MeshStandardMaterial({
  map: sandTexture,
  displacementMap: sandDisplacementMap, 
  displacementScale: sandDisplacementScale,
  normalMap: sandNormalMap,
  normalScale: new THREE.Vector2(sandNormalScale, sandNormalScale),
  side: THREE.DoubleSide,
});


// Sand mesh
const sandMesh = new THREE.Mesh(sandGeo, sandMat);
sandMesh.position.set(0, -20, 0);
sandMesh.rotateX(degToRad(-90));
setShadowProperties(sandMesh, false, true);

scene.add(sandMesh);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Grass Terrain >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Texture from: https://www.poliigon.com/texture/flat-grass-texture/4585

// GLTF
const grassTerrainGLTF = await gltfLoader.loadAsync("./models/grassTerrain/grassTerrain.glb");
const grassTerrainScale = 1;
grassTerrainGLTF.scene.scale.set(grassTerrainScale, grassTerrainScale, grassTerrainScale);
grassTerrainGLTF.scene.position.set(0, 16, 0);


// Material

// Color
const grassTerrainColor = new THREE.Color(0xB1D18C); 

// Map
const grassColorMap = textureLoader.load("./models/grassTerrain/map.jpg");
grassColorMap.wrapS = grassColorMap.wrapT = THREE.RepeatWrapping;
grassColorMap.repeat.set(16, 16);
grassColorMap.anisotropy = renderer.capabilities.getMaxAnisotropy();

// Normal
const grassNormalMap = textureLoader.load("./models/grassTerrain/normal.png")

// Create material
const grassTerrainMat = new THREE.MeshStandardMaterial({
  map: grassColorMap, 
  color: grassTerrainColor,
  normalMap: grassNormalMap, 
});

// Apply material
grassTerrainGLTF.scene.traverse((child) => {
  if (child.isMesh) {
    child.material = grassTerrainMat;
  }
});

setShadowProperties(grassTerrainGLTF.scene, false, true);

// Add terrain
scene.add(grassTerrainGLTF.scene);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Grass Blades >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Logic from: https://threejs.org/docs/#BufferGeometry 
// Logic from: https://threejs.org/docs/#InstancedMesh 


// Blades

const grassGeo = new THREE.BufferGeometry();

const grassVertices = new Float32Array([
  0, 8, 0, // top
  -1, 0, 0, // left
  1, 0, 0, // right
]);
grassGeo.setAttribute('position', new THREE.BufferAttribute(grassVertices, 3));


// Shader material
// From: https://github.com/bobbyroe/getting-started-shaders

// Get shaders
const grassVertexShader = await fetch("./shaders/grass.vert");
const grassFragmentShader = await fetch("./shaders/grass.frag");

// For the fragment shader for varying colors 
// From: https://blog.mbedded.ninja/mathematics/perlin-noise/
const grassNoise = textureLoader.load("./images/grassNoise.png");
grassNoise.wrapS = grassNoise.wrapT = THREE.RepeatWrapping;

// Create material
const grassMat = new THREE.ShaderMaterial({
  uniforms: {
    time:                 {value: 0},
    noiseTexture:         {value: grassNoise},
    directionalDirection: {value: sunlight.position.clone().normalize()},
    directionalColor:     {value: sunlight.color.clone()},
    directionalIntensity: {value: sunlight.intensity},
    ambientColor:         {value: ambientColor},
    ambientIntensity:     {value: ambientIntensity},
  },
  vertexShader: await grassVertexShader.text(),
  fragmentShader: await grassFragmentShader.text(),
  side: THREE.DoubleSide,
});


// Instanced mesh

const BLADE_COUNT = 40000;

const grassInstanced = new THREE.InstancedMesh(grassGeo, grassMat, BLADE_COUNT);
setShadowProperties(grassInstanced, true, true);

// Placing

const blade = new THREE.Object3D();

const POOL_INNER_RADIUS = 122; // How big the pool of water radius is. 
const POOL_OUTER_RADIUS = 162; // How far the grass is placed. 

for(let i = 0; i < BLADE_COUNT; i++) {
  let angle = degToRad(randFloat(0, 360)); // Random angle between 0 and 360. 
  let radius = randInt(POOL_INNER_RADIUS, POOL_OUTER_RADIUS); // Random distance. 

  // soh cah toa
  let x = Math.cos(angle) * radius;
  let z = Math.sin(angle) * radius;
  let y = 20;

  // Position
  blade.position.set(x, y, z);
  
    // Scale
    let scale = 0.3 + randFloat(0, 0.3);
    blade.scale.set(scale, scale, scale);

  // Rotation
  blade.rotation.y = degToRad(randFloat(0, 360)); // Random rotation between 0 and 360. 

  // Update
  blade.updateMatrix();
  grassInstanced.setMatrixAt(i, blade.matrix);
}

scene.add(grassInstanced);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Water >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Water logic from: https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_ocean.html 


// Water plane, argument in Water creation. 
const waterWidth = 256;
const waterHeight = 256;
const waterGeo = new THREE.PlaneGeometry(
  waterWidth, 
  waterHeight, 
);


// Water options

// Water color 
const waterColor = new THREE.Color(0x65B6C7)

// Water normal
// From: https://www.cadhatch.com/seamless-water-textures?pgid=kw6kcyt6-4e83fdc6-6977-414d-8a89-4b9a61db15b4 
const waterNormals = textureLoader.load("./images/waterNormals.jpg");
waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

// Water options, argument in Water creation. 
const waterOptions = {
  textureWidth:    1024,
  textureHeight:   1024,
  alpha:           0.8,
  waterNormals:    waterNormals,
  sunDirection:    sunlight.position.clone().normalize(),
  sunColor:        sunlight.color.clone(), 
  waterColor:      waterColor, 
  distortionScale: 50, 
}


// Water creation
const water = new Water(waterGeo, waterOptions); // Pre-built ShaderMaterial
water.rotateX(degToRad(-90));
water.position.set(0, 16, 0);
water.material.transparent = true;

scene.add(water)



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Cacti >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// MTL
const cactusMat = await mtlLoader.loadAsync("./models/Cactus/cactus.mtl");
cactusMat.preload();

// OBJ
objLoader.setMaterials(cactusMat);
const cactusOBJ = await objLoader.loadAsync("./models/Cactus/cactus.obj");

// Scale
const cactusScale = 6;
cactusOBJ.scale.set(cactusScale, cactusScale, cactusScale);

// Coordinates
const cactusCoordinates = [
  // Row 1 (z: -1800)
  {x: -1863, y: 35, z: -1748},
  {x: -1142, y: 54, z: -1891},
  {x: -672,  y: 25, z: -1823},
  {x: 54,    y: 42, z: -1779},
  {x: 531,   y: 27, z: -1854},
  {x: 1238,  y: 32, z: -1706},
  {x: 1747,  y: 39, z: -1893},

  // Row 2 (z: -1200)
  {x: -1731, y: 32, z: -1147},
  {x: -1294, y: 28, z: -1263},
  {x: -541,  y: 28, z: -1183},
  {x: -87,   y: 43, z: -1298},
  {x: 642,   y: 57, z: -1154},
  {x: 1143,  y: 26, z: -1276},
  {x: 1869,  y: 34, z: -1132},

  // Row 3 (z: -600)
  {x: -1892, y: 30, z: -673},
  {x: -1108, y: 12, z: -541},
  {x: -698,  y: 20, z: -687},
  {x: 13,    y: 18, z: -642},
  {x: 547,   y: 40, z: -714},
  {x: 1261,  y: 23, z: -538},
  {x: 1714,  y: 36, z: -662},

  // Row 4 (z: 0)
  {x: -1753, y: 20, z: -83},
  {x: -1317, y: 9,  z: 94},
  {x: -638,  y: 26, z: -71},
  // Skip oasis
  {x: 583,   y: 42, z: 87},
  {x: 1094,  y: 20, z: -63},
  {x: 1836,  y: 20, z: 79},

  // Row 5 (z: 600)
  {x: -1879, y: 15, z: 531},
  {x: -1126, y: 25, z: 693},
  {x: -563,  y: 12, z: 514},
  {x: 59,    y: 27, z: 582},
  {x: 641,   y: 14, z: 678},
  {x: 1173,  y: 22, z: 547},
  {x: 1748,  y: 42, z: 632},

  // Row 6 (z: 1200)
  {x: -1814, y: 25, z: 1293},
  {x: -1267, y: 30, z: 1138},
  {x: -513,  y: 27, z: 1274},
  {x: 79,    y: 45, z: 1107},
  {x: 558,   y: 34, z: 1289},
  {x: 1302,  y: 35, z: 1154},
  {x: 1731,  y: 37, z: 1247},

  // Row 7 (z: 1800)
  {x: -1708, y: 30, z: 1863},
  {x: -1259, y: 23, z: 1731},
  {x: -547,  y: 26, z: 1894},
  {x: 93,    y: 31, z: 1748},
  {x: 638,   y: 30, z: 1817},
  {x: 1184,  y: 22, z: 1762},
  {x: 1853,  y: 40, z: 1839},
];


// Add
cactusCoordinates.forEach(coord => {
    let cactus = createCactus(coord.x, coord.y, coord.z);
    scene.add(cactus);
  });
  

/**
 * Creates a clone of a tree .obj model and sets the position 
 * to the specified (x, y, z) coordinate. 
 * 
 * @param {number} x The x-position relative to the world. 
 * @param {number} y The y-position relative to the world. 
 * @param {number} z The z-position relative to the world. 
 * @returns A cactus mesh at the desired position. 
 */
function createCactus(x, y, z) {
  let cactus = cactusOBJ.clone();

  cactus.position.set(x, y, z);
  cactus.rotateY(degToRad(randFloat(0, 360)));

  // Shadows
  setShadowProperties(cactus, true, true);
  
  return cactus;
}



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Trees >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Load object
const treeGLTF = await gltfLoader.loadAsync("./models/PalmTree.glb");

// Change material properties
treeGLTF.scene.traverse(function (child) {
  if(child.isMesh) {
    child.material.roughness = 0.8; // Reduce shine
  }
});

// Scale
const treeScale = 12;
treeGLTF.scene.scale.set(treeScale, treeScale, treeScale);

// Coordintaes
const treeCoordinates = [
  {x: 125,  y:18, z:60,   r: 45},
  {x: -140, y:18, z:10,   r: 270},
  {x: 20,   y:18, z:-140, r: 150},
];

// Add
treeCoordinates.forEach(coord => {
  let tree = createTree(coord.x, coord.y, coord.z, coord.r);
  scene.add(tree);
});


/**
 * Creates a clone of a tree .glb model and sets the position 
 * to the specified (x, y, z) coordinate. 
 * A specified y-rotation 'r' is also applied. 
 * 
 * @param {number} x The x-position relative to the world. 
 * @param {number} y The y-position relative to the world. 
 * @param {number} z The z-position relative to the world. 
 * @param {number} r The amount to rotate around the y-axis by (in degrees). 
 * @returns A tree mesh at the desired position and of the desired rotation. 
 */
function createTree(x, y, z, r) {
  let tree = treeGLTF.scene.clone();

  // Position 
  tree.position.set(x, y, z);

  // Rotation 
  tree.rotateY(degToRad(r));

  // Shadows
  setShadowProperties(tree, true, false);

  return tree;
}



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Rocks >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Load object
const rockGLTF = await gltfLoader.loadAsync("./models/Rock.glb");

// Change material properties
rockGLTF.scene.traverse(function (child) {
  if(child.isMesh) {
    child.material.roughness = 0.8; // Reduce shine
  }
});

// Coordinates
const rockCoordinates = [
  {x: 145,  y: 20, z: 5},
  {x: 95,   y: 20, z: -95},
  {x: -45,  y: 20, z: -135},
  {x: -130, y: 20, z: -55},
  {x: -140, y: 20, z: -30},
  {x: -95,  y: 20, z: 100},
  {x: 20,   y: 20, z: 135},
];

// Add
rockCoordinates.forEach(coord => {
  let rock = createRock(coord.x, coord.y, coord.z);
  scene.add(rock);
});


/**
 * Creates a clone of a rock .glb model and sets the position 
 * to the specified (x, y, z) coordinate. 
 * A random y-rotation is also applied, as well as a random scale. 
 * 
 * @param {number} x The x-position relative to the world. 
 * @param {number} y The y-position relative to the world.  
 * @param {number} z The z-position relative to the world. 
 * @returns A rock mesh at the desired position. 
 */
function createRock(x, y, z) {
  let rock = rockGLTF.scene.clone();

  // Position
  rock.position.set(x, y, z);
  
  // Scale
  let minScale = 3;
  let maxScale = 5;
  let rockScale = randFloat(minScale, maxScale);
  rock.scale.set(rockScale, rockScale, rockScale);
  
  // Rotation
  let minRotation = 0;
  let maxRotation = 360;
  let rotation = degToRad(randFloat(minRotation, maxRotation));
  rock.rotateY(rotation);

  // Shadows
  setShadowProperties(rock, true, false);

  return rock;
}



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Flowers >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Load object
const flowerGLTF = await gltfLoader.loadAsync("./models/Flower.glb");

// Change material properties
flowerGLTF.scene.traverse(function (child) {
  if(child.isMesh) {
    child.material.roughness = 0.8; // Reduce shine
  }
});

// Coordinates
const flowerCoordinates = [
  {x: 130,  y: 20, z: -15},
  {x: 140,  y: 20, z: -40},
  {x: 120,  y: 20, z: -60},
  {x: 120,  y: 20, z: -85},
  {x: 100,  y: 20, z: -120},
  {x: 70,   y: 20, z: -110},
  {x: 50,   y: 20, z: -140},

  {x: -10,  y: 20, z: -130},
  {x: -20,  y: 20, z: -150},
  {x: -70,  y: 20, z: -125},
  {x: -95,  y: 20, z: -125},
  {x: -90,  y: 20, z: -100},
  {x: -120,  y: 20, z: -90},
  {x: -110,  y: 20, z: -65},
  {x: -140,  y: 20, z: -70},
  {x: -140,  y: 20, z: -45},
  {x: -125,  y: 20, z: -30},
  {x: -155,  y: 20, z: -10},

  {x: -125,  y: 20, z: 25},
  {x: -140,  y: 20, z: 50},
  {x: -120,  y: 20, z: 60},
  {x: -115,  y: 20, z: 95},
  {x: -80,  y: 20, z: 110},
  {x: -60,  y: 20, z: 135},
  {x: -50,  y: 20, z: 125},
  {x: -10,  y: 20, z: 145},

  {x: 15,  y: 20, z: 155},
  {x: 50,  y: 20, z: 130},
  {x: 100,  y: 20, z: 110},
  {x: 95,  y: 20, z: 90},
  {x: 135,  y: 20, z: 80},
  {x: 125,  y: 20, z: 40},
  {x: 150,  y: 20, z: 20},
];

// Add
flowerCoordinates.forEach(coord => {
  let flower = createFlower(coord.x, coord.y, coord.z);
  scene.add(flower);
});


/**
 * Creates a clone of a flower .glb model and sets the position 
 * to the specified (x, y, z) coordinate. 
 * A random y-rotation is also applied, as well as a random scale. 
 * 
 * @param {number} x The x-position relative to the world. 
 * @param {number} y The y-position relative to the world.  
 * @param {number} z The z-position relative to the world. 
 * @returns A flower mesh at the desired position. 
 */
function createFlower(x, y, z) {
  let flower = flowerGLTF.scene.clone();

  // Position
  flower.position.set(x, y, z);
  
  // Scale
  let minScale = 6;
  let maxScale = 8;
  let flowerScale = randFloat(minScale, maxScale);
  flower.scale.set(flowerScale, flowerScale, flowerScale);
  
  // Rotation
  let minRotation = 0;
  let maxRotation = 360;
  let rotation = degToRad(randFloat(minRotation, maxRotation));
  flower.rotateY(rotation);

  // Shadows
  setShadowProperties(flower, true, false);

  return flower;
}



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Camel >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Load object
const camelGLTF = await gltfLoader.loadAsync("./models/Camel.glb");

// Change material properties
camelGLTF.scene.traverse(function (child) {
  if(child.isMesh) {
    child.material.roughness = 1; // No shine
  }
});

// Position
camelGLTF.scene.position.set(70, 19, 120);

// Scale
const camelScale = 14;
camelGLTF.scene.scale.set(camelScale, camelScale, camelScale);

// Rotation
const camelRotaiton = -110;
camelGLTF.scene.rotation.y = degToRad(camelRotaiton);

// Shadows
setShadowProperties(camelGLTF.scene, true, false);

// Add
scene.add(camelGLTF.scene);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Carpet >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Load object
const carpetGLTF = await gltfLoader.loadAsync("./models/Carpet.glb");

// Change material properties 
carpetGLTF.scene.traverse(function (child) {
  if(child.isMesh) {
    child.material.roughness = 1; // Fully diffuse, no shine
  }
});

// Position
carpetGLTF.scene.position.set(-60, 20, -240);

// Scale
const carpetScale = 16;
carpetGLTF.scene.scale.set(carpetScale, carpetScale, carpetScale);

// Rotation
const carpetRotation = -30;
carpetGLTF.scene.rotation.y = degToRad(carpetRotation);

// Shadows
setShadowProperties(carpetGLTF.scene, true, false);

// Add
scene.add(carpetGLTF.scene);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Tent >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Load object
const tentGLTF = await gltfLoader.loadAsync("./models/Tent.glb");

// Change material properties 
tentGLTF.scene.traverse(function (child) {
  if(child.isMesh) {
    child.material.roughness = 1; // Fully diffuse, no shine
  }
});

// Position
tentGLTF.scene.position.set(-155, 20.1, -155);

// Scale
const tentScale = 10;
tentGLTF.scene.scale.set(tentScale, tentScale, tentScale);

// Rotation
const tentRotation = 30;
tentGLTF.scene.rotation.y = degToRad(tentRotation);

// Shadows
setShadowProperties(tentGLTF.scene, true, false);

// Add
scene.add(tentGLTF.scene);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Campfire Logs >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Logs

// Load object
const logsGLTF = await gltfLoader.loadAsync("./models/CampFire.glb");

// Change material properties 
logsGLTF.scene.traverse(function (child) {
  if(child.isMesh) {
    child.material.roughness = 1; // No shine
  }
});

// Position
logsGLTF.scene.position.set(-18, 19.75, -220);

// Scale
const logsScale = 6;
logsGLTF.scene.scale.set(logsScale, logsScale, logsScale);

// Rotation
const logsRotation = 0;
logsGLTF.scene.rotation.y = degToRad(logsRotation);

// Shadows
setShadowProperties(logsGLTF.scene, true, false);

// Add
scene.add(logsGLTF.scene);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Campfire Point Light >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



const pointLightColor = new THREE.Color(0xD98A29);
const pointLightIntensity = 300;
const pointLightDistance = 0;
const pointLightDecay = 1;
const pointLight = new THREE.PointLight(
  pointLightColor, 
  pointLightIntensity, 
  pointLightDistance, 
  pointLightDecay
);

pointLight.position.set(-20, 40, -220);
pointLight.castShadow = true;
scene.add(pointLight);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 10);
scene.add(pointLightHelper);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Campfire Particles >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Logic from: https://www.youtube.com/watch?v=PUpz0T4L20g, 
//    and: https://github.com/ThaboModise/Live_TutorialScript/blob/master/IntermediateTutorialSeries/ParticleEmitter_For_Tutorial.html
// Texture from: https://www.freeiconspng.com/img/42438 

// Load the fire sprite texture and set its colour space for correct rendering
const fireTexture = textureLoader.load("./images/fireParticle.png");
// fireTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Represents a single fire particle. 
 * Spawns at a random offset within the emitter area, rises upward each frame,
 * rotates, and lerps its colour toward a target over its lifetime.
 */
class CustomParticle extends THREE.Sprite {


  /**
   * @param {THREE.Texture} texture The sprite image to display. 
   * @param {number} color          Initial colour (hex). 
   * @param {number} lerpToColor    Target colour the particle fades towards (hex). 
   * @param {number} alphaTest      Pixels below this alpha value are discarded.
   * @param {number} opacity        Overall opacity of the sprite.
   * @param {number} myRotation     Fixed rotation delta added every frame.
   * @param {number} randomScale    Upper bound for a randomised scale (min 1.0).
   * @param {number} randomRotation Upper bound for an additional randomised rotation delta.
   */
  constructor(texture, color, lerpToColor, alphaTest, opacity, myRotation, randomScale, randomRotation) {

    // Create the sprite material with the provided visual properties. 
    let material = new THREE.SpriteMaterial({
      color: color, 
      map: texture, 
      alphaTest: alphaTest, 
      opacity: opacity, 
      transparent: true
    });

    let scale;
    let rotation = myRotation;
    let randRotation = randomRotation;

    // If no randomScale is provided fall back to a scale of 1, 
    // otherwise pick a random value and clamp it to a minimum of 1. 
    if(randomScale === undefined) {
      scale = 1.0;
    } else {
      let randScale = Math.random() * randomScale;
      scale = randScale > 1.0 ? randScale: 1.0;
    }

    // If randomRotation is provided pick a random rotation delta,
    // clamped to a minimum of 0.01 so the particle always spins slightly
    if (randomRotation !== undefined) {
      randRotation = Math.random() * randomRotation;
      randRotation = randRotation > 0.0 ? randRotation: 0.01;
    }
    
    // Initialize the parent THREE.Sprite with the constructed material. 
    super(material);

    // Position
    this.position.set(randFloatSpread(15), 0, randFloatSpread(15));

    // Time
    this.startTime = timerScene.getElapsed();
    this.currentTime;

    // Scale
    this.scale.set(scale, scale, scale);

    // Rotation
    this.randRotation = randRotation;
    this.myRotation = rotation;

    // Lerp
    this.lerpToColor = lerpToColor;
    
    // Additive blending makes overlapping particles brighten each other, simulating fire glow. 
    // this.material.blending = THREE.AdditiveBlending; // Made the particles not appear, so it's commented out. 
  }


  /**
   * Called every frame by the emitter.
   * Moves the particle upward, applies rotation, and transitions its colour.
   */
  update() {
  
    // Float
    this.position.y += 0.25;

    // Sync
    this.updateMatrix();
    this.updateMatrixWorld();

    // Apply Rotations
    if(this.myRotation !== undefined) this.material.rotation += this.myRotation;
    if(this.randRotation !== undefined) this.material.rotation += this.randRotation;
    
    // Color lerp towards target color
    this.material.color.lerp(new THREE.Color(this.lerpToColor), 0.003);
  }
}


/**
 * Spawns and manages a collection of CustomParticle instances.
 * Call emitParticle() and updateParticles() each frame from the render loop.
 */
class ParticleEmitter {

  // Same as CustomParticle constructor
  constructor(texture, color, lerpToColor, alphaTest, opacity, myRotation, randomScale, randomRotation) {

    // Live particle array
    this.particles = [];

    this.group = new THREE.Group();
    this.timer = 0;
    this.color = color;
    this.lerpToColor = lerpToColor;
    this.texture = texture;
    this.alphaTest = alphaTest;
    this.opacity = opacity;
    this.myRotation = myRotation;
    this.randomScale = randomScale;
    this.randomRotation = randomRotation

    // Add the group to the scene immediately so spawned particles are visible. 
    scene.add(this.group);
  }


  /**
   * Spawns one new particle and adds it to the group and tracking array.
   * Call once per frame from the render loop.
   */
  emitParticle() {
    const particle = new CustomParticle(
      this.texture, 
      this.color, 
      this.lerpToColor, 
      this.alphaTest, 
      this.opacity, 
      this.myRotation, 
      this.randomScale, 
      this.randomRotation
    );

    // Stamp the current time so the particle knows when it was born. 
    particle.currentTime = timerScene.getElapsed();

    this.group.add(particle);
    this.particles.push(particle);
  }


  /**
   * Iterates all live particles each frame.
   * Removes particles that have exceeded their 1-second lifetime, then calls update() on the rest.
   */
  updateParticles() {
    this.particles.forEach((particle) => {
      particle.currentTime = timerScene.getElapsed();
      if((particle.currentTime - particle.startTime) > 1) { // 1 second is the lifetime. 
        this.group.remove(particle);
      }
      
      particle.update();
    });
  }

}


const particleParams = {
  texture : fireTexture,
  color : 0xff0000,
  lerpToColor: 0xaaaa00,
  alphaTest : 0.001,
  opacity : 0.3,
  rotationFactor : undefined,
  scaleFactor : 10, 
  randRotationFactor : 0.003
}

const particleEmitter = new ParticleEmitter(
  particleParams.texture, 
  particleParams.color, 
  particleParams.lerpToColor, 
  particleParams.alphaTest, 
  particleParams.opacity, 
  particleParams.rotationFactor, 
  particleParams.scaleFactor, 
  particleParams.randRotationFactor
);

particleEmitter.group.position.set(-20, 28, -220);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Pyramid >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Load object
const pyramidGLTF = await gltfLoader.loadAsync("./models/Pyramid.glb");

// Change material properties 
pyramidGLTF.scene.traverse(function (child) {
  if(child.isMesh) {
    child.material.roughness = 1; // Fully diffuse, no shine
    child.material.metalness = 0.5;
  }
});

// Shadows
setShadowProperties(pyramidGLTF.scene, true, false);

// Coordinates
const pyramidCoordinates = [
  {x: 1500, y: 10, z: 1500, scale: 2.5, rotation: -30},
  {x: 1700, y: 10, z: 900,  scale: 2,   rotation: -15},
];

// Add
pyramidCoordinates.forEach(coord => {
  let pyramid = createPyramid(coord.x, coord.y, coord.z, coord.scale, coord.rotation);
  scene.add(pyramid);
});


/**
 * Creates a clone of a pyramid .glb model. 
 * Sets the position to the specified (x, y, z) coordinate, 
 * sets the specified scale and rotation. 
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} z 
 * @param {number} scale 
 * @param {number} rotation 
 * @returns A clone of the pyramid model. 
 */
function createPyramid(x, y, z, scale, rotation) {
  let pyramid = pyramidGLTF.scene.clone();

  pyramid.position.set(x, y, z);
  pyramid.scale.set(scale, scale, scale);
  pyramid.rotation.y = degToRad(rotation);

  return pyramid;
}



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Fish >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Load object
const fishGLTF = await gltfLoader.loadAsync("./models/Fish.glb");

// Coordinates
const fishCoordinates = [
  // Top 3x3
  {x: -4, y: 4, z: -8},
  {x: 0,  y: 8, z: -4},
  {x: 4,  y: 4, z: -8},
  {x: -6, y: 4, z: 0},
  {x: 0,  y: 4, z: 0},
  {x: 6,  y: 4, z: 0},
  {x: -4, y: 4, z: 8},
  {x: 0,  y: 8, z: 4},
  {x: 4,  y: 4, z: 8},
  
  // Middle 3x3
  {x: -6, y: 0, z: -6},
  {x: 0,  y: 0, z: -6},
  {x: 6,  y: 0, z: -6},
  {x: -8, y: 0, z: 0},
  // None in middle
  {x: 8,  y: 0, z: 0},
  {x: -6, y: 0, z: 6},
  {x: 0,  y: 0, z: 6},
  {x: 6,  y: 0, z: 6},

  // Bottom 3x3
  {x: -4, y: -4, z: -8},
  {x: 0,  y: -8, z: -4},
  {x: 4,  y: -4, z: -8},
  {x: -6, y: -4, z: 0},
  {x: 0,  y: -4, z: 0},
  {x: 6,  y: -4, z: 0},
  {x: -4, y: -4, z: 8},
  {x: 0,  y: -8, z: 4},
  {x: 4,  y: -4, z: 8},
];

// Add
const school = createSchool();
translateToPerimeter(school);

scene.add(school);


/**
 * Creates a school/group of fish for each coordinate and returns the school. 
 * 
 * @returns A group/school of fish. 
 */
function createSchool() {
  const school = new THREE.Group();

  fishCoordinates.forEach(coord => {
    school.add(createFish(coord.x, coord.y, coord.z));
  });

  return school;
}


/**
 * Clones the fishGLTF and sets its position, and then returns it. 
 * 
 * @param {number} x The x-position relative to the school. 
 * @param {number} y The y-position relative to the school. 
 * @param {number} z The z-position relative to the school. 
 * @returns A clone of fishGLTF. 
 */
function createFish(x, y, z) {
  let fish = fishGLTF.scene.clone();

  let fishScale = 1.5;
  fish.scale.set(fishScale, fishScale, fishScale);

  // Position
  fish.position.set(x, y, z);

  return fish;
}


/**
 * Translates each fish in a school to the perimeter of the water. 
 */
function translateToPerimeter() {
  let xOffset = 55;
  let yOffset = 0;

  school.children.forEach((fish) => {
    let curPos = fish.position;
    fish.position.set(
      curPos.x + xOffset, 
      curPos.y + yOffset, 
      curPos.z);
  });
}


/**
 * Applies a y-rotation to a group. 
 * Children of the group should be offest for the desired effect. 
 * Called in the animate function. 
 * 
 * @param {number} speed The amount to rotate by. 
 */
function rotateSchool(speed) {
  school.rotateY(speed);
}


/**
 * Alters the y-rotation of each individual fish in the school 
 * through a sin function. 
 * Each fish's swim timing is slightly offset. 
 * Inspiration from user Mugen87 at:
 *    https://stackoverflow.com/questions/60074696/how-to-animate-in-oscillation-a-n-surface-in-three-js
 * 
 * @param {number} speed Controls how fast the fish wobble. 
 */
function swim(speed) {
  let rotateClamp = Math.PI / 8
  
  school.children.forEach((fish, index) => {
    let swimmingOffset = index / 10; // So siwmming (wobbling) is not synchronized. 
    fish.rotation.y = Math.sin(speed + swimmingOffset) * rotateClamp;
  });
}



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Shadows Properties >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



/**
 * Used to configure shadow properties of some object. 
 * 
 * @param {object} object The object to apply shadow properties to
 * @param {boolean} cast Does the object cast shadows?
 * @param {boolean} receive Does the object receive shadows?
 */
function setShadowProperties(object, cast, receive) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = cast;
      child.receiveShadow = receive;
    }
  });
}



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Animate >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



const timerScene = new THREE.Timer();
const lightWorldPos = new THREE.Vector3();

function render() {
    
  updateMovement();
  timerScene.update();


  // Determine which light is currently above the scene
  let activeLight;
  sunlight.getWorldPosition(lightWorldPos);

  // Disable light below the plane. 
  if(lightWorldPos.y > 100) {
    activeLight = sunlight;
    sunlight.intensity = sunlightIntensity;
    moonlight.intensity = 0;

    scene.background = daySkybox;
  } else {
    activeLight = moonlight;
    moonlight.intensity = moonlightIntensity;
    sunlight.intensity = 0;

    scene.background = nightSkybox;
  }


  // Update grass shader

  // Update grass uniforms to match the active light
  activeLight.getWorldPosition(lightWorldPos);
  grassMat.uniforms['directionalDirection'].value.copy(lightWorldPos).normalize();
  grassMat.uniforms['directionalColor'].value.copy(activeLight.color);
  grassMat.uniforms['directionalIntensity'].value = activeLight.intensity / 2;


  // Update water uniforms to match the active light
  water.material.uniforms['sunDirection'].value.copy(lightWorldPos).normalize();
  water.material.uniforms['sunColor'].value.copy(activeLight.color);
  

  // Animate shaders
  // From https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_ocean.html
  water.material.uniforms['time'].value += timerScene.getDelta();
  grassMat.uniforms['time'].value += timerScene.getDelta();


  particleEmitter.emitParticle();

  particleEmitter.updateParticles();


  // Fish

  let fishOrbitSpeed = 10;
  rotateSchool(degToRad(-fishOrbitSpeed * timerScene.getDelta()));
  
  let fishSwimSpeed = 20;
  swim(fishSwimSpeed * timerScene.getElapsed());


  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

animate();