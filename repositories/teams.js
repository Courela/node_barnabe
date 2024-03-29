const adapter = require("../db/mysql/teams")

function getTeamSteps(season, teamId, invert = false) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("getTeamSteps response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            if (invert) {
                adapter.getTeamMissingSteps(season, teamId, fn);
            } else {
                adapter.getTeamSteps(season, teamId, fn);
            }
        }
        catch(err) {
            reject(err);
        }
    });
}

function getTeamStep(season, teamId, teamStepId) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("getTeamSteps response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            adapter.getTeamStep(season, teamId, teamStepId, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function addTeam(name, shortDescription) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("addStep response:", r);
                resolve({ rowsAffected: [r.affectedRows] });
            }
            adapter.addTeam(name, shortDescription, fn);
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
                //console.log("addStep response:", r);
                resolve({ rowsAffected: [r.affectedRows] });
            }
            adapter.addStep(season, teamId, stepId, fn);
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
                //console.log("deleteStep response:", r);
                resolve({ rowsAffected: [r.affectedRows] });
            }
            adapter.deleteStep(season, teamId, stepId, fn);
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
                //console.log("getTeams response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            adapter.getTeams(fn);
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
                //console.log("getTeamById response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            adapter.getTeamById(id, fn);
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
                //console.log("getStep response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            if (season) {
                //console.log("calling getStepWithSeason: ", stepId, "; ", season);
                adapter.getStepWithSeason(stepId, season, fn);
            } else {
                //console.log("calling getStepById: ", stepId);
                adapter.getStepById(stepId, fn);
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
                //console.log("getTeamsBySeason response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            adapter.getTeamsBySeason(season, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getTeamsByStep(season, stepId) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("getTeamsByStep response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            adapter.getTeamsByStep(season, stepId, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getTeamsWithoutUser() {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                resolve({ recordset: r[0], rowsAffected: [r.length] });
            }
            adapter.getTeamsWithoutUser(fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getStepsWithoutPlayers(year) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                var result = { NrSteps: 0 };
                if (Array.isArray(r) && r.length > 0) {
                    result = r[0];
                }
                resolve({ recordset: result, rowsAffected: [1] });
            }
            adapter.getStepsWithoutPlayers(year, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

module.exports = {
    addTeam,
    addStep,
    getStep,
    getTeams,
    getTeamById,
    getTeamsBySeason,
    getTeamsByStep,
    getTeamSteps,
    getTeamStep,
    deleteStep,
    getTeamsWithoutUser,
    getStepsWithoutPlayers
}
