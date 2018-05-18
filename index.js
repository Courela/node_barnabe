// index.js
const express = require('express');
const bodyParser = require('body-parser');
const utf8 = require('utf8');
const base64 = require('base-64');
const session = require('client-sessions');

const authentication = require('./authentication/authentication');
const usersMgr = require('./managers/users');
const personMgr = require('./managers/person');
const teamsMgr = require('./managers/teams');
const playersMgr = require('./managers/players');

const mysqlAdapter = require('./db/mysql');

const app = express();

const port = process.env.PORT || 8000;

app.use(setCors)
    .use(bodyParser.json())
    //.use(bodyParser.urlencoded({ extended: true }))
    .use(session({
        cookieName: 'session',
        secret: 'plokijuhygtfrdeswaq',
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000,
    }))
    .use(handleUserSession)
    .get('/api/ping', (req, res) => {
        mysqlAdapter.ping();
        res.send();
    })
    .get('/api/team', getTeams)
    .get('/api/step/:stepId', getStep)
    .get('/api/person', getPerson)
    .get('/api/season/:season/team/:teamId/signsteps', getSignSteps)
    .get('/api/season/:season/team/:teamId/steps', getTeamSteps)
    //.route('/api/season/:season/team/:teamId/step/:stepId/player')
    .get('/api/season/:season/team/:teamId/step/:stepId/player',getTeamPlayers)
    .post('/api/season/:season/team/:teamId/step/:stepId/player',addPlayer)
    .post('/api/authenticate', authenticate)
    .post('/api/logout', logout)
    .post('/api/season/:season/team/:teamId/addstep', addTeamStep)
    .use(express.static('public'))
    .listen(port, () => {
        console.log('We are live on ' + port);
    });

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

function setCors(req, res, next) {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

async function authenticate(req, res) {
    let response = '';
    try {
        if (req.body && req.body.username && req.body.password) {
            let result = await authentication.authenticateUser(req.body.username, req.body.password);
            if (result.success) {
                let user = result.user;
                req.user = user;
                delete req.user.Password;
                req.session.user = user;
                res.locals.user = user;
                response = user;
                console.log('User login: ' + user.Username);
            } else {
                console.log('Login failed: ' + req.body.username);
                response = 'Invalid login!'
                res.statusCode = 403;
            }
        }
        else {
            res.statusCode = 400;
        }
    }
    catch (err) {
        response = err;
        res.statusCode = 500;
    }
    res.send(response);
}

function logout(req, res) {
    console.log('User logout: ' + req.session.user);
    req.session.reset();
    res.send();
}

async function getTeams(req, res) {
    const season = req.query.season;
    const results = await teamsMgr.getTeams(season);
    res.send(results);
}

async function getStep(req, res) {
    const stepId = req.params.stepId;
    const results = await teamsMgr.getStep(stepId);
    res.send(results);
}

async function getSignSteps(req, res) {
    let response = '';
    //console.log('Route params:' + JSON.stringify(req.params));
    if (req.params.season && req.params.teamId) {
        response = await teamsMgr.getTeamSteps(req.params.season, req.params.teamId, true);
    }
    else {
        res.statusCode = 400;
    }
    res.send(response);
}

async function getTeamSteps(req, res) {
    let response = '';
    //console.log('Route params:' + JSON.stringify(req.params));
    if (req.params.season && req.params.teamId) {
        response = await teamsMgr.getTeamSteps(req.params.season, req.params.teamId);
    }
    else {
        res.statusCode = 400;
    }
    res.send(response);
}

async function getTeamPlayers(req, res) {
    let response = '';
    console.log('Route params:' + JSON.stringify(req.params));
    const { season, teamId, stepId } = req.params;
    if (season && teamId && stepId) {
        response = await playersMgr.getPlayers(season, teamId, stepId);
    }
    else {
        res.statusCode = 400;
    }
    res.send(response);
}

async function addTeamStep(req, res) {
    const season = req.params.season;
    const teamId = req.params.teamId;
    const stepId = req.body.stepId;
    if (season && teamId && stepId) {
        const affectedRows = await teamsMgr.addStep(season, teamId, stepId)
            .catch(() => -1);
        //console.log('AddTeamStep rows affected: ' + affectedRows);
        res.statusCode = affectedRows > 0 ? 201 : affectedRows < 0 ? 500 : 409;
    }
    else {
        res.statusCode = 400;
    }
    res.send();
}

async function getPerson (req, res) {
    let result;
    const docId = req.query.docId;
    if (docId) {
        result = await personMgr.getPersonByIdCardNr(docId);
    } else {
        res.statusCode = 400;
    }
    res.send(result);
}

async function addPlayer(req, res) {
    let response = '';
    //console.log('AddPlayer body: ' + JSON.stringify(req.body));
    const { teamId, stepId, season, name, gender, birth, docId, voterNr, phoneNr, email } = req.body;
    if (teamId && stepId && season && name && gender && birth && docId) {
        const playerId = await playersMgr.addPlayer(teamId, stepId, season, name, gender, birth, docId, voterNr, phoneNr, email);
        if (playerId > 0) {
            res.statusCode = 201;
            response = { Id: playerId };
         }
         else {
            res.statusCode = playerId == 0 ? 200 : 500;
         }
    }
    else {
        res.statusCode = 400;
    }
    res.send(response);
}