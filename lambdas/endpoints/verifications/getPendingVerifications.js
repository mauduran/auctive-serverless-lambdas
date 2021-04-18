const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const jwt = require("jsonwebtoken");

exports.handler = async event => {
    try {
        const authorization = event.headers && event.headers.Authorization;

        if (!authorization) return Responses._401({ message: 'Unauthorized' });

        const verification = jwt.verify(authorization, process.env.tokenSecret);
        
        if (!verification) return Responses._401({ message: 'Unauthorized' });

        pending_verifications = await Dynamo.queryDocumentsSkBeginsAndOtherCondition("#VERIFICATION", "USER#", "verification_status", "PENDING");
        return Responses._200({ success: true, pending_verifications: pending_verifications });
    } catch (error) {
        console.log(error)
        return Responses._400({ message: 'Could not get pending verifications' });
    }
};
