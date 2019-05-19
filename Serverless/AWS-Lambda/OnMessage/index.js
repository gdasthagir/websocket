const AWS = require('aws-sdk');
const ddbDocClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'WSConnections';

//require('./apigwmgmtapi.2.455.0.js'); // dont need this if using latest AWS Lambda Runtime

exports.handler =  (event, context, callback) => {

	const apistage = (event.requestContext.stage) ? ("/" + event.requestContext.stage) : "";
	const domainName = "" + event.requestContext.domainName;
	const apiep = (domainName.indexOf("amazonaws.com") >= 0)? (domainName + apistage) : domainName;

	const apigwManagementApi = new AWS.ApiGatewayManagementApi({
		apiVersion: "2018-11-29",
		endpoint: apiep
	});
	
	let message = JSON.parse(event.body);
	console.log(message);
  
	if (message.topic) {
		
		ddbDocClient.scan({ "TableName": tableName }, function (err, data) {
			var count = 0;
			if (err) {
				console.log(err);
				callback(null, {
					statusCode: 500,
					body: JSON.stringify(err)
				});
			} 
			else {
				data.Items.forEach(function(connection) {
					if (connection.topicName === message.topic){
						apigwManagementApi.postToConnection({ ConnectionId: connection.connectionId, Data: JSON.stringify(message) }, function (err, data) {
							if (err) {
							  if (err.statusCode === 410) {
								console.log("Found stale subscriber, deleting " + connection.connectionId );
								ddbDocClient.delete({ "TableName": tableName, Key: { "connectionId": connection.connectionId } });
							  } 
							  else {
								console.log("Failed to post. Error: " + JSON.stringify(err));
							  }
							} 
							else {
							  count++;
							}
						});
					}
				});
				callback(null, {
					statusCode: 200,
					body: "Published to " + count + " subscriber" + (count === 1 ? "" : "s")
				});	
			}
		});
	}
	else {
		console.log(`No Topic in ${message}`);
		callback(null, {
			statusCode: 200,
			body: `No Topic in ${message}`
		});	
	}
};
