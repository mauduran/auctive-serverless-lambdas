const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const jwt = require("jsonwebtoken");


const enableNotifications = async (email) => {

    let params = {
        Key: {
            "PK": `USER#${email}`,
            "SK": `#PROFILE#${email}`
        },
        UpdateExpression: "set notifications_enabled = :notifications_enabled",
        ExpressionAttributeValues: {
            ":notifications_enabled": true,
        },
        ConditionExpression: `attribute_exists(phone_number)`
    }

    return await Dynamo.updateDocument(params);
}
exports.handler = async event => {
    try {
        const authorization = event.headers && event.headers.Authorization;
        const verification = authorization && jwt.verify(authorization, process.env.tokenSecret);

        if (!verification) return Responses._401({ message: 'Unauthorized' });
        const email = verification.email;
        
        await enableNotifications(email);
        
        return Responses._200({ success: true, message: "Enabled notifications." });
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not enable notifications.' });
    }
};

