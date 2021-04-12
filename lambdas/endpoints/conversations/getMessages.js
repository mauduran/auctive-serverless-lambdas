const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const jwt = require("jsonwebtoken");


const getMessages = async (auctionId) => {
    return await Dynamo.queryDocumentsSkBegins(`CONVERSATION#${auctionId}`,'#MESSAGE#');
}

exports.handler = async event => {

    try {
        const authorization = event.headers && event.headers.Authorization;
        const verification = authorization && jwt.verify(authorization, process.env.tokenSecret);

        if (!verification) return Responses._401({ message: 'Unauthorized' });
        const email = verification.email;

        const conversationId = event.pathParameters && event.pathParameters.id;
        if (!conversationId) return Responses._401({ error: true, message: 'Missing conversation id' });

        messages = await getMessages(conversationId);
        return Responses._200({ success: true, messages: messages });
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not get conversation messages' });
    }
};
