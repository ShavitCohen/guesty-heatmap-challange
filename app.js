'use strict';

const express = require('express'),
    bodyParser = require('body-parser'),
    dotEnvSave = require('dotenv-safe'),
    setRoutes = require('./src/routes/routes'),
    initQueues = require('./src/services/init-queues.service'),
    app = express(),
    PORT = 3000;

dotEnvSave.load();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

initQueues();

app.use(express.static('maps'));

setRoutes(app);

app.listen(PORT, function () {
    console.log('Guesty Code Challange listening on port 3000!');
})