// index.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('client-sessions');

const serverController = require('./controllers/server');

const { addRoutes } = require('./routes');

serverController.setup();

const port = process.env.PORT || 8001;

process.on('SIGINT', function() {
    console.log('Shutting down...');
    //googleApi.saveData(() => process.exit(0));
});

process.on('SIGTERM', function () {
    console.log('Shutting down...');
    //googleApi.saveData(() => process.exit(0));
});

var app = express();
app.set('view engine', 'pug')
    .set('views', './views')    
    .use(serverController.setCors)
    .use(bodyParser.json({limit: '5mb'}))
    //.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    .use(session({
        cookieName: 'barnabe',
        secret: 'plokijuhygtfrdeswaq',
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000,
    }))
    .use(serverController.handleUserSession)
    .use(serverController.logRequest)
    // .use(function(req, res, next) {
    //     res.setTimeout(300);
    //     next();
    //   })
    .use(express.static('public'));

addRoutes(app);
app.listen(port, () => {
    console.log('We are live on ' + port);
});
