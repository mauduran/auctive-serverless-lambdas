const jwt = require("jsonwebtoken");
const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');

const  buyNow = async (auctionId, auctionOwnerEmail, bidderEmail) => {
    const params = {
        Key: {
            "PK": `AUCTION#${auctionId}`,
            "SK": `#AUCTION_USER#${auctionOwnerEmail}`,
        },
        ConditionExpression: "#auction_status = :open",
        UpdateExpression: "SET current_bidder = :bidderEmail, bid_winner = :bidderEmail, #auction_status = :closed, current_price = buy_now_price",
        ExpressionAttributeNames: {
            "#auction_status": "status"
        },
        ExpressionAttributeValues: {
             ":bidderEmail" : bidderEmail,
             ":open" : "OPEN",
             ":closed" : "CLOSED"
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
    
        const { auctionId, auctionOwnerEmail } = body;
    
        if (!auctionId  ||  !auctionOwnerEmail) return Responses._400({ error: true,
            message: "Missing required fields"})

        const bidderEmail = verification.email;
        
        let closed_auction = await buyNow(auctionId, auctionOwnerEmail, bidderEmail);
        return Responses._200({ success: true, message: "Purchase done, auction closed!", closed_auction: closed_auction});
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: "Could not update auction!" });
    }

};