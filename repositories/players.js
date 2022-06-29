const storage = require('../db/storage');
const mysqlStorage = require("../db/mysql")

function getPlayers(season, teamId, stepId, roles) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                console.log("getPlayers response:", r);
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
                console.log("existsPlayer response:", r);
                resolve(r);
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
                console.log("getPlayer response:", r);
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
                console.log("addPlayer response:", r);
                resolve({ recordset: r , rowsAffected: [r.length] });
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
                console.log("updatePlayer response:", r);
                resolve({ rowsAffected: [r.length] });
            }
            mysqlStorage.updatePlayer(id, caretakerId, comments, isResident, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function removePlayer(playerId) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                console.log("removePlayer response:", r);
                let result = [];
                if (r) {
                    if (r.PhotoFilename) { result.push(r.PhotoFilename); }
                    if (r.DocFilename) { result.push(r.DocFilename); }
                }
                resolve(result);
            }
            mysqlStorage.removePlayer(playerId, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function addDocFile(playerId, filename) {
    const query = function (db) {
        const player = db.get('Player')
            .find({ Id: playerId })
            .assign({ DocFilename: filename, LastUpdatedAt: new Date() })
            .write();
        //console.log('Storage person: ', player);
        return { rowsAffected: [1] };
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

function addPhotoFile(playerId, filename) {
    const query = function (db) {
        const player = db.get('Player')
            .find({ Id: playerId })
            .assign({ PhotoFilename: filename, LastUpdatedAt: new Date() })
            .write();
        //console.log('Storage person: ', player);
        return { rowsAffected: [1] };
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

function importPlayers(teamId, stepId, season, selectedSeason, playerIds) {
    const query = function (db) {
        var newPlayers = 0;
        playerIds.forEach(id => {
            const player = db.get('Player')
                .cloneDeep()
                .find({ Id: id, Season: selectedSeason })
                .value();
            
            if (player) {
                const last = db.get('Player')
                    .cloneDeep()
                    .last()
                    .value();
                const id = last && last.Id ? last.Id + 1 : 1;
                
                player.Id = id;
                player.Season = season;
                player.DocFilename = null;
                player.PhotoFilename = null;
                player.CreatedAt = new Date()
                
                db.get('Player')
                    .push(player)
                    .write();

                newPlayers++;
            }
        });

        return { rowsAffected: [newPlayers] };
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

module.exports = {
    addPlayer,
    existsPlayer,
    getPlayer,
    getPlayers,
    updatePlayer,
    removePlayer,
    importPlayers,
    addDocFile,
    addPhotoFile,
    getPlayersCount
}