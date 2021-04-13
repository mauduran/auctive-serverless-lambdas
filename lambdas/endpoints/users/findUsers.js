const jwt = require("jsonwebtoken");

const Responses = require('../..//common/API_Responses');
const Dynamo = require('../../common/Dynamo');

const findUsers = async (query) => {
    
    let params = {
        IndexName: 'email-index',
        FilterExpression : 'contains (#user_email, :user_email) OR contains (#user_name, :user_name)',
        ExpressionAttributeNames: {
            "#user_email": "email",
            "#user_name": "name",
        },
        ExpressionAttributeValues: {
            ":user_email": query,
            ":user_name": query,
        }       
    }

    return Dynamo.scanDocument(params);
}

exports.handler = async event => {

    const authorization = event.headers && event.headers.Authorization;
    const verification = jwt.verify(authorization, process.env.tokenSecret);

    if (!verification) return Responses._401({ message: 'Unauthorized' });

    const query = event.queryStringParameters.query;
    try {
        let users = await findUsers(query);
        return Responses._200({ success: true, message: "Here is a user list", users : users });
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: "Could not change password" });
    }

};