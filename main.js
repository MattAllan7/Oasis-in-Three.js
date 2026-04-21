import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { degToRad, randFloat, randInt } from 'three/src/math/MathUtils.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Water } from 'three/addons/objects/Water.js';
import { GUI } from 'dat.gui'



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Loaders >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



const mtlLoader = new MTLLoader();
const objLoader = new OBJLoader();
const gltfLoader = new GLTFLoader();



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Scene >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



const scene = new THREE.Scene();



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Camera >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 200, 200);



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
const sunlightIntensity = 2;
const sunlight = new THREE.DirectionalLight(sunlightColor, sunlightIntensity);
sunlight.position.set(-700, 100, -700);

// Shadows
// From user Drew Noakes: https://stackoverflow.com/questions/10742149/how-to-create-directional-light-shadow-in-three-js
sunlight.castShadow = true;
sunlight.shadow.mapSize.width = 1024;
sunlight.shadow.mapSize.height = 1024;
sunlight.shadow.camera.top = 600;
sunlight.shadow.camera.bottom = -600;
sunlight.shadow.camera.left = -600;
sunlight.shadow.camera.right = 600;
sunlight.shadow.camera.far = 2048;
sunlight.shadow.camera.updateProjectionMatrix();


// Moonlight
const moonlightColor = new THREE.Color(0x707980);
const moonlightIntensity = 2;
const moonlight = new THREE.DirectionalLight(moonlightColor, moonlightIntensity);
moonlight.position.set(700, -100, 700);

// Shadows
// From user Drew Noakes: https://stackoverflow.com/questions/10742149/how-to-create-directional-light-shadow-in-three-js
moonlight.castShadow = true;
moonlight.shadow.mapSize.width = 1024;
moonlight.shadow.mapSize.height = 1024;
moonlight.shadow.camera.top = 600;
moonlight.shadow.camera.bottom = -600;
moonlight.shadow.camera.left = -600;
moonlight.shadow.camera.right = 600;
moonlight.shadow.camera.far = 2048;
moonlight.shadow.camera.updateProjectionMatrix();


// Ambient light
const ambientColor = new THREE.Color(0xFFFFFF);
const ambientIntensity = 0.1;
const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);

scene.add(ambientLight);


// Directional light group
const directionalGroup = new THREE.Group();
directionalGroup.add(sunlight, moonlight);

scene.add(directionalGroup);


// Directional helpers
const sunlightHelper = new THREE.DirectionalLightHelper(sunlight, 50);
const moonlightHelper = new THREE.DirectionalLightHelper(moonlight, 50);
scene.add(sunlightHelper, moonlightHelper);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< GUI >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// https://sbcode.net/threejs/dat-gui-module/


const gui = new GUI();

const lightFolder = gui.addFolder('Light');
lightFolder.add(directionalGroup.rotation, 'x', 0, Math.PI * 2, 0.01);
lightFolder.open();



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Sand >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



const textureLoader = new THREE.TextureLoader();

// Height map logic from: https://www.youtube.com/watch?v=wULUAhckH9w. 
// Height map image from: https://www.deviantart.com/elmininostock/art/Sand-Dunes-Height-Map-seamless-591456783. 
// Sand texture from: https://texturelabs.org/textures/soil_126/. 


// Sand geometry
const sandPlaneWidth = 1024;
const sandPlaneHeight = 1024;
const sandPlaneWidthSeg = 128; 
const sandPlaneHeightSeg = 128;
const sandGeo = new THREE.PlaneGeometry(
  sandPlaneWidth, 
  sandPlaneHeight, 
  sandPlaneWidthSeg, 
  sandPlaneHeightSeg,
);


// Ground material
const sandColor = new THREE.Color(0xDED8C5); // Mixed with directional light for final color. 

// Map
const sandTexture = textureLoader.load("./images/sandTexture.png");
sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
sandTexture.repeat.set(64, 64);
sandTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

// Displacement
const sandDisplacementMap = textureLoader.load("./images/sandHeightMap.png");
const sandDisplacementScale = 80;

// Normal
const sandNormalMap = textureLoader.load("./images/sandNormalMap.jpg");

// Create material
const sandMat = new THREE.MeshStandardMaterial({
  color: sandColor, 
  map: sandTexture,
  displacementMap: sandDisplacementMap, 
  displacementScale: sandDisplacementScale,
  normalMap: sandNormalMap,
  side: THREE.DoubleSide,
});


// Sand mesh
const sandMesh = new THREE.Mesh(sandGeo, sandMat);
sandMesh.position.set(0, 0, 0);
sandMesh.rotateX(degToRad(-90));
setShadowProperties(sandMesh, false, true);

scene.add(sandMesh);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Grass Terrain >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Texture from: https://www.poliigon.com/texture/flat-grass-texture/4585

