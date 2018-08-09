const teamsMgr = require('../managers/teams');
const googleApi = require('../authentication/googleApi');

async function getTeamSteps(req, res) {
    let response = '';
    //console.log('Route params: ', req.params);
    if (req.params.season && req.params.teamId) {
        try {
            response = await teamsMgr.getTeamSteps(parseInt(req.params.season), parseInt(req.params.teamId));
        } catch(err) {
            console.error(err);
            res.statusCode = 500;
        }
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
        var affectedRows;
        try {
            affectedRows = await teamsMgr.addStep(parseInt(season), parseInt(teamId), parseInt(stepId));
        }
        catch(err) {
            affectedRows = -1;
        }
        if (affectedRows > 0) {
            //TODO Remove when saving data handled properly
            googleApi.saveData((result) => res.json(result));
            res.statusCode = 201;
        }
        else {
            res.statusCode = affectedRows === 0 ? 409 : 500;
        }
    }
    else {
        res.statusCode = 400;
    }
    res.send();
}

async function deleteTeamStep(req, res) {
    const season = req.params.season;
    const teamId = req.params.teamId;
    const stepId = req.params.stepId;
    if (season && teamId && stepId) {
        const affectedRows = await teamsMgr.deleteStep(parseInt(season), parseInt(teamId), parseInt(stepId))
            .catch(() => -1);
        //console.log('DeleteTeamStep rows affected: ' + affectedRows);
        if (affectedRows > 0) {
            //TODO Remove when saving data handled properly
            googleApi.saveData((result) => res.json(result));
        }
        res.statusCode = affectedRows >= 0 ? 200 : 500;
    }
    else {
        res.statusCode = 400;
    }
    res.send();
}

async function getTeams(req, res) {
    var results;
    const season = req.query.season;
    try {
        results = await teamsMgr.getTeams(season);
    }
    catch(err) {
        res.statusCode = 500;
    }
    res.send(results);
}

async function getSteps(req, res) {
    const results = await teamsMgr.getSteps();
    res.send(results);
}

async function getTeam(req, res) {
    let result = null;
    const { teamId } = req.params;
    if (teamId) {
        const teams = await teamsMgr.getTeams();
        const team = teams.find(t => t.Id == parseInt(teamId));
        //console.log('Selected Team: ', team);
        result = team;
    }
    else { res.statusCode = 400; }
    res.send(result);
}

async function getStep(req, res) {
    //console.log('GetStep request params: ', req.params);
    let result = '';
    const stepId = req.params.stepId;
    const season = req.params.season ? req.params.season : null;
    if (stepId) {
        try {
            result = await teamsMgr.getStep(parseInt(stepId), parseInt(season));
        }
        catch(err) {
            result = err;
            res.statusCode = 400;
        }
    }
    else {
        res.statusCode = 400;
    }
    res.json(result);
}

async function getSignSteps(req, res) {
    let response = '';
    //console.log('Route params: ', req.params);
    if (req.params.season && req.params.teamId) {
        response = await teamsMgr.getTeamSteps(parseInt(req.params.season), parseInt(req.params.teamId), true);
    }
    else {
        res.statusCode = 400;
    }
    res.send(response);
}

module.exports = {
    getTeam,
    getTeams,
    getStep,
    getSteps,
    getSignSteps,
    getTeamSteps,
    addTeamStep,
    deleteTeamStep
}