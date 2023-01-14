const teamsMgr = require('../managers/teams');
const googleApi = require('../authentication/googleApi');

async function getTeams(req, res) {
    const season = req.query.season;
    const stepId = req.query.stepId;
    const results = await teamsMgr.getTeams(season, stepId);
    res.send(results);
}

async function getTeam(req, res) {
    let result = null;
    var { teamId } = req.params;
    teamId = parseInt(teamId, 10);
    if (teamId && !isNaN(teamId)) {
        result = await teamsMgr.getTeamById(teamId);
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

async function getTeamSteps(req, res) {
    let response = '';
    var season = parseInt(req.params.season, 10);
    var teamId = parseInt(req.params.teamId, 10);
    if (!isNaN(season) && !isNaN(teamId)) {
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
        const affectedRows = await teamsMgr.addStep(parseInt(season, 10), parseInt(teamId, 10), parseInt(stepId, 10))
            .catch(() => -1);
        //console.log('AddTeamStep rows affected: ' + affectedRows);
        res.statusCode = affectedRows > 0 ? 201 : affectedRows < 0 ? 500 : 409;
    }
    else {
        res.statusCode = 400;
    }

    // if (res.statusCode < 400) {
    //     const folder = [season, teamId, stepId].join('_') + googleApi.FOLDER_EXTENSION;
    //     googleApi.saveFile(null, folder);
    // }
    // //TODO Remove when saving data handled properly
    // googleApi.saveData();

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
        res.statusCode = affectedRows > 0 ? 200 : affectedRows === 0 ? 404 : 500;
    }
    else {
        res.statusCode = 400;
    }

    //TODO Remove when saving data handled properly
    //googleApi.saveData((result) => console.log(result));

    res.send();
}

module.exports = {
    getTeam,
    getTeams,
    getStep,
    getSignSteps,
    getTeamSteps,
    addTeamStep,
    deleteTeamStep
}