// import * as THREE from 'three';

// import Stats from 'three/addons/libs/stats.module.js';
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

// const container = document.getElementById('container');

// let renderer, scene, camera, stats;
// let mesh;
// let raycaster;
// let line;

// const intersection = {
//     intersects: false,
//     point: new THREE.Vector3(),
//     normal: new THREE.Vector3()
// };
// const mouse = new THREE.Vector2();
// const intersects = [];

// const textureLoader = new THREE.TextureLoader();
// const decalDiffuse = textureLoader.load('./models/textures/decal-diffuse.png');
// decalDiffuse.colorSpace = THREE.SRGBColorSpace;
// const decalNormal = textureLoader.load('./models/textures/decal-normal.jpg');

// const decalMaterial = new THREE.MeshPhongMaterial({
//     specular: 0x444444,
//     map: decalDiffuse,
//     normalMap: decalNormal,
//     normalScale: new THREE.Vector2(1, 1),
//     shininess: 30,
//     transparent: true,
//     depthTest: true,
//     depthWrite: false,
//     polygonOffset: true,
//     polygonOffsetFactor: - 4,
//     wireframe: false
// });

// const decals = [];
// let mouseHelper;
// const position = new THREE.Vector3();
// const orientation = new THREE.Euler();
// const size = new THREE.Vector3(10, 10, 10);

// const params = {
//     minScale: 10,
//     maxScale: 20,
//     rotate: true,
//     clear: function () {

//         removeDecals();

//     }
// };

// init();

// function init() {

//     renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setPixelRatio(window.devicePixelRatio);
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setAnimationLoop(animate);
//     container.appendChild(renderer.domElement);

//     stats = new Stats();
//     container.appendChild(stats.dom);

//     scene = new THREE.Scene();

//     camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
//     camera.position.z = 120;

//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.minDistance = 50;
//     controls.maxDistance = 200;

//     scene.add(new THREE.AmbientLight(0x666666));

//     const dirLight1 = new THREE.DirectionalLight(0xffddcc, 3);
//     dirLight1.position.set(1, 0.75, 0.5);
//     scene.add(dirLight1);

//     const dirLight2 = new THREE.DirectionalLight(0xccccff, 3);
//     dirLight2.position.set(- 1, 0.75, - 0.5);
//     scene.add(dirLight2);

//     const geometry = new THREE.BufferGeometry();
//     geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);

//     line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
//     scene.add(line);

//     loadLeePerrySmith();

//     raycaster = new THREE.Raycaster();

//     mouseHelper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 10), new THREE.MeshNormalMaterial());
//     mouseHelper.visible = false;
//     scene.add(mouseHelper);

//     window.addEventListener('resize', onWindowResize);

//     let moved = false;

//     controls.addEventListener('change', function () {

//         moved = true;

//     });

//     window.addEventListener('pointerdown', function () {

//         moved = false;

//     });

//     window.addEventListener('pointerup', function (event) {

//         if (moved === false) {

//             checkIntersection(event.clientX, event.clientY);

//             if (intersection.intersects) shoot();

//         }

//     });

//     window.addEventListener('pointermove', onPointerMove);

//     function onPointerMove(event) {

//         if (event.isPrimary) {

//             checkIntersection(event.clientX, event.clientY);

//         }

//     }

//     function checkIntersection(x, y) {

//         if (mesh === undefined) return;

//         mouse.x = (x / window.innerWidth) * 2 - 1;
//         mouse.y = - (y / window.innerHeight) * 2 + 1;

//         raycaster.setFromCamera(mouse, camera);
//         raycaster.intersectObject(mesh, false, intersects);

//         if (intersects.length > 0) {

//             const p = intersects[0].point;
//             mouseHelper.position.copy(p);
//             intersection.point.copy(p);

//             const n = intersects[0].face.normal.clone();
//             n.transformDirection(mesh.matrixWorld);
//             n.multiplyScalar(10);
//             n.add(intersects[0].point);

//             intersection.normal.copy(intersects[0].face.normal);
//             mouseHelper.lookAt(n);

