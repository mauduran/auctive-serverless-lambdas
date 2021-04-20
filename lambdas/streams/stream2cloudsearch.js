const CloudSearch = require('../common/CloudSearch');

const EVENT_MAPPING = {
    "INSERT": 'add',
    "MODIFY": 'add',
    "REMOVE": 'delete'
}

const createAuctionCsRequest = (id, record, operation) => {
    let request = {
        type: operation,
        id: id
    }
    if (operation == 'add') {
        let fields = {
            auction_id: record.auction_id && record.auction_id.S || id,
            end_date: record.end_date.S,
            owner_email: record.owner_email.S,
            description: record.description.S,
            title: record.title.S,
            starting_price: record.starting_price.N,
            buy_now_price: record.buy_now_price.N,
            category: record.category.S,
            product_img_urls: record.product_img_urls && record.product_img_urls.L.map(url => url.S) || [],
            start_date: record.start_date.S,
            status: record.auction_status && record.auction_status.S  || record.status && record.status.S,
            current_price: record.current_price && record.current_price.N
        };

        if (record.tags) {
            tags = record.tags.L.map(el => el.S);
        } 
        fields['tags'] = tags || [];

        request['fields'] = fields
    }

    return request;
}


const processRecord = (record) => {
    const pk = record.dynamodb.Keys.PK.S;
    const sk = record.dynamodb.Keys.SK.S;

    if (pk.includes("AUCTION#") && sk.includes("#AUCTION_USER#")) {
        return createAuctionCsRequest(pk, record.dynamodb.NewImage, EVENT_MAPPING[record.eventName]);
    }
    return null;

}

const writeStreamToCloudSearch = async (event) => {
    let requests = [];

    console.log(event);
    try {
        for (const record of event.Records) {
            let request = processRecord(record);

            if (request) {
                requests.push(request);
            }
        }
        if (requests.length) await CloudSearch.uploadDocuments(requests);
        return `Successfully processed ${requests.length} records.`;
    }
    catch (err) {
        console.log(err);
        return "Could not process records;"
    }
}

exports.handler = async (event, context) => {
    return writeStreamToCloudSearch(event);
}
