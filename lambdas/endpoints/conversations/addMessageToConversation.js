const jwt = require("jsonwebtoken");

const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');

const { v4: uuidv4 } = require('uuid');


const createMessage = async (conversationId, messageBody, senderEmail, senderName, dateMessage) => {
    const messageId = uuidv4();

    let conversation = {
        PK: `CONVERSATION#${conversationId}`,
        SK: `#MESSAGE#${messageId}`,
        date: dateMessage,
        message_body: messageBody,
        sender: senderEmail,
        sender_name: senderName,
    }

    return Dynamo.writeIfNotExists(conversation, 'PK');
}

const updateConversation = async (auctionId, conversationId, message_sender, messageBody, dateMessage) => {

    let params = {
        Key: {
            "PK": `AUCTION#${auctionId}`,
            "SK": `#CONVERSATION#${conversationId}`,
        },
        UpdateExpression: "set last_message_date = :last_message_date, last_message_sender = :last_message_sender, last_message_value = :last_message_value",
        ExpressionAttributeValues: {
            ":last_message_date": dateMessage,
            ":last_message_sender": message_sender,
            ":last_message_value": messageBody,
        },
    }

    return await Dynamo.updateDocument(params);
}

exports.handler = async event => {
    const body = JSON.parse(event.body);

    const authorization = event.headers && event.headers.Authorization;
    const verification = jwt.verify(authorization, process.env.tokenSecret);
    
    if (!verification) return Responses._401({ message: 'Unauthorized' });

    const { conversationId, messageBody, senderName, auctionId } = body;

    const senderEmail = verification.email;

    if (!conversationId ||  !messageBody || !senderEmail || !senderName || !auctionId) return Responses._400({ error: true,
        message: "Missing required fields"})

        
    const dateMessage = new Date().toISOString();

    try {
        await createMessage(conversationId, messageBody, senderEmail, senderName, dateMessage);
        conversation = await updateConversation(auctionId, conversationId, senderEmail, messageBody, dateMessage);
        return Responses._200({ success: true, message: "Message added to conversation!", conversation_updated: conversation});
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: "Could not add message!" });
    }

};