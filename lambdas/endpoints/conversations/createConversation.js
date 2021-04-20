const jwt = require("jsonwebtoken");

const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');

const { v4: uuidv4 } = require('uuid');

const createConversation = async (auctionId, bidderEmail, auctionOwnerEmail) => {
    let conversationId = uuidv4();

    let conversation = {
        PK: `AUCTION#${auctionId}`,
        SK: `#CONVERSATION#${conversationId}`,
        auctionId: auctionId,
        conversation_id: conversationId,
        bidder_email: bidderEmail,
        last_message_date: new Date().toISOString(),
        last_message_sender: "",
        last_message_value: "",
        seller_email: auctionOwnerEmail,
    }

    await Dynamo.writeIfNotExists(conversation, 'PK');
    return conversation;
}

const createNotification = async (email, auctionId, auctionTitle, message, emitter) => {
    let notificationId = uuidv4();

    let notification = {
        PK: `USER#${email}`,
        SK: `#NOTIFICATION#${notificationId}`,
        notification_id: notificationId,
        auctionId: auctionId,
        auctionTitle: auctionTitle,
        message: message,
        date: new Date().toISOString(),
        emitter: emitter
    }

    return Dynamo.writeIfNotExists(notification, 'PK');
}

exports.handler = async event => {
    const body = JSON.parse(event.body);

    const authorization = event.headers && event.headers.Authorization;
    const verification = jwt.verify(authorization, process.env.tokenSecret);
    
    if (!verification) return Responses._401({ message: 'Unauthorized' });

    const { auctionId, auctionOwnerEmail, auctionTitle } = body;

    if (!auctionId ||  !auctionOwnerEmail || !auctionTitle) return Responses._400({ error: true,
        message: "Missing required fields"})

    const bidder_email = verification.email;

    try {
        const conversation = await createConversation(auctionId, bidder_email, auctionOwnerEmail);
        await createNotification(auctionOwnerEmail, auctionId,  auctionTitle, "Alguien ha pujado", bidder_email);
        return Responses._200({ success: true, message: "Conversation created!", conversation});
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: "Could not create conversation" });
    }

};