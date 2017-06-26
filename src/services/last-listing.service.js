let obj = {};

const setLastListing = (mapId, listingId) => {
    obj[mapId] = listingId;
};

const getLastListing = (mapId) => {
    return obj[mapId];
};

module.exports = {
    setLastListing,
    getLastListing
};
