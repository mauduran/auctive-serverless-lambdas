const Responses = require('../../common/API_Responses');
const S3 = require('../../common/S3');
const allowedMimes = require('../../common/allowedMimes');
const imageUtils = require('../../common/imageUtils');

exports.handler = async event => {
    try {

        const body = JSON.parse(event.body);

        if (!body || !body.images || !body.images.length || !body.auctionId) {
            return Responses._400({ message: 'incorrect body on request' });
        }

        for (let i = 0; i < body.images.length; i++) {
            if (!allowedMimes.includes(body.images[i].mime)) {
                return Responses._400({ message: 'mime is not allowed ' });
            }
        }

        const urls = []

        body.images.map((image, idx) => {
            params = imageUtils.getImageRequest(process.env.imageUploadBucket, image, body.auctionId, idx);
            // getImageRequest(image, body.auctionId, idx);
            urls.push(`https://${process.env.imageUploadBucket}.s3.amazonaws.com/${params.Key}`)
            return S3.upload(params);
        })

        await Promise.all(body.images);

        return Responses._200({
            imageURLs: urls,
        });
    } catch (error) {
        console.log('error', error);

        return Responses._400({ message: error.message || 'failed to upload image' });
    }
};
