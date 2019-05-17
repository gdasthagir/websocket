const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB();
const ddbDocClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'WSConnections';

/// The first few connections will fail for about 45 seconds because the table creation takes some time
exports.handler = async (event) => {
  var createComplete = false;
  try{
  
    console.log(JSON.stringify(event));
    
    const connectionId = "" + event.requestContext.connectionId;
    
    var topicName = "";
    if(event.queryStringParameters && event.queryStringParameters.hasOwnProperty("topicName")){
        topicName = "" + event.queryStringParameters.topicName;
    }
    else{
		return {
			statusCode: 500,
			body: JSON.stringify('Need topicName in URL append ?topicName=Something to the ')
		};
    }
  
	doesTableExist().then(() => {
		// just add connection to table
		addConnectionToTable(connectionId, topicName).then(() => {
			return {
				statusCode: 200
			};
		})
		.catch((error) => {
			console.error('Cannot add connection');
			console.error(error);
			return {
				statusCode: 500
			};
		});
    })
	.catch((error) => {
		// create the table and then add connection to table
		createTable().then(() => {
			console.log('Creating Table');
		})
		.catch((error) => {
			console.error('Cannot create table');
			console.error(error);
			return {
				statusCode: 500
			};
		});
	});

	for(var i = 0; i < 30; i++){
		var created = await waitAndCheckAgain();
		if (created === true ){
			break;
		}
	}
	
	return {
        statusCode: 200
    };
	
  }
  catch(error){
    console.error(error);
    return {
        statusCode: 500,
        body: error
    };    
  }
  
	function getCreationStatus(){
		dynamoDB.describeTable({ TableName: tableName }, function(err, data) {
		  if (err) {
			console.error(err);
		  } 
		  else {
			if(data.Table.TableStatus === 'ACTIVE'){
				createComplete = true;
			}
			else {
				createComplete = false;
			}
		  }
		});
	}
	
	function waitAndCheckAgain(){
		return new Promise((resolve, reject) => {
			getCreationStatus();
			setTimeout(() => {
				resolve(createComplete);
			}, 3000);
		});
	}

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

function doesTableExist(){
    return dynamoDB.describeTable({
		TableName: tableName
	}).promise();
}

function createTable(){
    return dynamoDB.createTable(
	{
	  AttributeDefinitions: [
		{
		  AttributeName: 'connectionId',
		  AttributeType: 'S'
		},
		{
		  AttributeName: 'topicName',
		  AttributeType: 'S'
		}
	  ],
	  KeySchema: [
		{
		  AttributeName: 'connectionId',
		  KeyType: 'HASH'
		}
	  ],
	  ProvisionedThroughput: {
		ReadCapacityUnits: 3,
		WriteCapacityUnits: 3
	  },
	  TableName: tableName,
	  GlobalSecondaryIndexes: [
	    {
	      IndexName: 'TopicNameIndex',
	      KeySchema: [ 
	        {
	          AttributeName: 'topicName', 
	          KeyType: 'HASH'
	        }
	      ],
	      Projection: { 
	        ProjectionType: 'KEYS_ONLY'
	      },
	      ProvisionedThroughput: {
	        ReadCapacityUnits: 2,
	        WriteCapacityUnits: 2
	      }
	    }
	  ],	  
	  StreamSpecification: {
		StreamEnabled: false
	  }
	}
	).promise();
}
