const serverRepo = require('../repositories/server');

function addSeason(season, isActive, signUpDueDate, startDate) {
    return serverRepo.addSeason(season, isActive, signUpDueDate, startDate)
        .then((results) => {
            //console.log(results);
            return results;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function activateSeason(season) {
    return serverRepo.activateSeason(season)
        .then((results) => {
            //console.log(results);
            return results;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function updateSeason(season, isActive, signUpDueDate, startDate, signUpExtraDueDate) {
    return serverRepo.updateSeason(season, isActive, signUpDueDate, startDate, signUpExtraDueDate)
        .then((results) => {
            //console.log(results);
            return results;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

module.exports = {
    addSeason,
    activateSeason,
    updateSeason
}