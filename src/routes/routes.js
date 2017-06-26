'use strict';
const makeMapCtrl = require('../controllers/make-map.ctrl');

module.exports = (app) => {
    app.get('/create-heat-map', makeMapCtrl);
};
