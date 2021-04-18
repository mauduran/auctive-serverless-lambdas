const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const jwt = require("jsonwebtoken");

const getOwnerAuctionsById = async (userEmail) => {
    params = {
        TableName: process.env.AWS_DYNAMODB_TABLE,
        IndexName: 'reverse-index',

    }
    const items = await Dynamo.queryDocumentsIndex('reverse-index', {
        KeyConditionExpression: "SK = :sk  and begins_with (PK, :pk)",
        ExpressionAttributeValues: {
            ":pk": `AUCTION#`,
            ":sk": `#AUCTION_USER#${userEmail}`
        },
    });

    if (items.length && (items[0].owner_email == userEmail)) {
        return items;
    }
    throw "Could not find owner auctions";

}

exports.handler = async event => {
    try {
        const authorization = event.headers && event.headers.Authorization;
        const verification = authorization && jwt.verify(authorization, process.env.tokenSecret);

        if (!verification) return Responses._401({ message: 'Unauthorized' });

        const email = verification.email;
        const userId = event.pathParameters && event.pathParameters.id;

        if (!userId) return Responses._401({ error: true, message: 'Missing user id' });

        let ownerAuctions = await getOwnerAuctionsById(userId, email);
        return Responses._200({ success: true, auctions: ownerAuctions });
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not get auctions' });
    }
};
