const AWS = require('aws-sdk');
const ddbDocClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'WSConnections';

exports.handler = (event, context, callback) => {
    const connectionId = "" + event.requestContext.connectionId;
    deleteConnectionFromTable(connectionId).then(() => {
    callback(null, {
        statusCode: 200
        });
    })
	.catch((error) => {
		console.error('Cannot delete connection');
		console.error(error);
		callback(null, {
			statusCode: 500
		});
	});    
};


function deleteConnectionFromTable(connectionId) {
    return ddbDocClient.delete({
        "TableName": tableName,
        "Key": {
            "connectionId" : connectionId
        }
    }).promise();
}
