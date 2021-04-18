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


const updateVerificationRequest = async (userEmail, status) => {

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

const updateUserVerification = async (email) => {

    let params = {
        Key: {
            "PK": `USER#${email}`,
            "SK": `#PROFILE#${email}`
        },
        UpdateExpression: "set is_verified = :is_verified",
        ExpressionAttributeValues: {
            ":is_verified": true,
        },
        IndexName: 'email-index',
    }

    return await Dynamo.updateDocument(params);
}

exports.handler = async event => {
    try {
        const userId = event.pathParameters && event.pathParameters.id;
        
        const body = JSON.parse(event.body);

        const verificationStatus = body.verificationStatus;

        const authorization = event.headers && event.headers.Authorization;

        if (!authorization) return Responses._401({ message: 'Unauthorized' });

        const verification = jwt.verify(authorization, process.env.tokenSecret);

        if (!verification || !userId) return Responses._401({ message: 'Unauthorized' });

        status = verificationStatus ? "ACCEPTED" : "REJECTED";
        message = verificationStatus ? "Tu solicitud de verificación ha sido aceptada" : "Tu solicitud de verificación ha sido denegada";

        request_verify = await updateVerificationRequest(userId, status);

        await createNotification(userId, "",  "", message, verification.email);

        if(verificationStatus) await updateUserVerification(userId);
        
        return Responses._200({ success: true, verification:  request_verify});
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not update verification request' });
    }
};
