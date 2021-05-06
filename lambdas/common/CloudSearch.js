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
            query: `status:"OPEN" AND category:"${category}", ${query} `,
            queryParser: "lucene",

        }

        return CloudSearchRead.search(params).promise()
            .then(result => result.hits.hit);
    },

    async searchAuctionsByPrice(minPrice, maxPrice, query) {
        params = {
            query: `status:"OPEN" AND (buy_now_price:[${minPrice} TO ${maxPrice}]), ${query} `,
            queryParser: "lucene",

        }

        return CloudSearchRead.search(params).promise()
            .then(result => result.hits.hit);
    },
    async searchAuctionsByFilter(query, category, minPrice, maxPrice) {

        let q = 'status:"OPEN"';

        if(category) q +=  ` AND category:"${category}"`;
        if(minPrice || maxPrice) q +=  ` AND ((current_price: [* TO -1]  AND starting_price: [${minPrice} TO ${maxPrice}]) OR (current_price: [${minPrice!='*'?minPrice:0} TO ${maxPrice}]))`;

        q += `, ${query}`;

        params = {
            query: q,
            queryParser: "lucene",
        }

        return CloudSearchRead.search(params).promise()
            .then(result => result.hits.hit);
    },
    async searchAuctionsByPrice(minPrice, maxPrice, query) {
        params = {
            query: `status:"OPEN" AND (buy_now_price:[${minPrice} TO ${maxPrice}]), ${query} `,
            queryParser: "lucene",
        }
        return CloudSearchRead.search(params).promise()
            .then(result => result.hits.hit);
    },

    async searchAuctionsByPriceAndCategory(minPrice, maxPrice, category, query) {
        params = {
            query: `status:"OPEN" AND category:"${category}" AND (buy_now_price:[${minPrice} TO ${maxPrice}]), ${query} `,
            queryParser: "lucene",
        }

        return CloudSearchRead.search(params).promise()
            .then(result => result.hits.hit);
    },

    async searchByIdList(idList) {
        let queries = idList.join(" OR ");
        params = {
            query: `auction_id: (${queries})`,
            queryParser: "lucene",
        }

        return CloudSearchRead.search(params).promise()
            .then(result => result.hits.hit);
    },

    async searchAuctions(query) {
        params = {
            query: `status:"OPEN", ${query}`,
            queryParser: "lucene",
        }
        return CloudSearchRead.search(params).promise()
            .then(result => result.hits.hit);
    }
}



module.exports = CloudSearch