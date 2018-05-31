const teamsMgr = require('../managers/teams');

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
        response = await teamsMgr.getTeamSteps(parseInt(req.params.season), parseInt(req.params.teamId));
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
        const affectedRows = await teamsMgr.addStep(parseInt(season), parseInt(teamId), parseInt(stepId))
            .catch(() => -1);
        console.log('AddTeamStep rows affected: ' + affectedRows);
        res.statusCode = affectedRows > 0 ? 201 : affectedRows < 0 ? 500 : 409;
    }
    else {
        res.statusCode = 400;
    }
    res.send();
}

module.exports = {
    getTeams,
    getStep,
    getSignSteps,
    getTeamSteps,
    addTeamStep
}