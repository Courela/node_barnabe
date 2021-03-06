// index.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('client-sessions');

const serverController = require('./controllers/server');
const teamsController = require('./controllers/teams');
const playersController = require('./controllers/players');
const exportController = require('./controllers/export');
const utilsController = require('./controllers/utils');
const templatesController = require('./controllers/templates');

const authentication = require('./authentication/authentication');
const googleApi = require('./authentication/googleApi');

serverController.setup();

const app = express();
const port = process.env.PORT || 8001;

process.on('SIGINT', function() {
    console.log('Shutting down...');
    googleApi.saveData(() => process.exit(0));
});

process.on('SIGTERM', function () {
    console.log('Shutting down...');
    googleApi.saveData(() => process.exit(0));
});

const templatesRouter = express.Router();
templatesRouter.get('/team', templatesController.teamTemplate)
    .get('/game', templatesController.gameTemplate);

const adminRouter = express.Router();
adminRouter.use('/templates', templatesRouter)
    .get('/ping', serverController.ping)
    .get('/statistics', serverController.getStatistics)
    .get('/export', exportController.exportSource)
    .post('/client-secret', serverController.setClientSecret)
    .post('/auth-code', serverController.setAccessToken)
    .post('/reset-auth', serverController.resetAuth)
    .get('/save-data', serverController.saveData)
    .get('/restore-data', serverController.restoreData)
    .get('/save-users', serverController.saveUsers)
    .get('/restore-users', serverController.restoreUsers)
    .get('/save-documents', serverController.saveDocuments)
    .get('/restore-documents', serverController.restoreDocuments)
    .get('/drive', serverController.testDrive)
    .put('/users', serverController.addUser)
    .post('/seasons/activate', serverController.activateSeason);

const filesRouter = express.Router();
filesRouter.get('/export-players', exportController.exportPlayers);

const apiRouter = express.Router();
apiRouter.use('/admin', adminRouter)
    .use('/files', filesRouter)
    .get('/teams', teamsController.getTeams)
    .get('/steps', utilsController.getSteps)
    .get('/teams/:teamId', teamsController.getTeam)
    .get('/steps/:stepId', teamsController.getStep)
    .get('/seasons/:season/steps/:stepId', teamsController.getStep)
    .get('/persons', utilsController.getPerson)
    .get('/roles', utilsController.getRoles)
    .get('/seasons/:season/teams/:teamId/sign-steps', teamsController.getSignSteps)
    .get('/seasons/:season/teams/:teamId/steps', teamsController.getTeamSteps)
    //.route('/season/:season/team/:teamId/step/:stepId/player')
    .get('/seasons/:season/teams/:teamId/steps/:stepId/players/:playerId', playersController.getPlayer)
    .get('/seasons/:season/teams/:teamId/steps/:stepId/players/:playerId/photo', playersController.getPhoto)
    .get('/seasons/:season/teams/:teamId/steps/:stepId/players', playersController.getTeamPlayers)
    .get('/seasons/:season/teams/:teamId/steps/:stepId/staff', playersController.getStaff)
    .get('/seasons', utilsController.getSeasons)
    //.get('/season/:season/team/:teamId/step/:stepId/export-players', exportController.exportPlayers)
    //.post('/season/:season/team/:teamId/step/:stepId/player', playersController.addPlayer)
    .put('/seasons/:season/teams/:teamId/steps/:stepId/players', playersController.addPlayer)
    .patch('/seasons/:season/teams/:teamId/steps/:stepId/players/:playerId', playersController.updatePlayer)
    .delete('/seasons/:season/teams/:teamId/steps/:stepId/players/:playerId', playersController.removePlayer)
    .post('/seasons/:season/teams/:teamId/steps/:stepId/import-players', playersController.importPlayers)
    .post('/authenticate', authenticate)
    .post('/logout', logout)
    .put('/seasons/:season/teams/:teamId/steps', teamsController.addTeamStep)
    .delete('/seasons/:season/teams/:teamId/steps/:stepId', teamsController.deleteTeamStep)
    .get('/seasons/:season', utilsController.getSeason);

app.set('view engine', 'pug')
    .set('views', './views')    
    .use(serverController.setCors)
    .use(bodyParser.json({limit: '925kb'}))
    //.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    .use(session({
        cookieName: 'barnabe',
        secret: 'plokijuhygtfrdeswaq',
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000,
    }))
    .use(serverController.handleUserSession)
    .use(serverController.logRequest)
    .use('/api', apiRouter)
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
