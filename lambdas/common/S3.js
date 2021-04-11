const aws = require('aws-sdk');

aws.config.update({
    region: 'us-east-1',
})

const s3 = new aws.S3();

const S3 = {
    upload(params) {
        return s3.putObject({
            ...params,
            ACL: 'public-read',
        }).promise();
    }
}
module.exports = S3;
