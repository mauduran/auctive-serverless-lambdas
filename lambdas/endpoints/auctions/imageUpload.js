const Responses = require('../../common/API_Responses');
const allowedMimes = require('../../common/allowedMimes');
const imageUtils = require('../../common/imageUtils');
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

        params = imageUtils.getImageRequest(process.env.imageUploadBucket, body.image, body.auctionId, body.imageNum);

        await S3.upload(params);

        const url = `https://${process.env.imageUploadBucket}.s3.amazonaws.com/${params.key}`;
        return Responses._200({
            imageURL: url,
        });
    } catch (error) {
        console.log('error', error);

        return Responses._400({ message: error.message || 'failed to upload image' });
    }
};
