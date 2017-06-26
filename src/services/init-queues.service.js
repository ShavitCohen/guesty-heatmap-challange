const { createQueue } = require('./rx-queue.service'),
    CONSTANTS = require('../constants'),
    activateRequestQueueController = require('../queues-controllers/generic-request'),
    activateFinalizeQueueController = require('../queues-controllers/finalize');

const service = () => {
    createQueue(CONSTANTS.QUEUES.BF_PROTECTION, CONSTANTS.QUEUES.BF_PROTECTION_INTERVAL);
    activateRequestQueueController();

    createQueue(CONSTANTS.QUEUES.FINALIZE, CONSTANTS.QUEUES.FINALIZE_INTERVAL);
    activateFinalizeQueueController();
}
module.exports = service;