// GLTF
const grassTerrainGLTF = await gltfLoader.loadAsync("models/grassTerrain/grassTerrain.glb");
const grassTerrainScale = 52;
grassTerrainGLTF.scene.scale.set(grassTerrainScale, grassTerrainScale, grassTerrainScale);
grassTerrainGLTF.scene.position.set(0, 10, 0);


// Material

// Color
const grassTerrainColor = new THREE.Color(0xB1D18C); 

// Map
const grassColorMap = textureLoader.load("models/grassTerrain/color.jpg");
grassColorMap.wrapS = grassColorMap.wrapT = THREE.RepeatWrapping;
grassColorMap.repeat.set(16, 16);
grassColorMap.anisotropy = renderer.capabilities.getMaxAnisotropy();

// Normal
const grassNormalMap = textureLoader.load("models/grassTerrain/normal.png")

// Displacement
const grassDisplacementMap = textureLoader.load("models/grassTerrain/displacement.tiff");

// Create material
const grassTerrainMat = new THREE.MeshStandardMaterial({
  map: grassColorMap, 
  color: grassTerrainColor,
  normalMap: grassNormalMap, 
  displacementMap: grassDisplacementMap,
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

const vertices = new Float32Array([
  0, 8, 0, // top
  -1, 0, 0, // left
  1, 0, 0, // right
]);
grassGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));


// Shader material
// From: https://github.com/bobbyroe/getting-started-shaders

// Get shaders
const grassVertexShader = await fetch("shaders/grass.vert");
const grassFragmentShader = await fetch("shaders/grass.frag");

// For the fragment shader for varying colors 
// From: https://blog.mbedded.ninja/mathematics/perlin-noise/
const grassNoise = textureLoader.load("images/grassNoise.png");
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

const POOL_INNER_RADIUS = 73; // How big the pool of water radius is. 
const POOL_OUTER_RADIUS = 113; // How far the grass is placed. 

for(let i = 0; i < BLADE_COUNT; i++) {
  let angle = degToRad(randFloat(0, 360)); // Random angle between 0 and 360. 
  let radius = randInt(POOL_INNER_RADIUS, POOL_OUTER_RADIUS); // Random distance. 

  // soh cah toa
  let x = Math.cos(angle) * radius;
  let z = Math.sin(angle) * radius;
  let y = 20;

  // Position
  blade.position.set(x, y, z);

  // Rotation
  blade.rotation.y = degToRad(randFloat(0, 360)); // Random rotation between 0 and 360. 

  // Scale
  let scale = 0.3 + randFloat(0, 0.3);
  blade.scale.set(scale, scale, scale);

  // Update
  blade.updateMatrix();
  grassInstanced.setMatrixAt(i, blade.matrix);
}

scene.add(grassInstanced);



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Water >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



// Water logic from: https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_ocean.html 


// Water plane, argument in Water creation. 
const waterWidth = 128;
const waterHeight = 128;
const waterGeo = new THREE.PlaneGeometry(
  waterWidth, 
  waterHeight, 
);


// Water options

// Water color 
const waterColor = new THREE.Color(0x65B6C7)

// Water normal, more realistic considering a tiny pool of water. 
// From: https://www.cadhatch.com/seamless-water-textures?pgid=kw6kcyt6-4e83fdc6-6977-414d-8a89-4b9a61db15b4 
const waterNormalsSubtle = textureLoader.load("images/waterNormalsSubtle.jpg")
waterNormalsSubtle.wrapS = waterNormalsSubtle.wrapT = THREE.RepeatWrapping;

// Water normal, easier to tell the water is animated. 
// From: https://www.cadhatch.com/seamless-water-textures?pgid=kw6kmspc-d364e7a4-2d00-4695-b17e-294a258292e0
const waterNormalsOther = textureLoader.load("images/waterNormalsOther.jpg")
waterNormalsOther.wrapS = waterNormalsOther.wrapT = THREE.RepeatWrapping;

