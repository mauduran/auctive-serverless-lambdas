const jwt = require("jsonwebtoken");
const Responses = require("../../common/API_Responses");
const Dynamo = require("../../common/Dynamo");

const createCategory = async (categoryName) => {
    let user = {
        PK: `CATEGORY`,
        SK: `#CATEGORY#${categoryName}`,
        category_name: categoryName
    }
    return Dynamo.writeIfNotExists(user, 'SK');
}

exports.handler = async event => {
    const authorization = event.headers && event.headers.Authorization;
    if (!authorization) return Responses._401({ error: true, message: 'Unauthorized' });

    const verification = jwt.verify(authorization, process.env.tokenSecret);
    if (!verification || !verification.is_admin) return Responses._401({ error: true, message: 'Unauthorized' });

    const body = JSON.parse(event.body);
    if (!body || !body.categoryName) {
        return Responses._400({ error: true, message: 'Missing field in body' });
    }

    try {
        categoryName = body.categoryName.charAt(0).toUpperCase() + body.categoryName.slice(1).toLowerCase();
        await createCategory(categoryName);

        return Responses._201({ success: true, message: "Category created" });
    } catch (error) {
        return Responses._400({ error: true, message: 'Could not create category ' });
    }
};