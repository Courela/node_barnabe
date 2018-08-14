const utilsRepo = require('../repositories/utils');

function getRoles() {
    return utilsRepo.getRoles()
        .then((results) => {
            //console.log(results);
            return results.recordset;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function getSeasons() {
    return utilsRepo.getSeasons()
        .then((results) => {
            //console.log(results);
            return results.recordset;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function getSteps() {
    return utilsRepo.getSteps()
        .then((results) => {
            //console.log(results);
            return results.recordset;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}


module.exports = {
    getRoles,
    getSeasons,
    getSteps
}