const aws = require('aws-sdk');

aws.config.update({
    region: 'us-east-1',
})

const dynamoDB = new aws.DynamoDB.DocumentClient();

const Dynamo = {
    async writeIfNotExists(data) {
        params = {
            TableName: process.env.tableName,
            Item: data,
            ConditionExpression: "attribute_not_exists(PK)"
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
    }
}
module.exports = Dynamo;
