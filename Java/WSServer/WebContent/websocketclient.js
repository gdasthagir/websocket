class WebSocketClient {
    
    constructor(serverurl, onopen, onmessage, onclose, onerror) {
        
        this.webSocket = null;
        
        this.serverurl = serverurl;
        
        this.onopen    = onopen;
        this.onmessage = onmessage;
        this.onclose   = onclose;
        this.onerror   = onerror;
    }
    
    getServerUrl() {
    	if(!this.serverurl || this.serverurl == ""){
    		throw new Error("Server Url Cannot be Empty");
    	}
    		
        return this.serverurl;
    }
    
    connect() {

        try {
            this.webSocket = new WebSocket(this.getServerUrl());
            
            this.webSocket.onopen = this.onopen;
            
            this.webSocket.onmessage = this.onmessage;

            this.webSocket.onclose = this.onclose;

            this.webSocket.onerror = this.onerror;
            
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    
    getStatus() {
        return this.webSocket.readyState;
    }

    send(message) {
        
        if (this.webSocket.readyState == WebSocket.OPEN) {
            this.webSocket.send(message);
            
        } else {
            console.error('WebSocket not open. readyState: ' + this.webSocket.readyState);
        }
    }

    disconnect() {

        if (this.webSocket.readyState == WebSocket.OPEN) {
            this.webSocket.close();
            
        } else {
            console.error('WebSocket not open. readyState: ' + this.webSocket.readyState);
        }
    }
    
    getDetailedReason(event){
    	var additionalDets = "";
        if (event.code == 1000)
        	additionalDets = "Normal closure";
        else if(event.code == 1001)
        	additionalDets = "Server unavailable or navigation occured";
        else if(event.code == 1002)
        	additionalDets = "Protocol Error";
        else if(event.code == 1003)
        	additionalDets = "Invalid Format";
        else if(event.code == 1004)
        	additionalDets = "Unknown Error";
        else if(event.code == 1005)
        	additionalDets = "No Status";
        else if(event.code == 1006)
        	additionalDets = "Abnormal Closure";
        else if(event.code == 1007)
        	additionalDets = "Encoding Error";
        else if(event.code == 1008)
        	additionalDets = "Policy Violation";
        else if(event.code == 1009)
        	additionalDets = "Message too big";
        else if(event.code == 1010) 
        	additionalDets = "Handshake Error";
        else if(event.code == 1011)
        	additionalDets = "Internal Server Error";
        else if(event.code == 1015)
        	additionalDets = "TLS Handhake Error";
        else
        	additionalDets = "Unknown Reason";
        
        return additionalDets + ( (event.reason && event.reason.length > 0 ) ?  (" (" + event.reason + ")") : "") ;
    }
}
