const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const { getTodayString } = require('../../common/dates');


const createScheduledAction = (auctionId, endDate, auctionOwnerEmail) => {
    let date = getTodayString();

    let scheduledAction = {
        PK: `SCHEDULED_AUCTION#`,
        SK: `#DATE#${date}#AUCTION#${auctionId}`,
        date: endDate,
        auction_id:auctionId,
        owner_email: auctionOwnerEmail,
        pending: true
    }
    return Dynamo.writeIfNotExists(scheduledAction, 'SK');
}
exports.handler = async event => {
    try {
        const body = JSON.parse(event.body);
    
        const { auctionId, endDate, auctionOwnerEmail } = body;

        if (!auctionId || !endDate) return Responses._400({error: true, message: "Missing fields."});

        await createScheduledAction(auctionId, endDate, auctionOwnerEmail);

        return Responses._200({success: true, message: "Auction close succesfully scheduled"});
    } catch (error) {
        return Responses._400({error:true, message: "Could not get scheduled action."})
    }
};
