'use strict';

const airbnbRequest = require('../services/airbnb-request.service'),
    CONSTANTS = require('../constants'),
    { getQueue } = require('../services/rx-queue.service'),
    { calculateReviewRate } = require('../services/utils.service');

const controller = message => {
    const url = `${CONSTANTS.BASE_URL}/${CONSTANTS.REVIEWS.PATH}`,
        query = {
            role: 'guest',
            listing_id: message.data.listing.id
        },
        finalizeQueue = getQueue(CONSTANTS.QUEUES.FINALIZE);

    airbnbRequest(url, query)
        .then(res => {
            const reviewRate = calculateReviewRate(res.reviews, CONSTANTS.REVIEWS.KEY_WORDS);
            let newMessage = Object.assign({}, message.data);
            newMessage.listing.rate.reviews = reviewRate;
            finalizeQueue.sendMessage(newMessage);
        }).catch(console.log);
};

module.exports = controller;
