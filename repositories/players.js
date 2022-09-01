const mysqlStorage = require("../db/mysql/player")

function getPlayers(season, teamId, stepId, roles) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("getPlayers response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.getPlayers(season, teamId, stepId, roles, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function existsPlayer(season, teamId, stepId, roleId, personId) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("existsPlayer response:", r);
                resolve(r.length > 0);
            }
            mysqlStorage.existsPlayer(season, teamId, stepId, roleId, personId, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

async function getPlayer(season, teamId, stepId, playerId) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("getPlayer response:", r);
                resolve({ recordset: r , rowsAffected: [r.length] });
            }
            mysqlStorage.getPlayer(season, teamId, stepId, playerId, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function addPlayer(teamId, stepId, season, resident, personId, roleId, caretakerId, comments) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("addPlayer response:", r);
                resolve({ recordset: r , rowsAffected: r.affectedRows });
            }
            mysqlStorage.addPlayer(teamId, stepId, season, resident, personId, roleId, caretakerId, comments, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function updatePlayer(id, caretakerId, comments, isResident){
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("updatePlayer response:", r);
                resolve({ rowsAffected: [r.length] });
            }
            mysqlStorage.updatePlayer(id, caretakerId, comments, isResident, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function removePlayer(teamId, stepId, season, playerId) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                let result = [];
                if (r.affectedRows && r.affectedRows.length > 0) {
                    if (r.PhotoFilename) { result.push(r.PhotoFilename); }
                    if (r.DocFilename) { result.push(r.DocFilename); }
                }
                resolve(result);
            }
            mysqlStorage.removePlayer(teamId, stepId, season, playerId, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getPlayersCount(year) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                if (r && r.length > 0) {
                    resolve({ recordset: [r[0].NrPlayers] , rowsAffected: [1]});
                } else {
                    resolve({ recordset: [0], rowsAffected: [0]});
                }
            }
            mysqlStorage.getPlayersCount(year, fn);
        }
        catch(err) {
            reject(err);
        }
    });   
}

function addPhoto(playerId, filename, photo) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                resolve(r);
            }
            mysqlStorage.addPhoto(playerId, filename, photo, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function addDocument(playerId, filename, doc) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                resolve(r);
            }
            mysqlStorage.addDocument(playerId, filename, null, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getPhoto(playerId) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                resolve({ recordset: r[0], rowsAffected: [r.length] });
            }
            mysqlStorage.getPhoto(playerId, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getDocumentFilename(playerId) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                resolve({ recordset: r[0], rowsAffected: [r.length] });
            }
            mysqlStorage.getDocument(playerId, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

module.exports = {
    addPlayer,
    existsPlayer,
    getPlayer,
    getPlayers,
    updatePlayer,
    removePlayer,
    getPlayersCount,
    addPhoto,
    addDocument,
    getPhoto,
    getDocumentFilename
}