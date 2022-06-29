const mysqlStorage = require("../db/mysql")

function getTeamSteps(season, teamId, invert = false) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                console.log("getTeamSteps response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            if (invert) {
                mysqlStorage.getTeamMissingSteps(season, teamId, fn);
            } else {
                mysqlStorage.getTeamSteps(season, teamId, fn);
            }
        }
        catch(err) {
            reject(err);
        }
    });
}

function addStep(season, teamId, stepId) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                console.log("addStep response:", r);
                resolve({ rowsAffected: [r] });
            }
            mysqlStorage.addStep(season, teamId, stepId, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function deleteStep(season, teamId, stepId) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                console.log("deleteStep response:", r);
                resolve({ rowsAffected: [r] });
            }
            mysqlStorage.deleteStep(season, teamId, stepId, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getTeams() {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                console.log("getTeams response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.getTeams(fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getTeamById(id) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                console.log("getTeamById response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.getTeamById(id, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getStep(stepId, season = null) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                console.log("getStep response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            if (season) {
                mysqlStorage.getStepWithSeason(stepId, season, fn);
            } else {
                mysqlStorage.getStepById(stepId, fn);
            }
        }
        catch(err) {
            reject(err);
        }
    });
}

function getTeamsBySeason(season) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                console.log("getTeamsBySeason response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.getTeamsBySeason(season, fn);
        }
        catch(err) {
            reject(err);
        }
    });
    // const query = function (db) {
    //     const stepsBySeason = db.get('TeamStep')
    //         .cloneDeep()
    //         .filter({ Season: season })
    //         .value();

    //     if (!stepsBySeason) { stepsBySeason = [] };
    //     let result = [];
    //     result = db.get('Team')
    //             .cloneDeep()
    //             .intersectionWith(stepsBySeason, (obj1, obj2) => obj1.Id === obj2.TeamStepId)
    //             .value();
    //     result.forEach(t => { t.TeamId = t.Id; t.Season = season });
    //     console.log('Teams by season: ', result);
    //     return result;
    // };
    // return new Promise((resolve, reject) => {
    //     try {
    //         const result = storage.statementQuery(query);
    //         resolve({ recordset: result, rowsAffected: result.length });
    //     }
    //     catch (err) {
    //         reject(err);
    //     }
    // });
}

function getTeamsByStep(season, stepId) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                console.log("getTeamsByStep response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.getTeamsByStep(season, stepId, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

module.exports = {
    addStep,
    getStep,
    getTeams,
    getTeamById,
    getTeamsBySeason,
    getTeamsByStep,
    getTeamSteps,
    deleteStep
}
