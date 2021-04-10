const Responses = require("../../common/API_Responses");
const Dynamo = require("../../common/Dynamo");

exports.handler = async event => {
    try {
        items = await Dynamo.queryDocumentsSkBegins('CATEGORY', '#CATEGORY#');
        return Responses._200({ success: true, categories: items });
    } catch (error) {
        return Responses._400({ error: true, message: 'Could not get categories ' });
    }
};

