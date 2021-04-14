const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const jwt = require("jsonwebtoken");

const getNotifications = async (email) => {
    return await Dynamo.queryDocumentsSkBegins(`USER#${email}`,'#NOTIFICATION#');
}

exports.handler = async event => {
    try {
        const authorization = event.headers && event.headers.Authorization;
        const verification = authorization && jwt.verify(authorization, process.env.tokenSecret);

        if (!verification) return Responses._401({ message: 'Unauthorized' });
        const email = verification.email;

        notifications = await getNotifications(email);
        return Responses._200({ success: true, notifications: notifications });
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not get notifications' });
    }
};

