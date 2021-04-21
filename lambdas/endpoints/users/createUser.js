const bcrypt = require("bcryptjs");
const Responses = require('../..//common/API_Responses');
const Dynamo = require('../../common/Dynamo');

const createUser = async (name, email, password) => {
    email = email.toLowerCase();
    let hash = await bcrypt.hash(password, 10);

    let user = {
        PK: `USER#${email}`,
        SK: `#PROFILE#${email}`,
        joined: new Date().toISOString(),
        is_verified: false,
        notifications_enabled: false,
        name: name,
        email: email,
        object_type: "USER",
        is_admin: false,
        p_hash: hash,
    }

    return Dynamo.writeIfNotExists(user, 'PK');
}

exports.handler = async event => {
    const body = JSON.parse(event.body);
    if (!body || !body.email || !body.name || !body.password) {
        return Responses._400({ message: 'missing fields in body' });
    }

    const { name, email, password } = body;
    try {
        await createUser(name, email, password);
        return Responses._201({ success: true, message: "User Successfully created" });
    } catch (error) {
        if (error.code && error.code == "ConditionalCheckFailedException") {
            return Responses._409({ error: true, message: "User already exists." });
        }
        return Responses._400({ error: true, message: "Could not process request" });
    }
};
