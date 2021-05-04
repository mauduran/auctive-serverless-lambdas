const jwt = require("jsonwebtoken");
const Responses = require("../../common/API_Responses");
const Dynamo = require("../../common/Dynamo");

exports.handler = async event => {
    
    const authorization = event.headers && event.headers.Authorization;
    if (!authorization) return Responses._401({ error: true, message: 'Unauthorized' });
    
    const verification = jwt.verify(authorization, process.env.tokenSecret);
    if (!verification || !verification.is_admin) return Responses._401({ error: true, message: 'Unauthorized' });
    
    const categoryId = event.pathParameters && event.pathParameters.id;
    if (!categoryId) return Responses._400({ error: true, message: "Missing params." });

    const body = JSON.parse(event.body);

    try {
        const params = {
            Key: {
                "PK": `CATEGORY`,
                "SK": `#CATEGORY#${categoryId}`,
            },
            UpdateExpression: "SET #data = :data",
            ExpressionAttributeNames: {
                "#data": 'data'
            },
            ExpressionAttributeValues: {
                ":data": body,
            },
        }

        const updatedCategory = await Dynamo.updateDocument(params);

        return Responses._200({ success: true, message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: 'Could not update category' });
    }
};