//             const positions = line.geometry.attributes.position;
//             positions.setXYZ(0, p.x, p.y, p.z);
//             positions.setXYZ(1, n.x, n.y, n.z);
//             positions.needsUpdate = true;

//             intersection.intersects = true;

//             intersects.length = 0;

//         } else {

//             intersection.intersects = false;

//         }

//     }

//     const gui = new GUI();

//     gui.add(params, 'minScale', 1, 30);
//     gui.add(params, 'maxScale', 1, 30);
//     gui.add(params, 'rotate');
//     gui.add(params, 'clear');
//     gui.open();

// }

// function loadLeePerrySmith() {

//     const map = textureLoader.load('./models/head/Map-COL.jpg');
//     map.colorSpace = THREE.SRGBColorSpace;
//     const specularMap = textureLoader.load('./models/head/Map-SPEC.jpg');
//     const normalMap = textureLoader.load('./models/head/Infinite-Level_02_Tangent_SmoothUV.jpg');

//     const loader = new GLTFLoader();

//     loader.load('./models/head/LeePerrySmith.glb', function (gltf) {

//         mesh = gltf.scene.children[0];
//         mesh.material = new THREE.MeshPhongMaterial({
//             specular: 0x111111,
//             map: map,
//             specularMap: specularMap,
//             normalMap: normalMap,
//             shininess: 25
//         });

//         scene.add(mesh);
//         mesh.scale.set(10, 10, 10);

//     });

// }

// function shoot() {

//     position.copy(intersection.point);
//     orientation.copy(mouseHelper.rotation);

//     if (params.rotate) orientation.z = Math.random() * 2 * Math.PI;

//     const scale = params.minScale + Math.random() * (params.maxScale - params.minScale);
//     size.set(scale, scale, scale);

//     const material = decalMaterial.clone();
//     material.color.setHex(Math.random() * 0xffffff);

//     const m = new THREE.Mesh(new DecalGeometry(mesh, position, orientation, size), material);
//     m.renderOrder = decals.length; // give decals a fixed render order

//     decals.push(m);
//     scene.add(m);

// }

// function removeDecals() {

//     decals.forEach(function (d) {

//         scene.remove(d);

//     });

//     decals.length = 0;

// }

// function onWindowResize() {

//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();

//     renderer.setSize(window.innerWidth, window.innerHeight);

// }

// function animate() {

//     renderer.render(scene, camera);

//     stats.update();

// }
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

// Setting up the container
const container = document.getElementById('container');

// Initialize renderer, scene, camera, and stats
let renderer, scene, camera, stats;
let mesh;
let raycaster;
let line;

// Define intersection object and tracking variables
const intersection = {
    intersects: false,
    point: new THREE.Vector3(),
    normal: new THREE.Vector3()
};
const mouse = new THREE.Vector2();
const intersects = [];

// Load textures for decals
const textureLoader = new THREE.TextureLoader();
const decalDiffuse = textureLoader.load('./models/textures/dot-diffuse.png');
decalDiffuse.colorSpace = THREE.SRGBColorSpace;
// const decalNormal = textureLoader.load('./models/textures/decal-normal.jpg');

// Material used for decals
const decalMaterial = new THREE.MeshPhongMaterial({
    specular: 0x444444,
    map: decalDiffuse,
    // normalMap: decalNormal,
    normalScale: new THREE.Vector2(1, 1),
    shininess: 30,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    wireframe: false
});

// Setup decal-related variables
const decals = [];
let mouseHelper;
const position = new THREE.Vector3();
const orientation = new THREE.Euler();
const size = new THREE.Vector3(10, 10, 10);

// GUI parameters for decal manipulation
const params = {
    // minScale: 2,
    // maxScale: 10,
    current: 5,
    rotate: true,
    clear: function () {
        removeDecals();
    }
};

// Initialize scene and everything else
init();

