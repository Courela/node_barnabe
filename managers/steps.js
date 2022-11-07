const stepsRepo = require('../repositories/steps');

function insertMatch(season, stepId, phase, homeTeamId, awayTeamId, homeTeamGoals, awayTeamGoals) {
    return stepsRepo.insertMatch(season, stepId, phase, homeTeamId, awayTeamId, homeTeamGoals, awayTeamGoals)
        .then(r => r && r.rowsAffected > 0)
        .catch((err) => {
            //console.error(err);
            throw err;
        });
}

function getMatches(season, stepId) {
    return stepsRepo.getMatches(season, stepId)
        .then((results) => results.recordset)
        .catch((err) => {
            //console.error(err);
            throw err;
        });
}

module.exports = {
    insertMatch,
    getMatches
}