// Water options, argument in Water creation. 
const waterOptions = {
  textureWidth:    1024,
  textureHeight:   1024,
  alpha:           0.8,
  waterNormals:    waterNormalsSubtle, // Can use <waterNormalsSubtle> or <waterNormalsOther> here
  sunDirection:    sunlight.clone().position.normalize(),
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
const cactusMat = await mtlLoader.loadAsync("models/cactus/cactus.mtl");
cactusMat.preload();

// OBJ
objLoader.setMaterials(cactusMat);
const cactusOBJ = await objLoader.loadAsync("models/cactus/cactus.obj");
cactusOBJ.scale.set(2, 2, 2);

// Coordinates
const cactusCoordinates = [
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



const treeGLTF = await gltfLoader.loadAsync("models/palmTree.glb");
treeGLTF.scene.scale.set(4, 4, 4);

const treeCoordinates = [
  {x: 60, y:18, z:60, r: 45},
  {x: -80, y:18, z:10, r: 270},
  {x: 20, y:18, z:-80, r: 150},
];

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



const rockGLTF = await gltfLoader.loadAsync("models/rock.glb");

const rockCoordinates = [
  {x: 85, y: 20, z: 25},
  {x: 65, y: 20, z: -55},
  {x: -25, y: 20, z: -85},
  {x: -80, y: 20, z: -40},
  {x: -95, y: 20, z: -10},
  {x: -55, y: 20, z: 70},
  {x: 20, y: 20, z: 95},
];

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

  // Rotation
  let minRotation = 0;
  let maxRotation = 360;
  let rotation = degToRad(randFloat(minRotation, maxRotation));
  rock.rotateY(rotation);

  // Scale
  let minScale = 4;
  let maxScale = 5;
  let rockScale = randFloat(minScale, maxScale);
  rock.scale.set(rockScale, rockScale, rockScale);

  // Shadows
  setShadowProperties(rock, true, false);

  return rock;
}



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Fish >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



const fishCoordinates = [
  // Top 3x3
  {x: -2, y: 2, z: -4},
  {x: 0, y: 4, z: -2},
  {x: 2, y: 2, z: -4},
  {x: -3, y: 2, z: 0},
  {x: 0, y: 2, z: 0},
  {x: 3, y: 2, z: 0},
  {x: -2, y: 2, z: 4},
  {x: 0, y: 4, z: 2},
  {x: 2, y: 2, z: 4},
  
  // Middle 3x3
  {x: -3, y: 0, z: -3},
  {x: 0, y: 0, z: -6},
  {x: 3, y: 0, z: -3},
  {x: -4, y: 0, z: 0},
  // {x: 0, y: 0, z: 0},
  {x: 4, y: 0, z: 0},
  {x: -3, y: 0, z: 3},
  {x: 0, y: 0, z: 6},
  {x: 3, y: 0, z: 3},

  // Bottom 3x3
  {x: -2, y: -2, z: -4},
  {x: 0, y: -4, z: -2},
  {x: 2, y: -2, z: -4},
  {x: -3, y: -2, z: 0},
  {x: 0, y: -2, z: 0},
  {x: 3, y: -2, z: 0},
  {x: -2, y: -2, z: 4},
  {x: 0, y: -4, z: 2},
  {x: 2, y: -2, z: 4},
];

const school = createSchool();
translateToPerimeter(school);

scene.add(school);


/**
 * Defines fish a geometry and material, 
 * and calls createFish() for each entry in fishPositions. 
 * 
 * @returns A group/school of fish. 
 */
function createSchool() {
  const school = new THREE.Group();

  const fishGeo = new THREE.BoxGeometry(1, 1, 2);

  const fishMatColor = new THREE.Color(0xD68142);
  const fishMat = new THREE.MeshStandardMaterial(fishMatColor);

  fishCoordinates.forEach(coord => {
    school.add(createFish(fishGeo, fishMat, coord.x, coord.y, coord.z));
  });

  return school;
}


/**
 * Creates a mesh from a geometry and material and sets the mesh's position 
 * to the specified (x, y, z) coordinate. 
 * 
 * @param {THREE.BoxGeometry} geometry Fish geometry. 
 * @param {THREE.MeshStandardMaterial} material Fish material. 
 * @param {number} x The x-position relative to the school. 
 * @param {number} y The y-position relative to the school. 
 * @param {number} z The z-position relative to the school. 
 * @returns A fish mesh at the desired position. 
 */
function createFish(geometry, material, x, y, z) {
  let fishMesh = new THREE.Mesh(geometry, material);

  // Position
  fishMesh.position.set(x, y, z);

  return fishMesh;
}


/**
 * Translates each fish in a school to the perimeter of the water. 
 */
function translateToPerimeter() {
  let xOffset = 35;
  let yOffset = 8;

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



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Shadows >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



function setShadowProperties(object, cast, receive) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = cast;
      child.receiveShadow = receive;
    }
  });
}



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Animate >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



const timer = new THREE.Timer();
const lightWorldPos = new THREE.Vector3();

function render() {
    
  orbitControls.update(); // Temporary
  timer.update();


  // Determine which light is currently above the scene
  sunlight.getWorldPosition(lightWorldPos);
  const activeLight = lightWorldPos.y > 0 ? sunlight : moonlight;


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
  water.material.uniforms['time'].value += timer.getDelta();
  grassMat.uniforms['time'].value += timer.getDelta();


  // Fish

  let fishOrbitSpeed = 10;
  rotateSchool(degToRad(fishOrbitSpeed * timer.getDelta()));
  
  let fishSwimSpeed = 20;
  swim(fishSwimSpeed * timer.getElapsed());


  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

animate();