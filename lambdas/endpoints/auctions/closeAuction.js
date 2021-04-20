const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');

const closeAuction = async (auctionId, auctionOwnerEmail) => {
    const params = {
        Key: {
            "PK": `AUCTION#${auctionId}`,
            "SK": `#AUCTION_USER#${auctionOwnerEmail}`,
        },
        ConditionExpression: "auction_status = :status",
        UpdateExpression: "SET auction_status = :newStatus",
        ExpressionAttributeValues: {
            ":status": 'OPEN',
            ":newStatus": "CLOSED"
        },
    }

    return await Dynamo.updateDocument(params);
}
const setAuctionWinner = async (auctionId, auctionOwnerEmail) => {
    const params = {
        Key: {
            "PK": `AUCTION#${auctionId}`,
            "SK": `#AUCTION_USER#${auctionOwnerEmail}`,
        },
        ConditionExpression: "auction_status = :status",
        UpdateExpression: "SET bid_winner = current_bidder",
        ExpressionAttributeValues: {
            ":status": 'CLOSED',
        },
    }

    return await Dynamo.updateDocument(params);
}

exports.handler = async event => {
    try {
        const body = JSON.parse(event.body);

        const { auctionId, auctionOwnerEmail } = body;

        if (!auctionId || !auctionOwnerEmail) return Responses._400({ error: true, message: "Missing required fields" })

        const auction = await closeAuction(auctionId, auctionOwnerEmail);

        currentBidder = auction.Attributes.current_bidder;
        if(currentBidder){
            await setAuctionWinner(auctionId, auctionOwnerEmail);
            return Responses._200({ success: true, message: "Auction has been closed!", auction_winner: currentBidder});
        }

        return Responses._200({ success: true, message: "Auction has been closed with no winner."});
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: "Could not close auction!" });
    }

};