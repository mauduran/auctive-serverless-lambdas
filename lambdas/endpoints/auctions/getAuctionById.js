const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');

exports.handler = async event => {
    try {
        console.log(event);

        const params = event.pathParameters;

        const {auctionId, userEmail} = params;

        if(!auctionId || !userEmail) return Responses._400({ error: true, message: "Missing fields" });

        const key = {
            PK: `AUCTION#${auctionId}`,
            SK: `#AUCTION_USER#${userEmail}`
        }

        const auction = await Dynamo.findDocumentByKey(key);

        return Responses._200({ success: true, auction });
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: "Could not get auction" })
    }
};
