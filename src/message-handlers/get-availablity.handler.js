'use strict';

const airbnbRequest = require('../services/airbnb-request.service'),
    CONSTANTS = require('../constants'),
    { getQueue } = require('../services/rx-queue.service'),
    { calculateAvailabilityRate } = require('../services/utils.service');

const controller = (message) => {
    const url = `${CONSTANTS.BASE_URL}/${CONSTANTS.CALENDAR.PATH}`,
        BFProtectionQ = getQueue(CONSTANTS.QUEUES.BF_PROTECTION);

    let future = new Date(),
        past = new Date();

    const now = new Date(),
        nowDateString = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
            .map((item) => {
                return (item.toString().length === 1) ? '0' + item : item;
            }).join('-');


    past.setDate(past.getDate() - CONSTANTS.CALENDAR.PAST_DAYS);
    future.setDate(future.getDate() + CONSTANTS.CALENDAR.FUTURE_DAYS);

    const query = {
        listing_id: message.data.listing.id,
        start_date: `${past.getFullYear()}-${past.getMonth() + 1}-${past.getDate()}`,
        end_date: `${future.getFullYear()}-${future.getMonth() + 1}-${future.getDate()}`
    };

    airbnbRequest(url, query)
        .then(res => {
            const availabilityRate = calculateAvailabilityRate(res.calendar_days, nowDateString);
            let newMessage = Object.assign({}, message.data);
            newMessage.listing.rate.availability = availabilityRate;
            BFProtectionQ.sendMessage(newMessage, CONSTANTS.QUEUES.BF_PROTECTION_METADATA.GET_REVIEWS);
        })
        .catch(console.log);
};

module.exports = controller;
