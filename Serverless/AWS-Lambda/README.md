# Serverless WebSocket Server

Topic based WebSocket Server implemented in AWS Using Lambda functions and API Gateway.

AWS API Gateway now supports WebSocket connections. Using that along with Lambda and DynamoDB; we can implement a topic based WebSocket Server.

- Clients make connections based on the topic they are interested in
  - ws://localhost:8080/WSServer/bridge?topicName=Something
- Server maintains the a table of topics vs. the subscribed connected clients
- When a client sends a message with a topic it gets pushed to all connected clients subscribed to the topic
  - Example: {**"topic":"Something"**, "message":"Some Data"}
  - This entire message is sent to all clients connected using **?topicName=Something**

**Sample Use Case:**
Push content to Web Application UI based on events happening on the server like data coming from another UI instance or an IoT device etc.

** **
## Getting Started

### Prerequisites
AWS Account and some familiarity with AWS

Some idea about [WebSocket](https://en.wikipedia.org/wiki/WebSocket)  ([Google It](https://www.google.com/search?q=websocket))

** **
### Summary ([details below](#Detailed-Steps))
Create 3 lambda functions to do the following. Create a WebSocket API Gateway to route to these functions.
- Handle connections and maintain a table of connections vs. their topics (see [Connect/index.js](Connect/index.js))
  - *topic* comes from *URL Params* 
  - *connectionID* comes from *Request Context*
  - Use a table in DynamoDB to store this
- Process incoming messages (see [OnMessage/index.js](OnMessage/index.js))
  - Get the list of connections from DynamoDB by topic and post the message to the connections using ApiGatewayManagementApi
- Handle disconnects
  - Remove the entry from the DynamoDB (see [Disconnect/index.js](Disconnect/index.js))

Note: 
  - [OnMessage/index.js](OnMessage/index.js) uses **AWS.ApiGatewayManagementApi**
  - AWS.ApiGatewayManagementApi is only available in the new versions of AWS-SDK
  - The latest update to Lambda has upgraded its runtime to include the latest AWS-SDK
  - In case your functions does not have access to AWS.ApiGatewayManagementApi; 
  - We have 2 options to get access to AWS.ApiGatewayManagementApi ([see below](#Optional-Items))
    - Include declaration of  AWS.ApiGatewayManagementApi in your code
    - Create **Lambda Layer** with the new version of aws-sdk and refer that in your Lambda function 

** **
## Detailed Steps

0. **Create a role in IAM with proper policies to execute your lambda:**
- [Console -- IAM](https://console.aws.amazon.com/iam/) -- Roles -- Create role. 
- Select Lambda
- Attach the following policies (search for it by typing and press the check box)
  - AmazonAPIGatewayInvokeFullAccess
  - AmazonDynamoDBFullAccess
- Give your role a name and Create

1. **Create a table in DynamoDB to hold connection Ids and Topics:**
- [Console -- DynamoDB](https://console.aws.amazon.com/dynamodb/) -- Create table. 
  - Table Name: "**_WSConnections_**"
  - Primary Key: "**_connectionId_**" (String)
  - Create

2. **Create the Connect Handler Lamda Function:**
- [Console -- Lambda](https://console.aws.amazon.com/lambda/) -- Functions -- Create Function
  - Function Name: "**_WSConnect_**"
  - Language: *Node.js 10.x* or *Node.js 8.10*
  - Expand *Choose or create an execution role*
  - Select *Use an existing role* and choose the one that was created earlier with dynamo and api gateway access
  - Copy and paste the code from [Connect/index.js](Connect/index.js)
  - Save

3. **Create the Disconnect Handler Lamda Function:**
- [Console -- Lambda](https://console.aws.amazon.com/lambda/) -- Functions -- Create Function
  - Function Name: "**_WSDisconnect_**"
  - Language: *Node.js 10.x* or *Node.js 8.10*
  - Expand *Choose or create an execution role*
  - Select *Use an existing role* and choose the one that was created earlier with dynamo and api gateway access
  - Copy and paste the code from [Disconnect/index.js](Disconnect/index.js)
  - Save

4. **Create the Message Handler Lamda Function:**
- [Console -- Lambda](https://console.aws.amazon.com/lambda/) -- Functions -- Create Function
  - Function Name: "**_WSOnMessage_**"
  - Language: *Node.js 10.x* or *Node.js 8.10*
  - Expand *Choose or create an execution role*
  - Select *Use an existing role* and choose the one that was created earlier with dynamo and api gateway access
  - Copy and paste the code from [OnMessage/index.js](OnMessage/index.js)
  - Save

5. **Create an API Gateway to wire the Connect, Disconnect and OnMessage functions:**
- [Console -- API Gateway](https://console.aws.amazon.com/apigateway/) -- Create API
  - Select *WebSocket*
  - Provide any name for API Name
  - Enter "**_$request.body.action_**" for Route Selection Expression
  - Create API
- Create Route for Connect Handler Lamda Function
  - Select the Route Key **$connect**
  - Integration Type: Lambda Function
  - Type your Connect function name (*WSConnect*)
  - Save
  - OK (in role permission message)
- Create Route for Disconnect Handler Lamda Function
  - Select the Route Key **$disconnect**
  - Integration Type: Lambda Function
  - Type your Connect function name (*WSDisconnect*)
  - Save
  - OK (in role permission message)
- Create Route for Message Handler Lamda Function
  - Select the Route Key **$default**
  - Integration Type: Lambda Function
  - Type your Connect function name (*WSOnMessage*)
  - Save
  - OK (in role permission message)
- Deploy the API
  - Actions Deploy API
  - Deployment Stage: [New Stage]
  - Stage Name: "**_bridge_**" (this can be anything, make sure your url includes it when testing)
  - Deploy
- Copy the API Gateway URL from the stages -- bridge example:  **wss://aaabbbccc123.execute-api.region.amazonaws.com/bridge**


### Testing Steps
- Go to http://ws.truly.technology to test using WebSocket Client
  - Enter Server URL as **"wss://url-from-api-gateway-stages-bridge/bridge?topicName=Something"**
  - Connect
  - Type in your message *{"topic":"Something", "message":"Some Data"}* push Send
  - Disconnect when done

## Optional Items (if your Lambda runtime does not provide AWS.ApiGatewayManagementApi)

### Steps for creating the declaration for AWS.ApiGatewayManagementApi (Optional)
- [Console -- Lambda](https://console.aws.amazon.com/lambda/) -- Functions
  - Select "**_WSOnMessage_**"
  - In the editor **File -- New**
  - Copy and paste the code from [OnMessage/apigwmgmtapi.2.455.0.js](OnMessage/apigwmgmtapi.2.455.0.js)
  - Save the file **File -- Save** name apigwmgmtapi.2.455.0.js
  - Save

### Steps for getting the latest aws-sdk as a *Lambda Layer* (Optional)
- **Prerequisite: npm**
- Create the Package
  - md node-aws-sdk
  - cd .\node-aws-sdk\
  - npm init
  - npm install --save aws-sdk
  - cd ..
  - start .
  - Right click on folder node-aws-sdk and create zip (Send to Compressed)

- Create the Layer
  - [Console -- Lambda](https://console.aws.amazon.com/lambda/) -- Functions -- Create Layer
  - Give it a name
  - Upload the zip file
  - Compatible Runtime: Node.js 8.10
  - Create

- Adjust code
  - Select this layer in your OnMessage Lambda Function
  - edit index.js
  - remove **~~require('./apigwmgmtapi.2.455.0.js');~~**
  - replace **~~const AWS = require('aws-sdk');~~**
  - with **const AWS = require('/opt/node-aws-sdk/node_modules/aws-sdk');**

## You can also try out the *optimized* version (Optional)
- Connect creates the DynamoDB Table automatically if it doesn't exist see [Connect/index.optimized.js](Connect/index.optimized.js)
  - first few connections may fail due to delay in creating the table and index
- On Message uses a *query* instead of *scan* [OnMessage/index.optimized.js](OnMessage/index.optimized.js)
- Disconnect is pretty much the same [Disconnect/index.js](Disconnect/index.js)

## Thanks

* Appreciate everyone that tried, stumbled with the new WebSocket support in API Gateway and published their learnings.

