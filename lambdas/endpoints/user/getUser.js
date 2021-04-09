const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const jwt = require("jsonwebtoken");


const findUserByEmail = async (email) => {
    email = email.toLowerCase();
    const key = {
        "PK": `USER#${email}`,
        "SK": `#PROFILE#${email}`
    }

    return Dynamo.findDocumentByKey(key);
}


exports.handler = async event => {
    console.log(event);


    try {
        const authorization = event.headers && event.headers.Authorization;

        if (!authorization) return Responses._401({ message: 'Unauthorized' });

        const verification = jwt.verify(authorization, process.env.tokenSecret);

        if (!verification) return Responses._401({ message: 'Unauthorized' });
        const email = event.pathParameters && event.pathParameters.email || verification.email;
        user = await findUserByEmail(email);
        delete user.p_hash;
        delete user.session_token;
        return Responses._200({ success: true, user: user });
    } catch (error) {
        return Responses._400({ message: 'Could not find user' });
    }
};
