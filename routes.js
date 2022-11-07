const express = require('express');
const teamsController = require('./controllers/teams');
const stepsController = require('./controllers/steps');
const playersController = require('./controllers/players');
const utilsController = require('./controllers/utils');
const exportController = require('./controllers/export');
const templatesController = require('./controllers/templates');
const serverController = require('./controllers/server');

const authentication = require('./authentication/authentication');
// const googleApi = require('./authentication/googleApi');
const errors = require('./errors');

function addRoutes(app) {
    const apiRouter = getApiRoutes();
    app.use('/api', apiRouter);
}

function getApiRoutes() {
    const filesRouter = getFilesRoutes();
    const adminRouter = getAdminRoutes();

    const apiRouter = express.Router();
    apiRouter.use('/admin', adminRouter)
        .use('/files', filesRouter)
        .get('/teams', teamsController.getTeams)
        .get('/steps', utilsController.getSteps)
        .get('/teams/:teamId', teamsController.getTeam)
        .get('/steps/:stepId', teamsController.getStep)
        .get('/persons', utilsController.getPerson)
        .get('/roles', utilsController.getRoles)
        .post('/authenticate', authenticate)
        .post('/logout', logout)
        .get('/seasons/:season', utilsController.getSeason)
        .get('/seasons/:season/steps/:stepId', teamsController.getStep)
        .post('/seasons/:season/steps/:stepId/add-match', stepsController.addMatch)
        .get('/seasons/:season/steps/:stepId/matches', stepsController.getMatches)
        .delete('/seasons/:season/steps/:stepId/matches/:matchId', stepsController.removeMatch)
        .get('/seasons/:season/steps/:stepId/standings', stepsController.getStandings)
        .get('/seasons/:season/teams/:teamId/sign-steps', teamsController.getSignSteps)
        .get('/seasons/:season/teams/:teamId/steps', teamsController.getTeamSteps)
        //.route('/season/:season/team/:teamId/step/:stepId/player')
        .get('/seasons/:season/teams/:teamId/steps/:stepId/players/:playerId', playersController.getPlayer)
        .get('/seasons/:season/teams/:teamId/steps/:stepId/players/:playerId/photo', playersController.getPhoto)
        .get('/seasons/:season/teams/:teamId/steps/:stepId/players/:playerId/doc', playersController.getDocument)
        .get('/seasons/:season/teams/:teamId/steps/:stepId/players', playersController.getTeamPlayers)
        .get('/seasons/:season/teams/:teamId/steps/:stepId/staff', playersController.getStaff)
        .get('/seasons', utilsController.getSeasons)
        //.get('/season/:season/team/:teamId/step/:stepId/export-players', exportController.exportPlayers)
        //.post('/season/:season/team/:teamId/step/:stepId/player', playersController.addPlayer)
        .put('/seasons/:season/teams/:teamId/steps/:stepId/players', playersController.addPlayer)
        .patch('/seasons/:season/teams/:teamId/steps/:stepId/players/:playerId', playersController.updatePlayer)
        .delete('/seasons/:season/teams/:teamId/steps/:stepId/players/:playerId', playersController.removePlayer)
        .post('/seasons/:season/teams/:teamId/steps/:stepId/import-players', playersController.importPlayers)
        .put('/seasons/:season/teams/:teamId/steps', teamsController.addTeamStep)
        .delete('/seasons/:season/teams/:teamId/steps/:stepId', teamsController.deleteTeamStep);

    return apiRouter;
}

function getAdminRoutes() {
    const templatesRouter = getTemplatesRoutes();

    const adminRouter = express.Router();
    adminRouter.use('/templates', templatesRouter)
        .get('/ping', serverController.ping)
        .get('/statistics', serverController.getStatistics)
        .get('/export', exportController.exportSource)
        .post('/client-secret', serverController.setClientSecret)
        .post('/auth-code', serverController.setAccessToken)
        .post('/reset-auth', serverController.resetAuth)
        .get('/save-data', serverController.saveData)
        .get('/save-users', serverController.saveUsers)
        .get('/save-documents', serverController.saveDocuments)
        .get('/restore-documents', serverController.restoreDocuments)
        .get('/drive', serverController.testDrive)
        .get('/users', serverController.getUsers)
        .put('/users', serverController.addUser)
        .post('/seasons/activate', serverController.activateSeason)
        .put('/seasons/update', serverController.updateSeason);

    return adminRouter;
}

function getTemplatesRoutes() {
    const templatesRouter = express.Router();
    templatesRouter.get('/team', templatesController.teamTemplate)
        .get('/game', templatesController.gameTemplate);

    return templatesRouter;
}

function getFilesRoutes() {
    const filesRouter = express.Router();
    filesRouter.get('/export-players', exportController.exportPlayers);

    return filesRouter;
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
        errors.handleErrors(res, err);
        response = err;
    }
    res.send(response);
}

function logout(req, res) {
    console.log("User logout: ", req.body.user);
    req.barnabe.reset();
    res.send();
}

module.exports = {
    addRoutes
}