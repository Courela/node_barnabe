// index.js
const express = require('express');
const bodyParser = require('body-parser');
const utf8 = require('utf8');
const base64 = require('base-64');
const session = require('client-sessions');
const db = require('./db/operator');
const teams = require('./db/teams');
const authentication = require('./db/authentication');

const app = express();

const port = process.env.PORT || 8000;

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
})
    .use(session({
        cookieName: 'session',
        secret: 'plokijuhygtfrdeswaq',
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000,
    }))
    .use(function (req, res, next) {
        if (req.session && req.session.user) {
            console.log('User in session: ' + req.session.user);
            const result = db.getSingle('User', req.session.user.Id);
            if (result.recordset.length > 0) {
                let user = result.recordset[0];
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
    })
    //.use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .post('/api/authenticate', authenticate)
    .post('/api/logout', logout)
    .get('/api/team', getTeams)
    .get('/api/team/:teamId/steps', getTeamSteps)
    .use(express.static('public'))
    .listen(port, () => {
        console.log('We are live on ' + port);
    });

function authenticate(req, res) {
    authentication.getUser(req.body.username, req.body.password)
        .then(result => {
            let response = "";
            if (result && result.recordset.length > 0) {
                let user = result.recordset[0];
                req.user = user;
                delete req.user.Password;
                req.session.user = user;
                res.locals.user = user;
                response = user;
                console.log('User login: ' + user.Username);
            }
            else {
                console.log('Login failed: ' + req.body.username);
                res.statusCode = 403;
            }
            res.send(response);
        })
        .catch(err => { console.error(err); res.statusCode = 500; });
}

function logout(req, res) {
    console.log('User logout: ' + req.session.user);
    req.session.reset();
    res.send();
}

function getTeams(req, res) {
    //const token = req.headers 
    const season = req.query.season;
    let promise;
    if (season) {
        promise = teams.getTeamsBySeason(season);
    }
    else {
        promise = db.getMultiple('Team');
    }

    promise.then((results) => {
        console.log(results);
        res.send(results.recordset);
    });
}

function getTeamSteps(req, res) {
    console.log('Route params:' + JSON.stringify(req.params));
    teams.getTeamSteps(req.params.teamId)
        .then((results) => {
            res.send(results.recordset);
        });
}