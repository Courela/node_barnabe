const usersMgr = require('../managers/users');
const mysqlAdapter = require('../db/mysql');
const storageAdapter = require('../db/storage');
const oAuth2 = require('../authentication/oAuth2');
const googleApi = require('../authentication/googleApi');

function setup() {
    storageAdapter.init();
}

function ping(req, res) {
    mysqlAdapter.ping();
    res.send();
}

function initStorage(req, res) {
    res.send(JSON.stringify(storageAdapter.init()));
}

function setClientSecret(req, res) {
    console.log('Client Secret: ' + JSON.stringify(req.body));
    const file = req.body.file;
    if (file) {
        oAuth2.saveClientSecret(file);
    }
    else {
        res.statusCode = 400;
    }
    res.send();
}

function setAccessToken(req, res) {
    const code = req.body.authCode;
    console.log('Code: ' + code);
    if (code) {
        oAuth2.setAccessToken(code, (result) => { 
            res.json(result);
        });
    }
    else {
        res.statusCode = 400;
        res.send();
    }
}

function resetAuth(req, res) {
    oAuth2.resetAuth((result) => res.json(result));
}

function saveData(req, res) {
    googleApi.saveData((result) => res.json(result));
}

function testDrive(req, res) {
    res.json(oAuth2.isDriveAuthEnabled());
}

function setCors(req, res, next) {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

async function handleUserSession(req, res, next) {
    if (req.session && req.session.user) {
        console.log('User in session: ' + JSON.stringify(req.session.user));
        let user = await usersMgr.getUserById(req.session.user.Id);
        if (user != null) {
            req.user = user;
            delete req.user.Password; // delete the password from the session
            req.session.user = user;  //refresh the session value
            res.locals.user = user;
        }
        // finishing processing the middleware and run the route
        next();
    } else {
        next();
    }
}

module.exports = {
    setup,
    ping,
    initStorage,
    setCors,
    handleUserSession,
    setClientSecret,
    setAccessToken,
    resetAuth,
    saveData,
    testDrive
}