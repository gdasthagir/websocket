const AWS = require('aws-sdk');
const ddbDocClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'WSConnections';

exports.handler = (event, context, callback) => {
    console.log(JSON.stringify(event));
    
    const connectionId = "" + event.requestContext.connectionId;
    
    var topicName = "";
    if(event.queryStringParameters && event.queryStringParameters.hasOwnProperty("topicName")){
        topicName = "" + event.queryStringParameters.topicName;
    }
    else{
		callback(null, {
			statusCode: 500,
			body: JSON.stringify('Need topicName in URL append ?topicName=Something to the end')
		});
    }
    
    addConnectionToTable(connectionId, topicName).then(() => {
        callback(null, {
            statusCode: 200
        });
    })
	.catch((error) => {
		console.error('Cannot add connection');
		console.error(error);
		callback(null, {
			statusCode: 500
		});
	});    
};


function addConnectionToTable(connectionId, topicName) {
    return ddbDocClient.put({
        "TableName": tableName,
        "Item": {
            "connectionId" : connectionId,
            "topicName" : topicName
        }
    }).promise();
}