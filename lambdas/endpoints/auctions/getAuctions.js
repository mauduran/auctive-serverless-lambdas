const Responses = require('../../common/API_Responses');
const CloudSearch = require('../../common/CloudSearch');

const parseAuction = (auction) => {
    let auction_id = auction.id;
    auction = auction.fields;
    return {
        auction_id, auction_id,
        title: auction.title[0],
        category: auction.category[0],
        description: auction.description[0],
        end_date: auction.end_date[0],
        owner_email: auction.owner_email[0],
        buy_now_price: auction.buy_now_price && auction.buy_now_price.length && auction.buy_now_price[0],
        product_img_urls: auction.product_img_urls,
        start_date: auction.start_date[0],
        starting_price: auction.starting_price[0],
        status: auction.status[0],
        tags: auction.tags,
        current_bid: auction.current_bid && auction.current_bid.length && auction.current_bid[0],
        current_bidder: auction.current_bidder && auction.current_bidder.length && auction.current_bidder[0],
    }
}

exports.handler = async event => {
    console.log(event);
    const query = event.queryStringParameters && event.queryStringParameters.q || '';
    
    const category = event.queryStringParameters && event.queryStringParameters.category;
    try {
        let items = [];
        if (category) {
            items = await CloudSearch.searchAuctionsByCategory(category, query);
        } else {
            items = await CloudSearch.searchAuctions(query);
        }

        items = items.map(auction => parseAuction(auction));
        return Responses._200({ success: true, auctions: items });
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not find auctions', error: true });
    }
};
