const jwt = require("jsonwebtoken");

const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');

const { v4: uuidv4 } = require('uuid');

const createNotification = async (email, auctionId, auctionTitle, message, emitter) => {
    let notificationId = uuidv4();

    let notification = {
        PK: `USER#${email}`,
        SK: `#NOTIFICATION#${notificationId}`,
        notification_id: notificationId,
        auctionId: auctionId,
        auctionTitle: auctionTitle,
        message: message,
        date: new Date(),
        emitter: emitter
    }

    return Dynamo.writeIfNotExists(notification, 'PK');
}

exports.handler = async event => {
    const body = JSON.parse(event.body);

    const authorization = event.headers && event.headers.Authorization;
    const verification = jwt.verify(authorization, process.env.tokenSecret);
    
    if (!verification) return Responses._401({ message: 'Unauthorized' });

    const { email,  message, auctionId, auctionName, emitter } = body;

    if (!email ||  !message || !auctionId || !auctionName || !emitter) return Responses._400({ error: true,
        message: "Missing required fields"})

    try {
        await createNotification(email, message, auctionId, auctionName, emitter);

        return Responses._200({ success: true, message: "Notification created!"});
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: "Could not change password" });
    }

};