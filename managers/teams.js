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

function getTeamSteps(season, teamId) {
    return teamsRepo.getTeamSteps(season, teamId)
        .then((results) => {
            console.log(results);
            return results.recordset;
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
    addStep,
    getTeams,
    getTeamSteps
}