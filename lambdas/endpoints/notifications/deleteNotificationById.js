const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const jwt = require("jsonwebtoken");

const deleteNotification = async (email, notificationId) => {
    params = {
        TableName: process.env.AWS_DYNAMODB_TABLE,
        Key: {
            PK: `USER#${email}`,
            SK: `#NOTIFICATION#${notificationId}`
        },
    }
    await Dynamo.deleteDocumentByKey(`USER#${email}`,`#NOTIFICATION#${notificationId}`);
}

exports.handler = async event => {
    try {
        const authorization = event.headers && event.headers.Authorization;
        const verification = authorization && jwt.verify(authorization, process.env.tokenSecret);

        if (!verification) return Responses._401({ message: 'Unauthorized' });
        const email = verification.email;

        const notificationId = event.pathParameters && event.pathParameters.id;

        if (!notificationId) return Responses._401({ error: true, message: 'Missing conversation id' });

        await deleteNotification(email, notificationId);
        return Responses._200({ success: true, message: "Notification removed" });
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not remove notification' });
    }
};

