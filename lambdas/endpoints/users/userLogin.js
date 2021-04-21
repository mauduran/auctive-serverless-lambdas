const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');


const findUserByEmail = async (email) => {
    email = email.toLowerCase();
    const key = {
        "PK": `USER#${email}`,
        "SK": `#PROFILE#${email}`
    }

    return Dynamo.findDocumentByKey(key);
}

const verifyCredentials = async (hash, password) => {
    try {
        const validCredentials = await bcrypt.compare(password, hash);
        if (validCredentials) return Promise.resolve(true);
        throw "Credentials not valid";
    } catch (error) {
        return Promise.reject({message:error});
    }
}

exports.handler = async event => {
    const body = JSON.parse(event.body);
    if (!body || !body.email || !body.password) {
        return Responses._400({ message: 'missing fields in body' });
    }

    const { email, password } = body;
    try {
        const user = await findUserByEmail(email);
        await verifyCredentials(user.p_hash, password);
        const token = jwt.sign({
            email,
            is_admin: user.is_admin
        }, process.env.tokenSecret);
        return Responses._201({ success: true, token: token });
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: "Could not login" });
    }
};
