const mysqlStorage = require("../db/mysql")

function activateSeason(season) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("activateSeason response:", r);
                resolve(r);
            }
            mysqlStorage.activateSeason(season, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function updateSeason(season, isActive, signUpDueDate, startDate, signUpExtraDueDate) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("activateSeason response:", r);
                resolve(r);
            }
            mysqlStorage.updateSeason(season, isActive, signUpDueDate, startDate, signUpExtraDueDate, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

module.exports = {
    activateSeason,
    updateSeason
}
