const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');

exports.handler = async event => {
    try {        
        const {auctionId} = event.pathParameters;

        if(!auctionId) return Responses._400({ error: true, message: "Missing fields" });
        
        const params = {
            KeyConditionExpression: "PK = :pk  and begins_with (SK, :sk)",
            ExpressionAttributeValues: {
                ":pk": `SCHEDULED_ACTION#${auctionId}`,
                ":sk": `#DATE#`
            }
        }
        items = await Dynamo.queryDocuments(params);

        if(items.length) {
            return Responses._200({ success: true, scheduledAction: items[0] });
        }
        return Responses._404({ error: true, message: "No action found with this id." });
    } catch (error) {
        return Responses._400({ error: true, message: "Could not get scheduled action." });
    }
};
