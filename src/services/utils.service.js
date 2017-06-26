const fs = require('fs'),
    CONSTANTS = require('../constants');


const getLocationListingsCount = (metadata) => {
    const roomTypesArr = metadata.facets.room_type;
    return roomTypesArr.reduce((a, room) => {
        a += room.count;
        return a;
    }, 0);
};

const producePriceGapArray = (averagePrice, jump) => {
    const min = parseInt(averagePrice / 3),
        max = parseInt(averagePrice * 3);
    let arr = [];
    for (let i = min; i < max; i += jump) {
        arr.push([i, i + jump]);
    }
    return arr;
};

const createListingMessagesArray = (location, property_type, email, limitPerRequest, mapId, priceGapArray, maxResultsPerSearch, locationListingsCount) => {
    let messagesArr = [];

    priceGapArray.forEach(priceGap => {
        for (let i = 0; i < maxResultsPerSearch / limitPerRequest; i++) {
            const obj = {
                location: location,
                limit: limitPerRequest,
                offset: i * limitPerRequest,
                property_type: property_type,
                email: email,
                locationListingCount: locationListingsCount,
                mapId: mapId,
                price: priceGap
            };
            messagesArr.push(obj);
        }
    });

    return messagesArr;
};

const calculateAvailabilityRate = (availabilityArr, nowDate) => {
    let attribute = 'past',
        isCounting = false,
        dayCount = 0,
        availabilityCount = 0;

    return availabilityArr.reduce((a, day) => {
        if (!day.available) {
            isCounting = true;
            availabilityCount++;
        }
        if (isCounting) {
            dayCount++;
        }

        a[attribute] = (availabilityCount > 0) ? availabilityCount / dayCount : 0;

        if (day.date === nowDate) {
            attribute = 'future';
            dayCount = 0;
            availabilityCount = 0;
        }
        return a;
    }, {});
};

const mapListing = listing => {
    return {
        id: listing.id,
        lat: listing.lat,
        lng: listing.lng,
        reviews_count: listing.reviews_count,
        rate: {
            availability: {
                future: 0,
                past: 0
            },
            reviews: 0,
            score: 0
        }
    }
};

//convenient location, Located, location, central,
const calculateReviewRate = (reviewsArr, keyWords) => {
    if (reviewsArr.length === 0) {
        return 0;
    }

    let keyWordFoundCount = 0;
    return reviewsArr
        .map(review => review.comments.toLowerCase())
        .reduce((a, comment, i) => {
            keyWordFoundCount = _isKeywordShownInComment(comment, keyWords) ? ++keyWordFoundCount : keyWordFoundCount;
            a = keyWordFoundCount / (i + 1);
            return a;
        }, 0);
};

const _isKeywordShownInComment = (comment, keyWords) => {
    for (let i = 0; i < keyWords.length; i++) {
        const regex = new RegExp(keyWords[i], 'g');
        if (comment.match(regex)) {
            return true;
        }
    }
    return false;
};

const calculateFinalScore = (rate) => {
    return (rate.availability.future * CONSTANTS.DEMAND_SCORE_CALCULATION.FUTURE_AVAILABILITY) +
        (rate.availability.past * CONSTANTS.DEMAND_SCORE_CALCULATION.PAST_AVAILABILITY) +
        (rate.reviews * CONSTANTS.DEMAND_SCORE_CALCULATION.REVIEWS);
};

const createHTMLFile = (mapId, arr, totalResults) => {
    return new Promise((resolve, reject) => {
        const coordinates = arr.map((listing => {
            return `new google.maps.LatLng(${listing.lat}, ${listing.lng})`;
        })).join(`,`),
            str = `<!DOCTYPE html> <html>   <head>     <meta charset="utf-8">     <title>Heatmap - showing ${arr.length} from ${totalResults} listings</title>     <style>       #map {         height: 100%;       }       html, body {         height: 100%;         margin: 0;         padding: 0;       }       #floating-panel {         position: absolute;         top: 10px;         left: 25%;         z-index: 5;         background-color: #fff;         padding: 5px;         border: 1px solid #999;         text-align: center;         font-family: 'Roboto','sans-serif';         line-height: 30px;         padding-left: 10px;       }       #floating-panel {         background-color: #fff;         border: 1px solid #999;         left: 25%;         padding: 5px;         position: absolute;         top: 10px;         z-index: 5;       }     </style>   </head>    <body>     <div id="floating-panel">       <button onclick="toggleHeatmap()">Toggle Heatmap</button>       <button onclick="changeGradient()">Change gradient</button>       <button onclick="changeRadius()">Change radius</button>       <button onclick="changeOpacity()">Change opacity</button>     </div>     <div id="map"></div>     <script>        var map, heatmap;        function initMap() {         map = new google.maps.Map(document.getElementById('map'), {           zoom: 13,           center: {lat: ${arr[0].lat}, lng: ${arr[0].lng}},           mapTypeId: 'satellite'         });          heatmap = new google.maps.visualization.HeatmapLayer({           data: getPoints(),           map: map         });       }        function toggleHeatmap() {         heatmap.setMap(heatmap.getMap() ? null : map);       }        function changeGradient() {         var gradient = [           'rgba(0, 255, 255, 0)',           'rgba(0, 255, 255, 1)',           'rgba(0, 191, 255, 1)',           'rgba(0, 127, 255, 1)',           'rgba(0, 63, 255, 1)',           'rgba(0, 0, 255, 1)',           'rgba(0, 0, 223, 1)',           'rgba(0, 0, 191, 1)',           'rgba(0, 0, 159, 1)',           'rgba(0, 0, 127, 1)',           'rgba(63, 0, 91, 1)',           'rgba(127, 0, 63, 1)',           'rgba(191, 0, 31, 1)',           'rgba(255, 0, 0, 1)'         ];         heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);       }        function changeRadius() {         heatmap.set('radius', heatmap.get('radius') ? null : 20);       }        function changeOpacity() {         heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);       }       function getPoints() {         return [${coordinates}];}</script><script async defer src="https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}&libraries=visualization&callback=initMap"></script></body></html>`;
        fs.writeFile(`maps/${mapId}.html`, str, { flag: 'wx' }, function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    })

};

const sortAndSplice = (arr, division) => {
    arr.sort(function (a, b) {
        return parseFloat(b.rate.score) - parseFloat(a.rate.score);
    });
    arr.splice(arr.length / division);
    return arr;
};

const _secondsToHHMMSS = function (sec_num) {
    let hours = Math.floor(sec_num / 3600),
        minutes = Math.floor((sec_num - (hours * 3600)) / 60);

    if (hours < 10) {
        hours = `0${hours}`;
    }
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }

    return `${hours}h ${minutes}m`;
};

const getMapToBeReadyETA = (locationListingsCount) => {
    const timeSpan = locationListingsCount / CONSTANTS.LISTINGS.MAX_LIMIT + locationListingsCount * 3;
    return _secondsToHHMMSS(timeSpan);
};

module.exports = {
    getLocationListingsCount,
    producePriceGapArray,
    createListingMessagesArray,
    mapListing,
    calculateAvailabilityRate,
    calculateReviewRate,
    calculateFinalScore,
    createHTMLFile,
    sortAndSplice,
    getMapToBeReadyETA
};
