# Java WebSocket Server

Topic based WebSocket Server implemented in Java to run on Tomcat.

- Clients make connections based on the topic they are interested in
  - ws://localhost:8080/WSServer/bridge?topicName=Something
- Server maintains the a map of topics vs. the subscribed connected clients
- When a client sends a message with a topic it gets pushed to all connected clients subscribed to the topic
  - Example: {**"topic":"Something"**, "message":"Some Data"}
  - This entire JSON will be sent to all clients connected using **?topicName=Something**

**A Good Use Case**
Push content Web Application UI based on events happening on the server, data coming from an IoT device etc.

** **
## Getting Started

### Prerequisites
Java 8, Eclipse EE, Tomcat 9 

Some idea on [WebSocket](https://en.wikipedia.org/wiki/WebSocket)  ([Google It](https://www.google.com/search?q=websocket))

### Steps
Run this project in Tomcat Server:
* Create the Dynamic Web Project in Eclipse
* Pull or download this folder into the project
* Add this project to Tomcat Server
* Start Tomcat Server
* Go to http://localhost:8080/WSServer to test using the WebSocket Client

** **
## Code Details / Explanation

### Server Code (Java)
- A class annotated with @javax.websocket.server.ServerEndpoint("/bridge")
  - invoked when you make a WebSocket connection to ws://server:port/bridge
- Method annotated with javax.websocket.OnOpen
  - called when a client connects
- Method annotated with javax.websocket.OnMessage
  - called when a client sends a message using a WebSocket connection
- Method annotated with javax.websocket.OnClose
  - called when a client disconnects
- Method annotated with javax.websocket.OnError
  - called when an error occurs

#### See [WSServer.java](src/technology/truly/ws/server/WSServer.java)
```Java
@ServerEndpoint("/bridge")
public class WSServer {
    @OnOpen
    public void onOpen(Session session) {
    }
    
    @OnMessage
    public void onMessage(String message, Session session) {
    }
    
    @OnClose
    public void onClose(Session session) {
    }
    
    @OnError
    public void onError(Throwable t) {
    }
}
```

### Client Code (JavaScript)
- Connecting
  - instantiate webSocket = new WebSocket(ws://server:port/bridge)
  - assign individual handler functions to webSocket.onopen, webSocket.onmessage, webSocket.onclose and webSocket.onerror
- Sending a message
  - call webSocket.send(message)
- Receiving messages
  - handler assigned to webSocket.onmessage gets called
- Disconnecting
  - call webSocket.close()

#### See [index.html](WebContent/index.html) and [websocketclient.js](WebContent/websocketclient.js)
```JavaScript
const webSocket = new WebSocket(ws://server:port/bridge);
webSocket.onopen = function handleonopen(event){}
webSocket.onmessage = function handleonmessage(event){}
webSocket.onclose = function handleonclose(event){}
webSocket.onerror = function handleonopen(error){}
webSocket.send("Hello");
webSocket.close();
```
