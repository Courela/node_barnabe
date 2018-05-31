// index.js
const express = require('express');
const bodyParser = require('body-parser');
const utf8 = require('utf8');
const base64 = require('base-64');
const session = require('client-sessions');

const serverController = require('./controllers/server');
const teamsController = require('./controllers/teams');
const playersController = require('./controllers/players');

const authentication = require('./authentication/authentication');
const usersMgr = require('./managers/users');
const personMgr = require('./managers/person');

serverController.setup();

const app = express();

const port = process.env.PORT || 8000;

app.use(serverController.setCors)
    .use(bodyParser.json({limit: '3mb'}))
    //.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    .use(session({
        cookieName: 'barnabe',
        secret: 'plokijuhygtfrdeswaq',
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000,
    }))
    .use(serverController.handleUserSession)
    .get('/api/ping', serverController.ping)
    .get('/api/storagedb', serverController.initStorage)
    .get('/api/team', teamsController.getTeams)
    .get('/api/step/:stepId', teamsController.getStep)
    .get('/api/person', getPerson)
    .get('/api/season/:season/team/:teamId/signsteps', teamsController.getSignSteps)
    .get('/api/season/:season/team/:teamId/steps', teamsController.getTeamSteps)
    //.route('/api/season/:season/team/:teamId/step/:stepId/player')
    .get('/api/season/:season/team/:teamId/step/:stepId/player/:playerId', playersController.getPlayer)
    .get('/api/season/:season/team/:teamId/step/:stepId/player', playersController.getTeamPlayers)
    //.post('/api/season/:season/team/:teamId/step/:stepId/player', playersController.addPlayer)
    .put('/api/season/:season/team/:teamId/step/:stepId/player', playersController.addPlayer)
    .post('/api/authenticate', authenticate)
    .post('/api/logout', logout)
    .post('/api/season/:season/team/:teamId/addstep', teamsController.addTeamStep)
    .use(express.static('public'))
    .listen(port, () => {
        console.log('We are live on ' + port);
    });

async function authenticate(req, res) {
    let response = '';
    try {
        if (req.body && req.body.username && req.body.password) {
            let result = await authentication.authenticateUser(req.body.username, req.body.password);
            if (result.success) {
                let user = result.user;
                req.user = user;
                delete req.user.Password;
                req.barnabe.user = user;
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
        console.log(err);
        response = err;
        res.statusCode = 500;
    }
    res.send(response);
}

function logout(req, res) {
    console.log('User logout: ' + req.barnabe.user);
    req.barnabe.reset();
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
