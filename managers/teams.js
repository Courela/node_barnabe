const teamsRepo = require('../repositories/teams');

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

function addStep(season, teamId, stepId) {
    return teamsRepo.addStep(season, teamId, stepId)
        .then(result => result.rowsAffected[0])
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function deleteStep(season, teamId, stepId) {
    return teamsRepo.deleteStep(season, teamId, stepId)
        .then(result => result.rowsAffected[0])
        .catch((err) => {
            console.error(err);
            const res = err.name == 'RequestError' ? 0 : -1;
            return res;
        });
}

function getTeams(season) {
    let promise = season ? teamsRepo.getTeamsBySeason(season) : teamsRepo.getTeams();
    return promise
        .then((results) => {
            //console.log(results);
            return results.recordset;
        })
        .catch((err) => {
            console.log(err);
            throw 'Unexpected error!';
        });
}

function getSteps() {
    return teamsRepo.getSteps()
        .then((results) => {
            //console.log(results);
            return results.recordset;
        })
        .catch((err) => {
            console.log(err);
            throw 'Unexpected error!';
        });
}

function getStep(stepId, season = null) {
    return teamsRepo.getStep(stepId, season)
        .then(result => {
            console.log('GetStep '+ stepId + ': ', result); 
            return result.rowsAffected[0] > 0 ? result.recordset[0] : null; 
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

module.exports = {
    getStep,
    getSteps,
    addStep,
    getTeams,
    getTeamSteps,
    deleteStep
}