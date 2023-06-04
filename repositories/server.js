const mysqlStorage = require("../db/mysql")

function addSeason(season, isActive, signUpDueDate, startDate) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("activateSeason response:", r);
                resolve(r);
            }
            mysqlStorage.addSeason(season, isActive, signUpDueDate, startDate, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

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
    addSeason,
    activateSeason,
    updateSeason
}
