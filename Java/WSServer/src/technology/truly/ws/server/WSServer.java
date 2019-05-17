package technology.truly.ws.server;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import org.apache.tomcat.util.json.JSONParser;

/**
 * Just add this to your Dynamic Web Project and run in a server that supports javax.websocket.
 * 	You can test it using ws://server:port/context-root/bridge?topicName=Something
 * 
 * @author gdasthagir
 *
 */
@ServerEndpoint("/bridge")
public class WSServer {
	
	private static final boolean noTopicSendToEveryone = false;
    
    @OnOpen
    public void onOpen(Session session) {
        System.out.println("New Client. ID:" + session.getId());
        
        // Pass the url param with which you identify the topic.
        // if url is ws://localhost:8080/WSServer/bridge?topicName=Something
        // the topicName is "topicName"                       ^
        rememberSession("topicName", session);
    }

    @OnClose
    public void onClose(Session session) {
        System.out.println("Disconnected Client: " +  session.getId());
        forgetSession(session);
    }
    
    @OnMessage
    public void onMessage(String message, Session session) {
        System.out.println("Message From: " + session.getId() + " Message: " + message);
        
        try {
        	String topic = getTopicFromMessage("topic", message);
        	if(topic != null) {
            	sendToTopicSubscribers(topic, message);
        	}
        	else if(noTopicSendToEveryone) {
        		// No topic so send to all
        		//	Set noTopicSendToEveryone to true if you want this
            	sendToAllSubscribers(message, session);
        	}
        	else {
            	// Just reply to the sender stating topic is mandatory
                session.getBasicRemote().sendText("Topic is mandatory. Example: {\"topic\":\"Something\", \"message\":\"Some Data\"}");
        	}
        } catch (IOException e) {
            e.printStackTrace();
        } 
    }
    
    @OnError
    public void onError(Throwable t) {
        System.out.println("Error: " + t.getMessage());
    	t.printStackTrace();
    }
    
    
	/**
	 * Sends message to subscribers subscribed to topic.
	 * 
	 * @param topic
	 * @param message
	 * @throws IOException
	 */
	private void sendToTopicSubscribers(String topic, String message) throws IOException {
    	topicSessionMap.get(topic);
    	sendMessageToSessions(message,getSubscribedSessions(topic));
    }

	/**
	 * Sends message to clients connected to this server.
	 * 
	 * @param message
	 * @param session
	 * @throws IOException
	 */
	private void sendToAllSubscribers(String message, Session session) throws IOException {
    	sendMessageToSessions(message, session.getOpenSessions());
    }
    
    /**
     * Sends message to sessions passed in the parameter.
     * 
     * @param message
     * @param sessions
     * @throws IOException
     */
    private void sendMessageToSessions(String message, Set<Session> sessions) throws IOException {
    	if(sessions == null || sessions.isEmpty()) {
    		return;
    	}
    	for (Session session : sessions) {
    		if(session.isOpen()) {
    			session.getBasicRemote().sendText(message);
    		}
    		else {
    			forgetSession(session);
    		}
		}
    }
    
    // Map used to maintain sessions subscribed to a topic
    private static Map<String, Set<Session>> topicSessionMap = new HashMap<String, Set<Session>>();
    
    /**
     * Keeps track of sessions by topicValue specified in the sessions url parameter.
     * 
     * 	if url is ws://localhost:8080/WebSockServer/bridge?topicName=Something
     * 	the sessions will be remembered by the key "Something"
     * 
     * @param topicName is the "topicName" in the url
     * @param session
     * @return
     */
    private static boolean rememberSession(String topicName, Session session) {
    	Map<String, List<String>> params = session.getRequestParameterMap();
        if(params.containsKey(topicName) && !params.get(topicName).isEmpty()) {
        	String topicValue = params.get(topicName).get(0);
        	if(!topicSessionMap.containsKey(topicValue)) {
        		topicSessionMap.put(topicValue, new HashSet<Session>());
        	}
        	topicSessionMap.get(topicValue).add(session);
        	System.out.println("Remembering Client For Topic: " + topicValue + ", ID: " + session.getId());
        	return true;
        }
        return false;
    }
    
    /**
     * Removes the session from the tracking map.
     * 
     * @param session
     */
    private static void forgetSession(Session session) {
    	Collection<Set<Session>> sessionListList = topicSessionMap.values();
    	for (Set<Session> sessionList : sessionListList) {
			sessionList.remove(session);
			System.out.println("Forgetting Client. ID: " + session.getId());
		}
    }
    
    /**
     * Returns a list of sessions subscribed to the topic.
     * 
     * @param topic
     * @return
     */
    private Set<Session> getSubscribedSessions(String topic){
    	return topicSessionMap.get(topic);
    }
    
    /**
     * Parses the JSON message and extracts topic and returns it.
     * 
     * 	if message is {"topic":"Something", "message":"Some Data"}
     * 	returns "Something"
     * 
     * @param topic
     * @param message
     * @return
     */
    public String getTopicFromMessage(String topic, String message) {
    	try {
        	return new JSONParser(message).parseObject().get(topic).toString();
		} catch (Throwable e) {
			e.printStackTrace();
		}
    	return null;
    }
    
}