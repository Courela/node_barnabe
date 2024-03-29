const teamsRepo = require('../repositories/teams');

function getTeams(season, stepId) {
    let promise = season ? 
        (stepId ? teamsRepo.getTeamsByStep : teamsRepo.getTeamsBySeason) : 
        teamsRepo.getTeams;
    return promise(season, stepId)
        .then((results) => {
            //console.log(results);
            return results.recordset;
        })
        .catch((err) => {
            console.log(err);
            throw 'Unexpected error!';
        });
}

function getTeamById(id) {
    return teamsRepo.getTeamById(id)
        .then((results) => {
            //console.log(results);
            if (results.recordset && results.recordset.length > 0) {
                return results.recordset[0];
            } else {
                return null;
            }
        })
        .catch((err) => {
            console.log(err);
            throw 'Unexpected error!';
        });
}

function getTeamSteps(season, teamId, invert = false) {
    if (teamId) {
        return teamsRepo.getTeamSteps(season, teamId, invert)
            .then((results) => {
                //console.log("getTeamSteps manager: ", results);
                return results.recordset;
            })
            .catch((err) => {
                console.error(err);
                throw 'Unexpected error!';
            });
    } else {
        return [];
    }
}

function getTeamStep(season, teamId, teamStepId) {
    if (teamStepId) {
        return teamsRepo.getTeamStep(season, teamId, teamStepId)
            .then((results) => {
                // console.log("getTeamStep manager: ", results);
                return results.recordset && results.recordset.length >= 1 ? results.recordset[0] : null;
            })
            .catch((err) => {
                console.error(err);
                throw 'Unexpected error!';
            });
    } else {
        return null;
    }
}

function getStep(stepId, season = null) {
    return teamsRepo.getStep(stepId, season)
        .then(result => {
            //console.log('getStep manager '+ stepId + ': ', result); 
            return result.rowsAffected[0] > 0 ? result.recordset[0] : null; 
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function addTeam(name, shortDescription) {
    return teamsRepo.addTeam(name, shortDescription)
        .then(result => result.rowsAffected[0])
        .catch((err) => {
            console.error(err);
            const res = err.name == 'RequestError' ? 0 : -1;
            return res;
        });
}

function addStep(season, teamId, stepId) {
    return teamsRepo.addStep(season, teamId, stepId)
        .then(result => result.rowsAffected[0])
        .catch((err) => {
            console.error(err);
            const res = err.name == 'RequestError' ? 0 : -1;
            return res;
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

function getTeamsWithoutUser() {
    return teamsRepo.getTeamsWithoutUser()
        .then(result => result.recordset.NrTeams)
        .catch(err => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function getStepsWithoutPlayers(year) {
    return teamsRepo.getStepsWithoutPlayers(year)
        .then(result => result.recordset.NrSteps)
        .catch(err => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

module.exports = {
    addTeam,
    getStep,
    addStep,
    getTeams,
    getTeamById,
    getTeamSteps,
    getTeamStep,
    deleteStep,
    getTeamsWithoutUser,
    getStepsWithoutPlayers
}