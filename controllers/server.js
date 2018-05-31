const usersMgr = require('../managers/users');
const mysqlAdapter = require('../db/mysql');
const storageAdapter = require('../db/storage');

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
    handleUserSession
}