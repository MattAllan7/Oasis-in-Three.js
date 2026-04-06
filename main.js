import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Scene >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const scene = new THREE.Scene();

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Camera >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 0, 10, 0 );

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Renderer >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement );

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Camera Controls >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

// Temporary orbit controls. 
const orbitControls = new OrbitControls( camera, renderer.domElement );

/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Light >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */



/* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

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