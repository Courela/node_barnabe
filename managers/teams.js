const teamsRepo = require('../repositories/teams');

function getTeams(season) {
    let promise = season ? teamsRepo.getTeamsBySeason : teamsRepo.getTeams;
    return promise(season)
        .then((results) => {
            //console.log(results);
            return results.recordset;
        })
        .catch((err) => {
            console.log(err);
            throw 'Unexpected error!';
        });
}

function getTeamSteps(season, teamId, invert = false) {
    return teamsRepo.getTeamSteps(season, teamId, invert)
        .then((results) => {
            //console.log(results);
            return results.recordset;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function getStep(stepId) {
    return teamsRepo.getStep(stepId)
        .then(result => {
            console.log('GetStep '+ stepId + ': ' + JSON.stringify(result)); 
            return result.rowsAffected[0] > 0 ? result.recordset[0] : null; 
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function addStep(season, teamId, stepId) {
    return teamsRepo.addStep(season, teamId, stepId)
        .then(result => result.rowsAffected)
        .catch((err) => {
            console.error(err);
            const res = err.name == 'RequestError' ? 0 : -1;
            return res;
        });
}

module.exports = {
    getStep,
    addStep,
    getTeams,
    getTeamSteps
}