const Responses = require('../../common/API_Responses');
const allowedMimes = require('../../common/allowedMimes');
const S3 = require('../../common/S3')


exports.handler = async event => {
    try {
        console.log(event);
        const body = JSON.parse(event.body);

        if (!body || !body.image || !body.mime || !body.auctionId || !body.imageNum) {
            return Responses._400({ message: 'incorrect body on request' });
        }

        if (!allowedMimes.includes(body.mime)) {
            return Responses._400({ message: 'mime is not allowed ' });
        }

        let imageData = body.image;
        const auctionId = body.auctionId;
        const imageNum = body.imageNum;
        if (body.image.substr(0, 7) === 'base64,') {
            imageData = body.image.substr(7, body.image.length);
        }

        let regex = /^data:(.+)\/(.+);base64,(.*)$/;
        let matches = imageData.match(regex);
        let detectedMime = `${matches[1]}/${matches[2]}`;
        let ext = matches[2];
        let data = matches[3];

        let buffer = Buffer.from(data, 'base64');


        if (detectedMime !== body.mime) {
            return Responses._400({ message: 'mime types dont match' });
        }

        const key = `${auctionId}/${imageNum}.${ext}`.replace('#', "_").replace(' ', "_");

        await S3.upload({
            Body: buffer,
            Key: key,
            ContentType: body.mime,
            Bucket: process.env.imageUploadBucket
        });

        const url = `https://${process.env.imageUploadBucket}.s3.amazonaws.com/${key}`;
        return Responses._200({
            imageURL: url,
        });
    } catch (error) {
        console.log('error', error);

        return Responses._400({ message: error.message || 'failed to upload image' });
    }
};
