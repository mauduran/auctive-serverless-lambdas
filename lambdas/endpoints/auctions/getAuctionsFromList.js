const Responses = require('../../common/API_Responses');
const CloudSearch = require('../../common/CloudSearch');

const parseAuction = (auction) => {
    let auction_id = auction.id;

    auction_id = auction_id.split('#');
    auction_id = auction_id[auction_id.length-1];
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
        current_price: auction.current_price && auction.current_price.length && auction.current_price[0],
        current_bidder: auction.current_bidder && auction.current_bidder.length && auction.current_bidder[0],
    }
}

exports.handler = async event => {
    try {
        const body = JSON.parse(event.body);
        if (!body || !body.auctionIds) {
            return Responses._400({ message: 'missing fields in body' });
        }

        if(!body.auctionIds.length) {
            return Responses._200({ success: true, auctions: [] });
        }
        let items = body.auctionIds;

        if(!items.length) return Responses._200({ success: true, auctions: [] });

        items = await CloudSearch.searchByIdList(items);

        items = items.map(auction => parseAuction(auction));
        return Responses._200({ success: true, auctions: items });
    } catch (error) {
        console.log(error);
        return Responses._400({ message: 'Could not find auctions', error: true });
    }
};
