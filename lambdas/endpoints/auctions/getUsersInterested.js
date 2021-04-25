const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');

const getUsers = async (auctionId) => {
    return await Dynamo.queryDocumentsSkBegins(`AUCTION#${auctionId}`,'#INTERESTED_USER#');
}

exports.handler = async event => {
    try {
        const auctionId = event.pathParameters && event.pathParameters.auctionId;
        if (!auctionId) return Responses._401({ error: true, message: 'Missing conversation id' });
        users = await getUsers(auctionId);
        return Responses._200({ success: true, users: users });
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not get interested users' });
    }
};
