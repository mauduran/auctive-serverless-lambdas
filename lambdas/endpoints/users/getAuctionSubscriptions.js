const jwt = require('jsonwebtoken');
const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');

const getAuctionIds = async (email) => {
    const params = {
        KeyConditionExpression: "SK = :sk  and begins_with (PK, :pk)",
        ExpressionAttributeValues: {
            ":sk": `#INTERESTED_USER#${email}`,
            ":pk": "AUCTION#"
        },
    }
    return await Dynamo.queryDocumentsIndex('reverse-index',params);
}

exports.handler = async event => {
    try {
        const authorization = event.headers && event.headers.Authorization;
        const verification = authorization && jwt.verify(authorization, process.env.tokenSecret);

        if (!verification) return Responses._401({ message: 'Unauthorized' });
        const email = verification.email;

        auctions = await getAuctionIds(email);
        return Responses._200({ success: true, auctions: auctions });
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not get auction subscriptions.' });
    }
};
