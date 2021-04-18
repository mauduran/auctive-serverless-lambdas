const jwt = require("jsonwebtoken");

const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const S3 = require('../../common/S3');
const allowedMimes = require('../../common/allowedMimes');
const imageUtils = require('../../common/imageUtils');

const addImageUrl = async (email, imgUrl) => {

    let params = {
        Key: {
            "PK": `USER#${email}`,
            "SK": `#PROFILE#${email}`
        },
        UpdateExpression: "set image_url = :image_url",
        ExpressionAttributeValues: {
            ":image_url": imgUrl,
        },
        IndexName: 'email-index',
    }

    return Dynamo.updateDocument(params);
}

exports.handler = async event => {
    console.log(event.body);
    const body = JSON.parse(event.body);

    const authorization = event.headers && event.headers.Authorization;
    const verification = jwt.verify(authorization, process.env.tokenSecret);

    if (!verification) return Responses._401({ message: 'Unauthorized' });

    const email = verification.email;

    if (!body || !body.image) return Responses._400({ error: true, message: "Missing fields!" })

    try {
        image = body.image;
        if(!allowedMimes.includes(body.image.mime)){
            return Responses._400({ message: 'mime is not allowed ' });
        }
        const params  = imageUtils.getImageRequest( process.env.usersBucket, image, email, "profile-pic");
        await S3.upload(params);
        let url = `https://${process.env.usersBucket}.s3.amazonaws.com/${params.Key}`;
        await addImageUrl(email, url);

        return Responses._200({ success: true, message: "Profile pic updated" });
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: "Could not update profile pic." });
    }

};