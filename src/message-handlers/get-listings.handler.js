'use strict';

const airbnbRequest = require('../services/airbnb-request.service'),
    CONSTANTS = require('../constants'),
    { getQueue } = require('../services/rx-queue.service'),
    { setLastListing } = require('../services/last-listing.service'),
    { mapListing } = require('../services/utils.service');

let currentID,
    uniqueObj = {};

const controller = message => {
    if (message.data.mapId !== currentID) {
        currentID = message.data.mapId;
        uniqueObj = {};
    }

    const url = `${CONSTANTS.BASE_URL}/${CONSTANTS.LISTINGS.PATH}`,
        BFProtectionQ = getQueue(CONSTANTS.QUEUES.BF_PROTECTION),
        query = {
            location: message.data.location,
            _limit: message.data.limit,
            _offset: message.data.offset,
            price_min: message.data.price[0],
            price_max: message.data.price[1]
        };

    airbnbRequest(url, query)
        .then(res => {
            res.search_results
                .map(obj => mapListing(obj.listing))
                .filter(listing => {
                    if (uniqueObj[listing.id]) {
                        return false;
                    }
                    uniqueObj[listing.id] = true;
                    return true;
                })
                .forEach(listing => {
                    console.log(listing.id);
                    let newMessage = Object.assign({}, message.data);
                    newMessage.listing = listing;
                    setLastListing(message.data.mapId, listing.id);
                    BFProtectionQ.sendMessage(newMessage, CONSTANTS.QUEUES.BF_PROTECTION_METADATA.GET_AVAILABILITY);
                });
        }).catch(console.log);
};

module.exports = controller;
