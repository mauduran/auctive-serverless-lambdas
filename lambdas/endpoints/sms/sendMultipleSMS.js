const AWS = require('aws-sdk');

const Responses = require('../../common/API_Responses');

const SNS = new AWS.SNS({apiVersion: '2010-03-31'});

exports.handler = async event => {

    const body = JSON.parse(event.body);

    if(!body || !body.numberList){
        return Responses._400({message: 'Missing fields on the body'});
    }

    const AttributeParams = {
        attributes: {
            DefaultSMSType: 'Transactional',
        }
    }

    const numbers = body.numberList;

    try {

        await numbers.forEach( async function(value) {
            await SNS.setSMSAttributes(AttributeParams).promise();
            await SNS.publish(value).promise(); 
        });

        return Responses._200({success: true, message: 'Messages has been sent!'});
    } catch (error) {
        console.log(error)
        return Responses._400({error: true, message: "Could not send messages!"})
    }
}