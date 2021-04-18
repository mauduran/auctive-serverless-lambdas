const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const jwt = require("jsonwebtoken");
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
        date: new Date().toISOString(),
        emitter: emitter
    }

    return Dynamo.writeIfNotExists(notification, 'PK');
}


const acceptPendingVerification = async (userEmail, status) => {

    params = {
        Key: {
            "PK": `#VERIFICATION`,
            "SK": `USER#${userEmail}`
        },
        UpdateExpression: "set verification_status = :new_status",
        ExpressionAttributeValues: {
            ":new_status": status,
        },
    }

    return await Dynamo.updateDocument(params);
}

exports.handler = async event => {
    try {
        const userEmail = event.queryStringParameters.userEmail;
        const isAccepted = (event.queryStringParameters.isAccepted == "true") || (event.queryStringParameters.isAccepted == "True");

        const authorization = event.headers && event.headers.Authorization;

        if (!authorization) return Responses._401({ message: 'Unauthorized' });

        const verification = jwt.verify(authorization, process.env.tokenSecret);

        if (!verification || !userEmail || !isAccepted) return Responses._401({ message: 'Unauthorized' });

        status = isAccepted ? "OK" : "REJECTED";
        message = isAccepted ? "Has sido verificado" : "Has sido rechazado";

        res_new = await acceptPendingVerification(userEmail, status);

        await createNotification(verification.email, "",  "", message, "");

        return Responses._200({ success: true, verification:  res_new});
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not find user' });
    }
};
