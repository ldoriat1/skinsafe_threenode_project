// Function to display messages in the HTML
function displayMessage(message) {
    const messageElement = document.getElementById('message');
    messageElement.innerText += message + '\n'; // Append the new message
}

// Function that JavaScript will listen for from Flutter
function receiveMessageFromFlutter(message) {
    console.log('Received message from Flutter:', message);
    displayMessage('Received message from Flutter: ' + message);
}

// Sends a message to Flutter via FlutterChannel
function sendMessageToFlutter() {
    if (typeof FlutterChannel !== 'undefined') {
        FlutterChannel.postMessage('Hello from JavaScript!');
        displayMessage('Message sent to Flutter: Hello from JavaScript!');
    } else {
        displayMessage('Error: FlutterChannel is not defined.');
    }
}