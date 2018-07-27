const errors = require('../errors');
const serverRepo = require('../repositories/server');

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

module.exports = {
    activateSeason
}