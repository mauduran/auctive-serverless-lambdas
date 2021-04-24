const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const dateUtils = require('../../common/dates');

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

const closeScheduledAuction = async (date, auctionId) => {
    const endDate = dateUtils.getDateString(date);
    const params = {
        Key: {
            "PK": `SCHEDULED_ACTION#${auctionId}`,
            "SK": `#DATE#${endDate}`,
        },
        UpdateExpression: "SET pending = :status",
        ExpressionAttributeValues: {
            ":status": false,
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

        let res = { message: "Auction has been closed with no winner." };
        
        if (currentBidder) {
            await setAuctionWinner(auctionId, auctionOwnerEmail);
            res = { message: "Auction has been closed!", auction_winner: currentBidder }
        }

        await closeScheduledAuction(auction.Attributes.end_date, auctionId);
        
        return Responses._200({ success: true, ...res });
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: "Could not close auction!" });
    }

};