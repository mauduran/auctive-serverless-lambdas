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
                console.log(data);
                return data.Items
            });
    }
}
module.exports = Dynamo;
