const jwt = require("jsonwebtoken");
const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');

const updateBid = async (auctionId, new_bid, auctionOwnerEmail, bidderEmail) => {
    const params = {
        Key: {
            "PK": `AUCTION#${auctionId}`,
            "SK": `#AUCTION_USER#${auctionOwnerEmail}`,
        },
        ConditionExpression: "current_price < :new_bid AND auction_status = :status",
        UpdateExpression: "SET current_price = :new_bid, current_bidder = :bidderEmail",
        ExpressionAttributeValues: {
            ":new_bid": new_bid,
            ":bidderEmail": bidderEmail,
            ":status": "OPEN"
        },
    }

    return await Dynamo.updateDocument(params);
}

exports.handler = async event => {
    try {
        const body = JSON.parse(event.body);

        const authorization = event.headers && event.headers.Authorization;
        const verification = jwt.verify(authorization, process.env.tokenSecret);

        if (!verification) return Responses._401({ message: 'Unauthorized' });

        const { auctionId, bid, auctionOwnerEmail } = body;


        if (!auctionId || !bid || !auctionOwnerEmail) return Responses._400({
            error: true,
            message: "Missing required fields"
        })

        const bidderEmail = verification.email;

        let current_auction = await updateBid(auctionId, bid, auctionOwnerEmail, bidderEmail);
        return Responses._200({ success: true, message: "Auction updated, new bid!", current_auction: current_auction });
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: "Could not update auction!" });
    }

};