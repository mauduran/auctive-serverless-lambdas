const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');

const getUsers = async (auctionId) => {
    return await Dynamo.queryDocumentsSkBegins(`AUCTION#${auctionId}`,'#INTERESTED_USER#');
}

exports.handler = async event => {
    try {
        const conversationId = event.pathParameters && event.pathParameters.id;
        if (!conversationId) return Responses._401({ error: true, message: 'Missing conversation id' });
        users = await getUsers(conversationId);
        return Responses._200({ success: true, users: users });
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not get interested users' });
    }
};
