const errors = require('../errors');
const playersMgr = require('../managers/players');

async function getTeamPlayers(req, res) {
    let response = '';
    try {
        //console.log('Route params:' + JSON.stringify(req.params));
        const { season, teamId, stepId } = req.params;
        if (season && teamId && stepId) {
            response = await playersMgr.getPlayers(
                parseInt(season), 
                parseInt(teamId), 
                parseInt(stepId),
                [1]);
        }
        else {
            res.statusCode = 400;
        }
    }
    catch (err) {
        errors.handleErrors(res);
        response = err;
    }
    res.send(response);
}

async function getStaff(req, res) {
    let response = '';
    try {
        //console.log('Route params:' + JSON.stringify(req.params));
        const { season, teamId, stepId } = req.params;
        if (season && teamId && stepId) {
            response = await playersMgr.getPlayers(
                parseInt(season), 
                parseInt(teamId), 
                parseInt(stepId),
                [2,3,4,5,6]);
        }
        else {
            res.statusCode = 400;
        }
    }
    catch (err) {
        errors.handleErrors(res);
        response = err;
    }
    res.send(response);
}

async function getPlayer(req, res) {
    console.log('GetPlayer: ' + JSON.stringify(req.params));
    let response = '';
    try {
        const { teamId, stepId, season, playerId } = req.params;
        if (teamId && stepId && season && playerId) {
            response = await playersMgr.getPlayer(parseInt(season), parseInt(teamId), parseInt(stepId), parseInt(playerId));
            console.log(response);
        } else {
            res.statusCode = 400;
        }
    }
    catch (err) {
        errors.handleErrors(res);
        response = err;
    }
    res.send(response);
}

async function addPlayer(req, res) {
    let response = '';
    try {
        console.log('AddPlayer params: ' + JSON.stringify(req.params));
        console.log('AddPlayer: ' + JSON.stringify(req.body));
        const { teamId, stepId, season } = req.params;
        const { name, gender, birth, docId, voterNr, phoneNr, email } = req.body.person;
        if (teamId && stepId && season && name && gender && birth && docId) {
            const playerId = await playersMgr.addPlayer(
                parseInt(teamId), 
                parseInt(stepId), 
                parseInt(season), 
                req.body.person, 
                parseInt(req.body.role), 
                req.body.caretaker,
                req.body.comments
            );
            if (playerId > 0) {
                res.statusCode = 201;
                console.log('PlayerId: ' + playerId);
                response = { Id: playerId };
            } else {
                const result = Math.abs(playerId);
                console.log('Status code result: ' + result);
                res.statusCode = result;
            }
        } else {
            console.log('Bad request!');
            res.statusCode = 400;
        }
    }
    catch (err) {
        errors.handleErrors(res);
        response = err;
    }
    res.send(response);
}

module.exports = {
    getTeamPlayers,
    getStaff,
    addPlayer,
    getPlayer
}