const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const jwt = require("jsonwebtoken");

const getConversationById = async (conversationId, userEmail) => {
    params = {
        TableName: process.env.AWS_DYNAMODB_TABLE,
        IndexName: 'reverse-index',

    }
    const items = await Dynamo.queryDocumentsIndex('reverse-index', {
        KeyConditionExpression: "SK = :sk  and begins_with (PK, :pk)",
        ExpressionAttributeValues: {
            ":pk": `AUCTION#`,
            ":sk": `#CONVERSATION#${conversationId}`
        },
    });


    if (items.length && (items[0].bidder_email == userEmail || items[0].seller_email == userEmail)) {
        return items[0];
    }
    throw "Could not find conversation";

}

exports.handler = async event => {
    try {
        const authorization = event.headers && event.headers.Authorization;
        const verification = authorization && jwt.verify(authorization, process.env.tokenSecret);

        if (!verification) return Responses._401({ message: 'Unauthorized' });

        const email = verification.email;
        const conversationId = event.pathParameters && event.pathParameters.id;

        if (!conversationId) return Responses._401({ error: true, message: 'Missing conversation id' });

        conversation = await getConversationById(conversationId, email);
        return Responses._200({ success: true, conversation: conversation });
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not get conversation' });
    }
};
