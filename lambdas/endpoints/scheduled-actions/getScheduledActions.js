const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const { getTodayString } = require('../../common/dates');


exports.handler = async event => {
    let date = getTodayString();

    try {
        const params = {
            KeyConditionExpression: "SK = :sk  and begins_with (PK, :pk)",
            IndexName: 'reverse-index',
            ExpressionAttributeValues: {
                ":pk": "SCHEDULED_ACTION#",
                ":sk": `#DATE#${date}`
            }
        }
        items = await Dynamo.queryDocuments(params);

        return Responses._200({ success: true, items: items });
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: "Could not get scheduled items." })
    }
};
