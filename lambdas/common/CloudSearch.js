const aws = require('aws-sdk');

let CloudSearchRead = new aws.CloudSearchDomain({
    region: process.env.region,
    endpoint: process.env.cloudSearchEndpoint,
    apiVersion: '2013-01-01'
});

let CloudSearchWrite = new aws.CloudSearchDomain({
    region: process.env.region,
    endpoint: process.env.cloudSearchDocEndpoint,
    apiVersion: '2013-01-01'
});


const CloudSearch = {
    async uploadDocuments(requests) {
        var params = {
            contentType: 'application/json',
            documents: JSON.stringify(requests)
        }
        return new Promise((resolve, reject) => {
            CloudSearchWrite.uploadDocuments(params, function (err, data) {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        })
    },

    async searchAuctionsByCategory(category, query) {
        params = {
            query: `category:'${category}, ${query}'`,
            queryParser: "lucene",
            size: 20
        }

        return CloudSearchRead.search(params).promise()
            .then(result => result.hits.hit);
    },

    async searchAuctions(query) {
        params = {
            query,
            size: 20

        }

    return CloudSearchRead.search(params).promise()
            .then(result => result.hits.hit);
    }
}




module.exports = CloudSearch