function init() {
    // Initialize renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    container.appendChild(renderer.domElement);

    // Stats (FPS counter)
    stats = new Stats();
    container.appendChild(stats.dom);

    // Create scene and camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 120;

    // OrbitControls for navigation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 50;
    controls.maxDistance = 200;

    // Lighting setup
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.5); // Key light for soft shading
    dirLight1.position.set(1, 0.75, 0.5);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3); // Fill light for more natural lighting
    dirLight2.position.set(-1, 0.75, -0.5);
    scene.add(dirLight2);


    // Create line to show intersection normal
    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
    scene.add(line);

    // Load Lee Perry Smith Model
    loadLeePerrySmith();

    // Raycaster for intersection detection
    raycaster = new THREE.Raycaster();

    // Mouse helper to visualize intersections
    mouseHelper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 10), new THREE.MeshNormalMaterial());
    mouseHelper.visible = false;
    scene.add(mouseHelper);

    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);

    // GUI setup for decal parameters
    const gui = new GUI();
    gui.add(params, 'minScale', 1, 30);
    gui.add(params, 'maxScale', 1, 30);
    gui.add(params, 'rotate');
    gui.add(params, 'clear');
    gui.open();
}

function loadLeePerrySmith() {
    const map = textureLoader.load('./models/head/Map-COL.jpg');
    map.colorSpace = THREE.SRGBColorSpace;
    const specularMap = textureLoader.load('./models/head/Map-SPEC.jpg');
    const normalMap = textureLoader.load('./models/head/Infinite-Level_02_Tangent_SmoothUV.jpg');

    const loader = new GLTFLoader();

    loader.load('./models/head/LeePerrySmith.glb', function (gltf) {
        mesh = gltf.scene.children[0];
        mesh.material = new THREE.MeshPhongMaterial({
            specular: 0x111111,
            map: map,
            specularMap: specularMap,
            normalMap: normalMap,
            shininess: 25
        });

        scene.add(mesh);
        mesh.scale.set(10, 10, 10);
    });
}

// Function to shoot decals at intersection points
function shoot() {
    position.copy(intersection.point);
    orientation.copy(mouseHelper.rotation);

    if (params.rotate) orientation.z = Math.random() * 2 * Math.PI;

    const scale = params.current; //params.minScale + Math.random() * (params.maxScale - params.minScale);
    size.set(scale, scale, scale);

    const material = decalMaterial.clone();
    material.color.setHex(Math.random()); // * 0xffffff);

    const m = new THREE.Mesh(new DecalGeometry(mesh, position, orientation, size), material);
    m.renderOrder = decals.length; // give decals a fixed render order

    decals.push(m);
    scene.add(m);
}

// Function to remove all decals
function removeDecals() {
    decals.forEach(function (d) {
        scene.remove(d);
    });
    decals.length = 0;
}

// Resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Function to check for intersections
function checkIntersection(x, y) {
    if (mesh === undefined) return;

    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = - (y / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    raycaster.intersectObject(mesh, false, intersects);

    if (intersects.length > 0) {
        const p = intersects[0].point;
        mouseHelper.position.copy(p);
        intersection.point.copy(p);

        const n = intersects[0].face.normal.clone();
        n.transformDirection(mesh.matrixWorld);
        n.multiplyScalar(10);
        n.add(intersects[0].point);

        intersection.normal.copy(intersects[0].face.normal);
        mouseHelper.lookAt(n);

        const positions = line.geometry.attributes.position;
        positions.setXYZ(0, p.x, p.y, p.z);
        positions.setXYZ(1, n.x, n.y, n.z);
        positions.needsUpdate = true;

        intersection.intersects = true;
        intersects.length = 0;
    } else {
        intersection.intersects = false;
    }
}

// Event handlers
let moved = false;

function onPointerDown() {
    moved = false;
}

function onPointerUp(event) {
    if (moved === false) {
        checkIntersection(event.clientX, event.clientY);
        if (intersection.intersects) shoot();
    }
}

function onPointerMove(event) {
    if (event.isPrimary) {
        checkIntersection(event.clientX, event.clientY);
    }
}

// Main animation loop
function animate() {
    renderer.render(scene, camera);
    stats.update();
}