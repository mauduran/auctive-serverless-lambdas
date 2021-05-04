const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const { getTodayString } = require('../../common/dates');


const createScheduledAction = async (auctionId, endDate, auctionOwnerEmail) => {
    let date = getTodayString();

    let scheduledAction = {
        PK: `SCHEDULED_ACTION#${auctionId}`,
        SK: `#DATE#${date}`,
        date: endDate,
        auction_id:auctionId,
        owner_email: auctionOwnerEmail,
        pending: true
    }
    await Dynamo.writeIfNotExists(scheduledAction, 'SK');

    return scheduledAction;
}
exports.handler = async event => {
    try {
        const body = JSON.parse(event.body);
    
        const { auctionId, endDate, auctionOwnerEmail } = body;

        if (!auctionId || !endDate) return Responses._400({error: true, message: "Missing fields."});

        const auction = await createScheduledAction(auctionId, endDate, auctionOwnerEmail);

        return Responses._200({success: true, message: "Auction close succesfully scheduled", auction});
    } catch (error) {
        return Responses._400({error:true, message: "Could not get scheduled action."})
    }
};
