const jwt = require("jsonwebtoken");
const Responses = require("../../common/API_Responses");
const Dynamo = require("../../common/Dynamo");

exports.handler = async event => {
    const categoryId = event.pathParameters && event.pathParameters.id;
    if (!categoryId) return Responses._400({ error: true, message: "Missing params." })

    const authorization = event.headers && event.headers.Authorization;
    if (!authorization) return Responses._401({ error: true, message: 'Unauthorized' });

    const verification = jwt.verify(authorization, process.env.tokenSecret);
    if (!verification || !verification.is_admin) return Responses._401({ error: true, message: 'Unauthorized' });

    try {
        await Dynamo.deleteDocumentByKey('CATEGORY', `#CATEGORY#${categoryId}`);
        return Responses._201({ success: true, message: "Removed category" });
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: 'Could not delete category' });
    }
};

