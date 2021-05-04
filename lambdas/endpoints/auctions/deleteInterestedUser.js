const jwt = require("jsonwebtoken");
const Responses = require("../../common/API_Responses");
const Dynamo = require("../../common/Dynamo");

exports.handler = async event => {
    const auctionId = event.pathParameters && event.pathParameters.auctionId;
    if (!auctionId) return Responses._400({ error: true, message: "Missing params." })

    const authorization = event.headers && event.headers.Authorization;
    if (!authorization) return Responses._401({ error: true, message: 'Unauthorized' });

    const verification = jwt.verify(authorization, process.env.tokenSecret);
    if (!verification) return Responses._401({ error: true, message: 'Unauthorized' });

    const userEmail = verification.email;
    try {
        await Dynamo.deleteDocumentByKey(`AUCTION#${auctionId}`, `#INTERESTED_USER#${userEmail}`);
        return Responses._201({ success: true, message: "Removed user" });
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: 'Could not delete user' });
    }
};

