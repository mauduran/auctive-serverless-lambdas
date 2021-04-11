const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const verifyCredentials = async (hash, password) => {
    try {
        const validCredentials = await bcrypt.compare(password, hash);
        if (validCredentials) return Promise.resolve(true);
        throw "Credentials not valid";
    } catch (error) {
        return Promise.reject({ message: error });
    }
}

const findUserByEmail = async (email) => {
    email = email.toLowerCase();
    const key = {
        "PK": `USER#${email}`,
        "SK": `#PROFILE#${email}`
    }
    return Dynamo.findDocumentByKey(key);
}

const changePassword = async (email, newPassword) => {
    email = email.toLowerCase();
    let hash = await bcrypt.hash(newPassword, 10);

    params = {
        Key: {
            "PK": `USER#${email}`,
            "SK": `#PROFILE#${email}`
        },
        UpdateExpression: "set p_hash = :p_hash",
        ExpressionAttributeValues: {
            ":p_hash": hash,
        },
    }

    return Dynamo.updateDocument(params);
};

exports.handler = async event => {
    const body = JSON.parse(event.body);

    const authorization = event.headers && event.headers.Authorization;
    const verification = jwt.verify(authorization, process.env.tokenSecret);
    if (!verification) return Responses._401({ message: 'Unauthorized' });

    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) return Responses._400({ error: true, message: "Missing required fields" });
    try {
        const user = await findUserByEmail(verification.email);
        await verifyCredentials(user.p_hash, currentPassword);
        await changePassword(verification.email, newPassword);
        return Responses._200({ success: true, message: "Password changed!" });
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: "Could not change password" });
    }

};
