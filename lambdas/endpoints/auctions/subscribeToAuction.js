const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const jwt = require("jsonwebtoken");


const subscribeUserToAuction = async (email, auctionId) => {
    let item = {
        PK: `AUCTION#${auctionId}`,
        SK: `#INTERESTED_USER#${email}`,
        interested_user: email,
        auctionId: auctionId
    }
    return await Dynamo.write(item);
}
exports.handler = async event => {
    try {
        const authorization = event.headers && event.headers.Authorization;
        const verification = authorization && jwt.verify(authorization, process.env.tokenSecret);
        
        if (!verification) return Responses._401({ message: 'Unauthorized' });
        const email = verification.email;
        
        const body = JSON.parse(event.body);
        if (!body || !body.auctionId) {
            return Responses._400({ message: 'missing fields in body' });
        }

        await subscribeUserToAuction(email, body.auctionId);
        
        return Responses._200({ success: true, message: "Added subscription" });
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not subscribe to auction.' });
    }
};

