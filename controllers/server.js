const usersMgr = require('../managers/users');
const utilsMgr = require('../managers/utils');
const playersMgr = require('../managers/players');
const serverMgr = require('../managers/server');
const mysqlAdapter = require('../db/mysql');
const storageAdapter = require('../db/storage');
const oAuth2 = require('../authentication/oAuth2');
const googleApi = require('../authentication/googleApi');
const { settings } = require('../settings');

function setup() {
    console.log("Starting server...");
    if (process.env.NODE_ENV === 'production') {
        storageAdapter.createFolders();
        googleApi.restoreUsers();
        googleApi.restoreData();
        storageAdapter.initUsers();
        storageAdapter.initData();
    } else {
        console.log("Not production environment: ", process.env.NODE_ENV || "none");
    }
}

function ping(req, res) {
    mysqlAdapter.ping((msg) => res.send({ status: msg }));
}

function setClientSecret(req, res) {
    console.log('Client Secret: ', req.body);
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

function restoreData(req, res) {
    googleApi.restoreData((result) => res.json(result));
}

function saveUsers(req, res) {
    googleApi.saveUsers((result) => res.json(result));
}

function restoreUsers(req, res) {
    googleApi.restoreUsers((result) => res.json(result));
}

function saveDocuments(req, res) {
    googleApi.saveDocuments((result) => res.json(result));
}

function restoreDocuments(req, res) {
    googleApi.restoreDocuments((result) => res.json(result));
}

function testDrive(req, res) {
    res.json(oAuth2.isDriveAuthEnabled());
}

async function getUsers(req, res) {
    const users = await usersMgr.getUsers();
    res.json(users);
}

async function addUser(req, res) {
    const { username, password, teamId } = req.body;
    if (username && password && teamId) {
        const exists = await usersMgr.existsUser(username);
        if (!exists) {
            await usersMgr.addUser(username, password, parseInt(teamId));
        }
        else {
            res.statusCode = 409;
        }
    }
    else {
        res.statusCode = 400;
    }
    res.send();
}

async function activateSeason(req, res) {
    const { season } = req.body;
    if (season) {
        await serverMgr.activateSeason(parseInt(season));
    }
    else {
        res.statusCode = 400;
    }
    res.send();
}

async function getStatistics(req, res) {
    const activeSeason = await utilsMgr.getSeasons()
        .then(res => res.find(s => s.IsActive));
    const usersCount = await usersMgr.getUsersCount();
    const playersCount = await playersMgr.getPlayersCount(activeSeason.Year);
    const result = {
        nrUsers: usersCount,
        nrPlayers: playersCount
    }
    res.send(result);
}

function setCors(req, res, next) {
    res.append('Access-Control-Allow-Origin', [ settings.CORS_HOST ]);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

async function handleUserSession(req, res, next) {
    if (req.session && req.session.user) {
        console.log('User in session: ', req.session.user);
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

function logRequest(req, res, next) {
    console.log('Request: ', req.url, ' | Method: ', req.method);
    next();
}

module.exports = {
    logRequest,
    setup,
    ping,
    setCors,
    handleUserSession,
    setClientSecret,
    setAccessToken,
    resetAuth,
    saveData,
    restoreData,
    getUsers,
    saveUsers,
    restoreUsers,
    saveDocuments,
    restoreDocuments,
    testDrive,
    addUser,
    activateSeason,
    getStatistics
}