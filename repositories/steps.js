const mysqlStorage = require("../db/mysql/steps")

function insertMatch(season, stepId, phaseId, homeTeamId, awayTeamId, homeTeamGoals, awayTeamGoals) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                if (r && r.affectedRows) {
                    resolve({ recordset: r , rowsAffected: r.affectedRows });
                } else {
                    reject(r);
                }
            }
            mysqlStorage.insertMatch(season, stepId, phaseId, homeTeamId, awayTeamId, homeTeamGoals, awayTeamGoals, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getMatches(season, stepId, phaseId) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                if (r && r.length !== undefined) {
                    resolve({ recordset: r , rowsAffected: r.length });
                } else {
                    reject(r);
                }
            }
            mysqlStorage.getMatches(season, stepId, phaseId, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function removeMatch(matchId, season, stepId) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                if (r && r.affectedRows !== undefined) {
                    resolve({ rowsAffected: r.affectedRows });
                } else {
                    reject(r);
                }
            }
            mysqlStorage.deleteMatch(matchId, season, stepId, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

module.exports = {
    insertMatch,
    getMatches,
    removeMatch
}