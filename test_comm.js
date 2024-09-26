// Function to display messages in the HTML
function displayMessage(message) {
    const messageElement = document.getElementById('message');
    messageElement.innerText += message + '\n'; // Append the new message
}

const decalstest = [];

// Function that JavaScript will listen for from Flutter
function receiveMessageFromFlutter(message) {
    console.log('Received message from Flutter:', message);
    displayMessage('Received message from Flutter: ' + message);
    try {
        // Parse the decals data received from Flutter
        const decalsFromFlutter = JSON.parse(message);
        displayMessage('format: ' + decalsFromFlutter);

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
            decalstest.push({
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

// Sends a message to Flutter via FlutterChannel
function sendMessageToFlutter() {
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

    if (typeof FlutterChannel !== 'undefined') {
         FlutterChannel.postMessage(JSON.stringify(decalsData));
        displayMessage('Message sent to Flutter: Hello from JavaScript!');
    } else {
        displayMessage('Error: FlutterChannel is not defined.');
    }
}