const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const jwt = require("jsonwebtoken");


const getConversations = async (email) => {

    let conversations = [
        ...(await Dynamo.queryDocumentsIndex('seller_email-index', {
            KeyConditionExpression: "seller_email = :seller_email",
            ExpressionAttributeValues: {
                ":seller_email": email
            },
        })),
        ...(await Dynamo.queryDocumentsIndex('bidder_email-index', {
            KeyConditionExpression: "bidder_email = :bidder_email",
            ExpressionAttributeValues: {
                ":bidder_email": email
            },
        }))
    ];

    return conversations;
}

exports.handler = async event => {
    try {
        const authorization = event.headers && event.headers.Authorization;
        const verification = authorization && jwt.verify(authorization, process.env.tokenSecret);

        if (!verification) return Responses._401({ message: 'Unauthorized' });
        const email = verification.email;

        conversations = await getConversations(email);
        return Responses._200({ success: true, conversations: conversations });
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not get conversations' });
    }
};
