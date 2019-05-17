const WebSocket = require('ws');
const Url = require('url');

const _port = 9090;
const wss = new WebSocket.Server({ port: _port }, () => {
    console.log(`started on port ${_port}`);
});

process.on('SIGINT', function() { 
    console.log('Dying');
    wss.close();
    process.exit();
});

wss.on('connection', function connection(socket, req) {
    
    console.log(`USER CONNECTED: ${req.connection.remoteAddress}`);
    
    var params = Url.parse(req.url, true).query;
    socket.topicName = params.topicName;

    socket.on('message', (messagestring) => {
        console.log(`Received: ${messagestring} `);
        try {
            let message = JSON.parse(messagestring);
            if (message.topic) {
                wss.clients.forEach(function each(client) {
                    if(client.topicName){
                        if (client.topicName == message.topic){
                            client.send(JSON.stringify(message));
                        }
                    }
                    else {
                        console.log(`No topic in ${JSON.stringify(message)}`)
                    }
                });
            }
        } catch (error) {
            console.log(error)
        }
    });

    socket.on('disconnect', function () {
        console.log('USER DISCONNECTED');
    });

    socket.on('close', function () {
        console.log('USER CLOSED');
    });    
});