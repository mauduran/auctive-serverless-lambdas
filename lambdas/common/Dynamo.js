const aws = require('aws-sdk');

aws.config.update({
    region: 'us-east-1',
})

const dynamoDB = new aws.DynamoDB.DocumentClient();

const Dynamo = {
    async writeIfNotExists(data, attributeToCheck) {
        params = {
            TableName: process.env.tableName,
            Item: data,
            ConditionExpression: `attribute_not_exists(${attributeToCheck})`
        }
        return dynamoDB.put(params).promise()
    },

    async findDocumentByKey(key) {
        const params = {
            TableName: process.env.tableName,
            Key: key
        }

        return dynamoDB.get(params).promise()
            .then(data => data.Item);
    },
    async updateDocument(params) {

        params = {
            ...params,
            TableName: process.env.tableName,
            ReturnValues: "UPDATED_NEW"
        }
        return dynamoDB.update(params).promise()
    },
    async queryDocuments(params) {
        params = {
            ...params,
            TableName: process.env.tableName,
        }
        return dynamoDB.query(params).promise()
            .then(data => {
                return data.Items
            });
    },
    async queryDocumentsSkBegins(pk, sk) {
        const params = {
            KeyConditionExpression: "PK = :pk  and begins_with (SK, :sk)",
            ExpressionAttributeValues: {
                ":pk": pk,
                ":sk": sk
            },
            TableName: process.env.tableName,
        }
        return dynamoDB.query(params).promise()
            .then(data => {
                return data.Items
            });
    },
    async queryDocumentsSkBeginsAndOtherCondition(pk, sk, condition, value) {
        const params = {
            KeyConditionExpression: `PK = :pk  and begins_with (SK, :sk)` ,
            FilterExpression : `${condition} = :condition_value)`,
            ExpressionAttributeValues: {
                ":pk": pk,
                ":sk": sk,
                ":condition_value" : value
            },
            TableName: process.env.tableName,
        }
        return dynamoDB.query(params).promise()
            .then(data => {
                return data.Items
            });
    },

    async queryDocumentsIndex(index, params) {
        params = {
            TableName: process.env.tableName,
            IndexName: index,
            ...params
        }

        return dynamoDB.query(params).promise()
            .then(data => {
                return data.Items;
            });
    },

    async batchWrite(requests){
        const params = {
            RequestItems: {
                [process.env.tableName]: requests
            }
        }
        return dynamoDB.batchWrite(params).promise()
    },

    async deleteDocumentByKey(pk, sk) {
        const params = {
            TableName: process.env.tableName,
            Key: {
                PK: pk,
                SK: sk
            }
        }
        return dynamoDB.delete(params).promise();
    },

    async scanDocument(params) {
        params = {
            TableName: process.env.tableName,
            ...params 
        }
        return dynamoDB.scan(params).promise().then((data) => data.Items);
    }
}
module.exports = Dynamo;
