const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const jwt = require("jsonwebtoken");


const findUsersByEmailList = async (emailList) => {
    var AttributeValuesObject = {};
    AttributeValuesObject[':user'] = "USER";
  
    var emails = emailList;
    var emailMap = {}; 
    var index = 0; 
    
    emails.forEach(function(value) {
      index++;
      var titleKey = ":email"+index;
      AttributeValuesObject[titleKey.toString()] = value;
      emailMap[titleKey.toString()] = value;
    });

    var params = {
      IndexName:"object_type-index",
      KeyConditionExpression: "object_type = :user",
      ExpressionAttributeValues: AttributeValuesObject,
      FilterExpression: "email IN ("+Object.keys(emailMap).toString()+ ")"
    };
  
    return Dynamo.queryDocuments(params);
}


exports.handler = async event => {
    try {
        const authorization = event.headers && event.headers.Authorization;

        if (!authorization) return Responses._401({ message: 'Unauthorized' });

        const verification = jwt.verify(authorization, process.env.tokenSecret);

        if (!verification) return Responses._401({ message: 'Unauthorized' });

        const emailList = JSON.parse(event.queryStringParameters.list);

        if (!emailList) return Responses._400({ error: true, message: "Missing required fields" });

        usersList = await findUsersByEmailList(emailList);

        return Responses._200({ success: true, usersList: usersList });
    } catch (error) {
        console.log(error)
        return Responses._400({ message: 'Could not find users' });
    }
};
