const getImageRequest = (bucket, image, folder, imageName) => {
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
        throw new Error("mime types don't match");
    }

    const key = `${auctionId}/${imageName}.${ext}`.replace('#', "_").replace(' ', "_");

    return {
        Body: buffer,
        Key: key,
        ContentType: image.mime,
        Bucket: bucket
    }

}

module.exports = {
    getImageRequest
}