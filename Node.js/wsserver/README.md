# Node.js WebSocket Server

Topic based WebSocket Server implemented in Node.js.

- Clients make connections based on the topic they are interested in
  - ws://localhost:9090?topicName=Something
- Server maintains the a map of topics vs. the subscribed connected clients
- When a client sends a message with a topic it gets pushed to all connected clients subscribed to the topic
  - Example: {**"topic":"Something"**, "message":"Some Data"}
  - This entire JSON will be sent to all clients connected using **?topicName=Something**


## Getting Started

### Prerequisites
NPM, Node.js, ws

### Initial Steps
- Pull or download this folder
- Open cmd or powershell
- cd into the folder
- npm install

### Runnning Steps
- Open cmd or powershell
- cd into the folder
- Enter **node index**
  - you should see **started on port 9090**
- Go to http://ws.truly.technology to test using WebSocket Client
  - Enter Server URL as **"ws://localhost:9090?topicName=Something"**
- Press **Ctrl + C** in the cmd or poweshell window to exit the server

** **
### Code Summary [index.js](index.js)
```JavaScript
const WebSocket = require('ws');

const _port = 9090;
const wss = new WebSocket.Server({ port: _port }, () => {
    console.log(`started on port ${_port}`);
});

wss.on('connection', function connection(socket, req) {
  
    console.log(`USER CONNECTED: ${req.connection.remoteAddress}`);

    socket.on('message', (messagestring) => {
        console.log(`Received: ${messagestring} `);
        // Reply or do somthing
    });

    socket.on('disconnect', function () {
        console.log('USER DISCONNECTED');
    });

    socket.on('close', function () {
        console.log('USER CLOSED');
    });    

});
```
