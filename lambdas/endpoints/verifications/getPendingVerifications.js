const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const jwt = require("jsonwebtoken");

exports.handler = async event => {
    try {
        const isAdmin = (event.queryStringParameters.isAdmin == "true") || (event.queryStringParameters.isAdmin == "True");

        const authorization = event.headers && event.headers.Authorization;

        if (!authorization) return Responses._401({ message: 'Unauthorized' });

        const verification = jwt.verify(authorization, process.env.tokenSecret);

        if (!verification || !isAdmin) return Responses._401({ message: 'Unauthorized' });

        new_verifications = await Dynamo.queryDocumentsSkBegins("#VERIFICATION", "USER#");

        return Responses._200({ success: true, users: new_verifications });
    } catch (error) {
        return Responses._400({ message: 'Could not find user' });
    }
};
