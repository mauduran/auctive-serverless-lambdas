const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');

exports.handler = async event => {
    try {
        const params = event.pathParameters;

        const { auctionId } = params;

        if (!auctionId) return Responses._400({ error: true, message: "Missing fields" });

        let auctions = await Dynamo.queryDocumentsSkBegins(`AUCTION#${auctionId}`,'#AUCTION_USER#');

        if(auctions.length) {
            return Responses._200({ success: true, auction: auctions[0] });
        }

        return Responses._404({ error: true, message: "Could not find auction" })
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: "Could not get auction" });
    }
};
