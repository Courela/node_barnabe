const bcrypt = require('bcrypt');
const puppeteer = require('puppeteer-core');

const usersMgr = require('../managers/users');
const teamsMgr = require('../managers/teams');
const utilsMgr = require('../managers/utils');
const playersMgr = require('../managers/players');
const serverMgr = require('../managers/server');
const mysqlAdapter = require('../db/mysql');
// const storageAdapter = require('../db/storage');
const oAuth2 = require('../authentication/oAuth2');
const googleApi = require('../authentication/googleApi');
const { settings: serverSettings } = require('../serverSettings');
const authentication = require('../authentication/authentication');

function setup() {
    console.log("Starting server...");
    if (process.env.NODE_ENV === 'production') {
        //storageAdapter.createFolders();
    } else {
        console.log("Not production environment: ", process.env.NODE_ENV || "none");
    }
    var browserFetcher = new puppeteer.BrowserFetcher({
        path: '/tmp'
    });
    browserFetcher.download(serverSettings.CHROMIUM_REVISION)
        .then(() => console.log("Chromium revision " + serverSettings.CHROMIUM_REVISION + " downloaded."));
}

function ping(req, res) {
    mysqlAdapter.ping((msg) => res.send({ status: msg }));
}

function setClientSecret(req, res) {
    //console.log('Client Secret: ', req.body);
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
    //console.log('Code: ' + code);
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

function saveUsers(req, res) {
    googleApi.saveUsers((result) => res.json(result));
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
    const { username, password, teamId, email } = req.body;
    if (username && password && teamId) {
        const exists = await usersMgr.existsUser(username);
        if (!exists) {
            var hashPassword = await bcrypt.hash(password, authentication.salt);
            await usersMgr.addUser(username, hashPassword, parseInt(teamId), email);
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

async function addSeason(req, res) {
    const { year, isActive, signUpDueDate, startDate } = req.body;
    if (year, isActive, signUpDueDate, startDate) {
        await serverMgr.addSeason(parseInt(year), isActive, signUpDueDate, startDate, null);
    }
    else {
        console.warn("Missing info: ", req.body);
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

async function updateSeason(req, res) {
    const { season, isActive, signUpDueDate, startDate } = req.body;
    if (season, isActive, signUpDueDate, startDate) {
        await serverMgr.updateSeason(parseInt(season), isActive, signUpDueDate, startDate);
    }
    else {
        console.warn("Missing info: ", req.body);
        res.statusCode = 400;
    }
    res.send();
}

async function getStatistics(_, res) {
    const activeSeason = await utilsMgr.getSeasons()
        .then(res => res.find(s => s.IsActive));
    const usersCount = await usersMgr.getUsersCount();
    const teamsCount = await teamsMgr.getTeamsWithoutUser();
    const playersCount = await playersMgr.getPlayersCount(activeSeason.Year);
    const stepsCount = await teamsMgr.getStepsWithoutPlayers(activeSeason.Year);
    const result = {
        NrUsers: usersCount,
        NrTeamsWithoutUser: teamsCount,
        NrPlayers: playersCount,
        NrStepsWithoutPlayers: stepsCount
    }
    res.send(result);
}

function setCors(req, res, next) {
    res.append('Access-Control-Allow-Origin', [ serverSettings.CORS_HOST ]);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

async function handleUserSession(req, res, next) {
    if (req.session && req.session.user) {
        //console.log('User in session: ', req.session.user);
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
    getUsers,
    saveUsers,
    saveDocuments,
    restoreDocuments,
    testDrive,
    addUser,
    addSeason,
    activateSeason,
    updateSeason,
    getStatistics
}