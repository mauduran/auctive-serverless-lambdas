const Responses = require('../../common/API_Responses');
const S3 = require('../../common/S3');
const allowedMimes = require('../../common/allowedMimes');

const getImageRequest = (image, auctionId, imageNum) => {
    if (image.image.substr(0, 7) === 'base64,') {
        image.image = image.image.substr(7, image.image.length);
    }

    const regex = /^data:(.+)\/(.+);base64,(.*)$/;
    const matches = image.image.match(regex);
    const detectedMime = `${matches[1]}/${matches[2]}`;
    const ext = matches[2];
    const data = matches[3];

    let buffer = Buffer.from(data, 'base64');


    if (detectedMime !== image.mime) {
        return Responses._400({ message: 'mime types dont match' });
    }

    const key = `${auctionId}/${imageNum}.${ext}`.replace('#', "_").replace(' ', "_");

    return {
        Body: buffer,
        Key: key,
        ContentType: image.mime,
    }

}

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
            params = getImageRequest(image, body.auctionId, idx);
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
