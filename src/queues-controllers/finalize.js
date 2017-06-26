'use strict';

const { getQueue } = require('../services/rx-queue.service'),
    CONSTANTS = require('../constants'),
    { getLastListing } = require('../services/last-listing.service'),
    { calculateFinalScore, sortAndSplice, createHTMLFile } = require('../services/utils.service');

const queueController = () => {
    const queue = getQueue(CONSTANTS.QUEUES.FINALIZE);
    let mapsObj = {};

    queue.stream$.subscribe(message => {

        const mapId = message.data.mapId;
        let listing = Object.assign({}, message.data.listing);
        listing.rate.score = calculateFinalScore(listing.rate);
        mapsObj[mapId] = mapsObj[mapId] || [];
        mapsObj[mapId].push(listing);

        if (getLastListing(mapId) == listing.id) {
            const totalResults = mapsObj[mapId].length,
                arr = sortAndSplice(mapsObj[mapId], CONSTANTS.FINAL_RESULTS_DIVISION);
            createHTMLFile(message.data.mapId, arr, totalResults)
                .then(() => {
                    //send email to user notify success and send url (e.g localhost:3000/${mapId}.html)
                    delete mapObj[mapId];//cleaning memory
                })
                .catch(err => {
                    // send email to user notify failure and say sorry
                })
        }
    });
};

module.exports = queueController;
