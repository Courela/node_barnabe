const storage = require('../db/storage');
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
    const query = function (db) {
        const playersCount = db.get('Player')
            .filter({ Season: year, RoleId: 1 })
            .size()
            .value();
        return { recordset: [playersCount], rowsAffected: [1] };
    };
    return new Promise((resolve, reject) => {
        try {
            const result = storage.statementQuery(query);
            resolve(result);
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
            mysqlStorage.addDocument(playerId, filename, doc, fn);
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
    addDocument
}