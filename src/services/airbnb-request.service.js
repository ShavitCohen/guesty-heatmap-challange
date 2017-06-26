'use strict';

const rp = require('request-promise');

const airBnbRequest = (url, query) => {
    query.client_id = process.env.AIRBNB_CLIENT_ID;

    const rpOptions = {
        method: 'GET',
        uri: url,
        qs: query,
        headers: {
            "User-Agent": "Airbnb/4.7.0 iPhone/8.1.2"
        },
        json: true
    };

    return rp(rpOptions)
};

module.exports = airBnbRequest;
