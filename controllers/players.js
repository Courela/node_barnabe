const errors = require('../errors');
const playersMgr = require('../managers/players');

async function getTeamPlayers(req, res) {
    let response = '';
    try {
        //console.log('Route params:' + JSON.stringify(req.params));
        const { season, teamId, stepId } = req.params;
        if (season && teamId && stepId) {
            response = await playersMgr.getPlayers(parseInt(season), parseInt(teamId), parseInt(stepId));
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
            response = await playersMgr.getPlayer(season, teamId, stepId, playerId);
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
        //console.log('AddPlayer params: ' + JSON.stringify(req.params));
        //console.log('AddPlayer: ' + JSON.stringify(req.body));
        const { teamId, stepId, season } = req.params;
        const { name, gender, birth, docId, voterNr, phoneNr, email } = req.body.person;
        if (teamId && stepId && season && name && gender && birth && docId) {
            const playerId = await playersMgr.addPlayer(teamId, stepId, season, req.body.person, req.body.caretaker);
            if (playerId > 0) {
                res.statusCode = 201;
                response = { Id: playerId };
            } else {
                res.statusCode = playerId == 0 ? 200 : 500;
            }
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

module.exports = {
    getTeamPlayers,
    addPlayer,
    getPlayer
}