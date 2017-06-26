'use strict';

const { getQueue } = require('../services/rx-queue.service'),
    CONSTANTS = require('../constants'),
    uuid = require('node-uuid'),
    airbnbRequest = require('../services/airbnb-request.service'),
    { getLocationListingsCount, producePriceGapArray, createListingMessagesArray, getMapToBeReadyETA } = require('../services/utils.service');

const controller = (req, res) => {
    if (!validateRequest(req.query)) {
        res.status(400).json({ error: 'location and property_type and valid email address are required' });
        return;
    }

    //querying the metadata in order to get the number of listing available and the average listing price
    airbnbRequest(`${CONSTANTS.BASE_URL}/${CONSTANTS.LISTINGS.PATH}`, Object.assign({ _limit: 1 }, req.query))
        .then(metadataRes => {
            const locationListingsCount = getLocationListingsCount(metadataRes.metadata);

            if (locationListingsCount < CONSTANTS.TOTAL_LISTING_REQUIRED_FOR_LOCATION) {
                metadataRes.status(400).json({ error: `Location must have more than 4000 listings has only ${locationListingsCount}` });
                return;
            }

            const mapId = uuid.v4(),
                BFProtectionQ = getQueue(CONSTANTS.QUEUES.BF_PROTECTION),
                priceGapArray = producePriceGapArray(metadataRes.metadata.price_histogram.average_price, CONSTANTS.LISTINGS.PRICE_RANGES_JUMP),
                { location, property_type, email } = req.query;

            createListingMessagesArray(location, property_type, email, CONSTANTS.LISTINGS.MAX_LIMIT, mapId, priceGapArray, CONSTANTS.LISTINGS.MAX_RESULTS_PER_SEARCH, locationListingsCount)
                .forEach(item => BFProtectionQ.sendMessage(item, CONSTANTS.QUEUES.BF_PROTECTION_METADATA.GET_LISTINGS));

            res.status(200).json({
                status: 'in progress',
                action: `An email will be sent to the following address once the map will be ready: ${email}`,
                mapUrl: `http://localhost:3000/${mapId}.html`,
                ETA: getMapToBeReadyETA(locationListingsCount)
            });
        }).catch(console.log);
};

const validateRequest = (reqBody) => {
    return reqBody.location && reqBody.property_type && reqBody.email;
};

module.exports = controller;

