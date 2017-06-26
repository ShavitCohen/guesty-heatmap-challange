'use strict';

const { getQueue } = require('../services/rx-queue.service'),
    listingMessageHandler = require('../message-handlers/get-listings.handler'),
    availabilityMessageHandler = require('../message-handlers/get-availablity.handler'),
    reviewsMessageHandler = require('../message-handlers/get-reviews.handler'),
    CONSTANTS = require('../constants');

const queueController = () => {

    const queue = getQueue(CONSTANTS.QUEUES.BF_PROTECTION);
    queue.stream$.subscribe(message => {
        switch (message.metadata) {
            case CONSTANTS.QUEUES.BF_PROTECTION_METADATA.GET_LISTINGS:
                listingMessageHandler(message);
                break;

            case CONSTANTS.QUEUES.BF_PROTECTION_METADATA.GET_AVAILABILITY:
                availabilityMessageHandler(message);
                break;

            case CONSTANTS.QUEUES.BF_PROTECTION_METADATA.GET_REVIEWS:
                reviewsMessageHandler(message);
                break;
        }
    });
};

module.exports = queueController;
