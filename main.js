import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { degToRad } from 'three/src/math/MathUtils.js';

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Scene >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const scene = new THREE.Scene();

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Camera >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
camera.position.set( 0, 500, 0 );

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Renderer >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement );

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Camera Controls >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

// Temporary orbit controls. 
const orbitControls = new OrbitControls( camera, renderer.domElement );

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Light >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const sunlightColor = new THREE.Color(0xffffff);
const sunlightIntensity = 4;
let sunlight = new THREE.DirectionalLight(sunlightColor, sunlightIntensity);
sunlight.position.set(2000, 800, 0);
scene.add(sunlight);
// const sunlightHelper = new THREE.DirectionalLightHelper(sunlight, 50);
// scene.add(sunlightHelper);

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
const groundColor = new THREE.Color(0xBDA264);

let sandTexture = textureLoader.load("./images/sandTexture.png");
sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
sandTexture.repeat.set(8, 8);
sandTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

let displacementMap = textureLoader.load("./images/heightMap.png");
const displacementScale = 80;

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
groundMesh.rotateX(degToRad(-90));

scene.add(groundMesh);

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