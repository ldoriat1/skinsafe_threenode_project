// Sends a message to Flutter via FlutterChannel
function sendMessageToFlutter() {
    if (typeof FlutterChannel !== 'undefined') {
        FlutterChannel.postMessage('Hello from JavaScript!');
    } else {
        console.error('FlutterChannel is not defined.');
    }
}

// Receives a message from Flutter and logs it to the console
function receiveMessageFromFlutter(message) {
    console.log('Received message from Flutter:', message);
}