module.exports = {
    BASE_URL: 'https://api.airbnb.com/v2',
    TOTAL_LISTING_REQUIRED_FOR_LOCATION: 4000,

    QUEUES: {
        BF_PROTECTION: 'BF_PROTECTION_QUEUE',
        BF_PROTECTION_INTERVAL: 1000,
        BF_PROTECTION_METADATA: {
            GET_LISTINGS: 'GET_LISTINGS',
            GET_AVAILABILITY: 'GET_AVAILABILITY',
            GET_REVIEWS: 'GET_REVIEWS'
        },

        FINALIZE: 'FINALIZE',
        FINALIZE_INTERVAL: 100
    },

    LISTINGS: {
        PATH: 'search_results',
        MAX_LIMIT: 50,
        PRICE_RANGES_JUMP: 2,
        MAX_RESULTS_PER_SEARCH: 300
    },

    CALENDAR: {
        PATH: 'calendar_days',
        PAST_DAYS: 89,
        FUTURE_DAYS: 21
    },

    REVIEWS: {
        PATH: 'reviews',
        KEY_WORDS: ['location', 'located', 'central']
    },

    DEMAND_SCORE_CALCULATION: {
        FUTURE_AVAILABILITY: 0.4,
        PAST_AVAILABILITY: 0.2,
        REVIEWS: 0.5
    },

    FINAL_RESULTS_DIVISION: 10
};
