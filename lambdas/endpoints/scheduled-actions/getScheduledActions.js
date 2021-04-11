const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const { getTodayString } = require('../../common/dates');


exports.handler = async event => {
    let date = getTodayString();

    try {
        const params = {
            KeyConditionExpression: "PK = :pk  and begins_with (SK, :sk)",
            ExpressionAttributeValues: {
                ":pk": "SCHEDULED_ACTION#",
                ":sk": `#DATE#${date}`
            }
        }
        items = await Dynamo.queryDocuments(params);

        return Responses._200({ success: true, items: items });
    } catch (error) {
        return Responses._400({error:true, message: "Could not get scheduled items."})
    }
};
