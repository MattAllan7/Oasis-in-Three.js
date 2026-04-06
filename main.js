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
const sunlightIntensity = 1;
let sunlight = new THREE.DirectionalLight(sunlightColor, sunlightIntensity);
sunlight.position.set(100, 100, 100);
sunlight.lookAt(0, 0, 0);
scene.add(sunlight);

const ambientColor = new THREE.Color(0xffffff);
const ambientIntensity = 0.1;
const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
// scene.add(ambientLight);

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Ground >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const textureLoader = new THREE.TextureLoader();

// Height map logic from: https://www.youtube.com/watch?v=wULUAhckH9w. 
// Height map image from: https://www.deviantart.com/elmininostock/art/Sand-Dunes-Height-Map-seamless-591456783 

// Ground geometry
const groundWidth = 4096;
const groundHeight = 4096;
const groundWidthSeg = 256; 
const groundHeightSeg = 256;
const groundGeo = new THREE.PlaneGeometry(
  groundWidth, 
  groundHeight, 
  groundWidthSeg, 
  groundHeightSeg
);

// Ground material
let heightMap = textureLoader.load("./images/heightMap.png");

const groundMat = new THREE.MeshStandardMaterial({
  color: 0xffcc00, 
  wireframe: true, 
  displacementMap: heightMap, 
  displacementScale: 400,
});

// Ground mesh
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
groundMesh.position.set(0, 0, 0);
groundMesh.rotateX(degToRad(-90));

scene.add(groundMesh);

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< temp >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const geo = new THREE.BoxGeometry(1, 1, 1);
const mat = new THREE.MeshBasicMaterial(0xffffff);
const mesh = new THREE.Mesh(geo, mat);
mesh.position.set(0, 0, 0);
scene.add(mesh);

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