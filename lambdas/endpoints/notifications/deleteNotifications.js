const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const jwt = require("jsonwebtoken");

const getNotifications = async (email) => {
    return await Dynamo.queryDocumentsSkBegins(`USER#${email}`,'#NOTIFICATION#');
}

const deleteNotifications = async (email) => {
        let notifications = await getNotifications(email);

        notifications = notifications.map(notification => ({
            DeleteRequest: {
                Key: {
                    PK: notification.PK,
                    SK: notification.SK
                }
            }
        }));

        let requests = [];
        let batchSize = 25;

        for (let i = 0; i < notifications.length; i += batchSize) {
            requests.push(Dynamo.batchWrite(notifications.slice(i, i + batchSize)));
        }

        return Promise.all(notifications);
}

exports.handler = async event => {
    try {
        const authorization = event.headers && event.headers.Authorization;
        const verification = authorization && jwt.verify(authorization, process.env.tokenSecret);

        if (!verification) return Responses._401({ message: 'Unauthorized' });
        const email = verification.email;

        await deleteNotifications(email);
        return Responses._200({ success: true, message: "Notifications removed" });
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not remove notifications' });
    }
};

