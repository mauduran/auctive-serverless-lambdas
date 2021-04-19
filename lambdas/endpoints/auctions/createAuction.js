const jwt = require("jsonwebtoken");
const Responses = require('../../common/API_Responses');
const Dynamo = require('../../common/Dynamo');
const S3 = require('../../common/S3');
const allowedMimes = require('../../common/allowedMimes');
const imageUtils = require('../../common/imageUtils');
const { v4: uuidv4 } = require('uuid');


const createAuction = async (auctionId, email, buy_now_price, category, description, product_img_urls, starting_price, tags, title, duration) => {
    const start_date = new Date();
    const end_date = new Date();
    end_date.setHours(start_date.getHours() + duration);

    let auction = {
        PK: `AUCTION#${auctionId}`,
        SK: `#AUCTION_USER#${email}`,
        auction_id : auctionId,
        buy_now_price : buy_now_price,
        category : category,
        description : description,
        product_img_urls: product_img_urls,
        starting_price : starting_price,
        status: "OPEN",
        tags : tags,
        title : title,
        start_date : start_date.toISOString(),
        end_date : end_date.toISOString(),
        owner_email : email,
        current_price : -1
    }

    return Dynamo.writeIfNotExists(auction, 'PK');
}


exports.handler = async event => {
    
    try {
        const body = JSON.parse(event.body);
    
        const authorization = event.headers && event.headers.Authorization;
        const verification = jwt.verify(authorization, process.env.tokenSecret);
        
        if (!verification) return Responses._401({ message: 'Unauthorized' });
    
        const { buy_now_price, category, description, starting_price, tags, title, duration, images } = body;
    
        const email = verification.email;
    
        if (!buy_now_price ||  !category || !description || !starting_price || !tags || !title || !duration || !images) 
            return Responses._400({ error: true, message: "Missing required fields"})
        
        const auctionId = uuidv4();

        for (let i = 0; i < images.length; i++) {
            if (!allowedMimes.includes(images[i].mime)) {
                return Responses._400({ message: 'mime is not allowed ' });
            }
        }

        const urls = []

        let uploadRequests = images.map((image, idx) => {
            params = imageUtils.getImageRequest(process.env.imageUploadBucket, image, auctionId, idx);
            urls.push(`https://${process.env.imageUploadBucket}.s3.amazonaws.com/${params.Key}`)
            return S3.upload(params);
        })

        await Promise.all(uploadRequests);


        await createAuction(auctionId, email, buy_now_price, category, description, urls, starting_price, tags, title, duration);
        
        return Responses._201({ success: true, message: "Auction succesfully created!"});
    } catch (error) {
        console.log(error);
        return Responses._400({ error: true, message: "Could not create auction!" });
    }

};