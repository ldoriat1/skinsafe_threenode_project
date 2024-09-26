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
    current: 1,
    rotate: true,
    select: false,
    clear: function () {
        removeDecals();
    }
};


// Initialize scene and everything else
let controls;
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
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 50;
    controls.maxDistance = 200;


    // Add event listener to detect changes (dragging)
    controls.addEventListener('change', function () {
        if (selectedDecal) {
            // Reset the decal's color to its original color when dragging
            selectedDecal.mesh.material.color.copy(selectedDecal.originalColor);
            selectedDecal = null; // Clear the selected decal
        }
    });

    // Lighting setup
    scene.background = new THREE.Color(0xffffff); // White background
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
    // gui.add(params, 'minScale', 1, 30);
    // gui.add(params, 'maxScale', 1, 30);
    gui.add(params, 'current', 0.5, 2);
    gui.add(params, 'select');
    // gui.add(params, 'rotate');
    gui.add(params, 'clear');
    gui.open();
}

function loadLeePerrySmith() {
    //const map = textureLoader.load('./models/head/Map-COL.jpg');
    //map.colorSpace = THREE.SRGBColorSpace;
    //const specularMap = textureLoader.load('./models/head/Map-SPEC.jpg');
    //const normalMap = textureLoader.load('./models/head/Infinite-Level_02_Tangent_SmoothUV.jpg');

    const loader = new GLTFLoader();

    loader.load('./models/Male_Body.glb', function (gltf) {
        mesh = gltf.scene.children[0];
        mesh.material = new THREE.MeshPhongMaterial({
            specular: 0x111111,
            // map: map,
            // specularMap: specularMap,
            // normalMap: normalMap,
            shininess: 25
        });

        scene.add(mesh);
        mesh.scale.set(45, 45, 45);
        mesh.position.set(0, -45, 0);
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

    const decalMesh = new THREE.Mesh(new DecalGeometry(mesh, position, orientation, size), material);
    decalMesh.renderOrder = decals.length; // give decals a fixed render order

    // Store the decal with a name and original color
    const decalName = `Decal_${decals.length + 1}`; // Create a unique name for each decal
    const decal = { name: decalName, mesh: decalMesh, originalColor: material.color.clone() };
    decals.push(decal);

    // Add the decal to the scene
    scene.add(decalMesh);

    // Add the decal to the list in the UI
    addDecalToList(decal);
}

// Function to add the decal to the HTML list
// Function to add the decal to the HTML list
function addDecalToList(decal) {
    const decalList = document.getElementById('decal-list');
    const listItem = document.createElement('li');
    listItem.textContent = decal.name; // Use the decal's name
    listItem.style.cursor = 'pointer';
    listItem.style.padding = '5px';
    listItem.style.borderBottom = '1px solid #ccc';

    // Add click event to select the decal and change its color to red
    listItem.addEventListener('click', () => {
        // Reset the color of the previously selected decal (if any)
        if (selectedDecal) {
            selectedDecal.mesh.material.color.copy(selectedDecal.originalColor);
        }

        // Set the new selected decal and change its color to red
        selectedDecal = decal;
        decal.mesh.material.color.set(0xff0000); // Set the decal color to red
    });

    decalList.appendChild(listItem);
}

let selectedDecal = null; // Track the currently selected decal

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
        if (intersection.intersects && params.select) {
            shoot();
        } else if (!params.select) {
            // Raycast to check if any decal was clicked
            raycaster.setFromCamera(mouse, camera);
            const decalIntersects = raycaster.intersectObjects(decals.map(d => d.mesh), true);
            if (decalIntersects.length > 0) {
                const clickedDecal = decals.find(d => d.mesh === decalIntersects[0].object);
                if (clickedDecal) {
                    if (selectedDecal && selectedDecal !== clickedDecal) {
                        selectedDecal.mesh.material.color.copy(selectedDecal.originalColor);
                    }

                    // animateCameraToDecal(clickedDecal);
                    clickedDecal.mesh.material.color.set(0xff0000); // Change color to red temporarily
                    selectedDecal = clickedDecal;
                }
            }
        }
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

// Function to display messages in the HTML
function displayMessage(message) {
    const messageElement = document.getElementById('message');
    messageElement.innerText += message + '\n'; // Append the new message
}

// Function that JavaScript will listen for from Flutter to receive decals
function receiveMessageFromFlutter(message) {
    try {
        // Parse the decals data received from Flutter
        const decalsFromFlutter = JSON.parse(message);

        decalsFromFlutter.forEach(decal => {
            const position = new THREE.Vector3(decal.position.x, decal.position.y, decal.position.z);
            const orientation = new THREE.Euler(decal.orientation.x, decal.orientation.y, decal.orientation.z);
            const size = new THREE.Vector3(decal.size.width, decal.size.height, decal.size.depth);

            const material = new THREE.MeshPhongMaterial({
                color: 0x000000, // All decals from Flutter are black
                specular: 0x444444,
                shininess: 30,
                transparent: true,
                depthTest: true,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: -4,
                wireframe: false
            });

            const decalMesh = new THREE.Mesh(new THREE.DecalGeometry(mesh, position, orientation, size), material);
            scene.add(decalMesh);

            // Store the newly added decal in the global array
            decals.push({
                mesh: decalMesh,
                position: position,
                orientation: orientation,
                size: size,
                color: 0x000000 // Decal color set to black
            });
        });

        displayMessage('Decals received and added to the scene from Flutter.');

    } catch (error) {
        console.error('Error processing decals from Flutter:', error);
        displayMessage('Error processing decals from Flutter: ' + error);
    }
}

// Function to send all decals to Flutter as JSON
function sendAllDecalsToFlutter() {
    // Prepare the decals data to send to Flutter
    const decalsData = decals.map(decal => ({
        position: {
            x: decal.mesh.position.x,
            y: decal.mesh.position.y,
            z: decal.mesh.position.z
        },
        orientation: {
            x: decal.mesh.rotation.x,
            y: decal.mesh.rotation.y,
            z: decal.mesh.rotation.z
        },
        size: {
            width: decal.mesh.scale.x,
            height: decal.mesh.scale.y,
            depth: decal.mesh.scale.z
        },
        color: 0x000000 // Black color for all decals
    }));

    // Ensure that DecalChannel exists and send the decals data to Flutter
    if (typeof FlutterChannel !== 'undefined') {
        FlutterChannel.postMessage(JSON.stringify(decalsData));
        displayMessage('All decals sent to Flutter.');
    } else {
        console.error('Error: FlutterChannel is not defined.');
        displayMessage('Error: FlutterChannel is not defined.');
    }
}