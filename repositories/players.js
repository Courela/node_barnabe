const storage = require('../db/storage');
const mysql = require('../db/mysql');

function getPlayers(season, teamId, stepId, roles) {
    return mysql.executeStatement('SELECT plr.*, ' + 
                ' ps.Name, ps.Gender, ps.Birthdate, ps.IdCardNr, ps.VoterNr, ps.Phone, ps.Email, ps.LocalBorn ' +
            ' FROM player plr ' +
                ' INNER JOIN person ps ON ps.Id = plr.PersonId ' + 
                ' LEFT JOIN person ct ON ct.Id = plr.CaretakerId ' +
            ' WHERE plr.season = ? AND plr.teamId = ? AND plr.stepId = ? AND plr.Role IN (?)', [season, teamId, stepId, roles])
        .then(results => { return { recordset: results, rowsAffected: [results.length] }; });
}

// function getPlayers(season, teamId, stepId, roles) {
//     const query = function (db) {
//         const players = db.get('Player')
//             .cloneDeep()
//             .filter(p => p.Season == season && p.TeamId == teamId && p.StepId == stepId && roles.includes(p.RoleId))
//             .value();
//         let result = []
//         players.forEach(player => {
//             const person = db.get('Person')
//                 .cloneDeep()
//                 .find({ Id: player.PersonId })
//                 .value();

//             const caretaker = db.get('Person')
//                 .cloneDeep()
//                 .find({ Id: player.CareTakerId })
//                 .value();
            
//             //console.log('Caretaker:', caretaker);
//             result.push(Object.assign(player, { person: person }, caretaker ? { caretaker: caretaker } : null ));
//         });
//         //console.log('Storage persons:'); console.log(result);
//         return { recordset: result, rowsAffected: [result.length] };
//     };
//     return new Promise((resolve, reject) => {
//         try {
//             const result = storage.statementQuery(query);
//             resolve(result);
//         }
//         catch(err) {
//             reject(err);
//         }
//     });
// }

function existsPlayer(teamId, stepId, season, personId) {
    return mysql.executeStatement(' SELECT TOP 1 1 ' + 
            ' FROM player ' +
            ' WHERE PersonId = ? AND TeamId = ? AND StepId = ? AND Season = ?', [personId, teamId, stepId, season])
        .then(result => result.length > 0);
}

// function existsPlayer(teamId, stepId, season, personId) {
//     const query = function (db) {
//         const player = db.get('Player')
//             .cloneDeep()
//             .find({ PersonId: personId, TeamId: teamId, StepId: stepId, Season: season })
//             .value();
        
//         const result = player ? true : false;
//         //console.log("Exists player: ",result);
//         return result;
//     };
//     return new Promise((resolve, reject) => {
//         try {
//             const result = storage.statementQuery(query);
//             resolve(result);
//         }
//         catch(err) {
//             reject(err);
//         }
//     });
// }

function getPlayer(season, teamId, stepId, playerId) {
    return mysql.executeStatement(' SELECT plr.*, ' +
                ' ps.Name, ps.Gender, ps.Birthdate, ps.IdCardNr, ps.Phone, ps.Email, ps.LocalBorn, ' +
                ' s.Description, s.IsCaretakerRequired, ' +
                ' bsl.MinDate, bsl.MaxDate ' +
                ' crt.Name, crt.IdCardNr, crt.Phone, crt.Email ' +
            ' FROM player plr' +
                ' INNER JOIN person ps ON ps.Id = plr.PersonId ' +
                ' INNER JOIN step s ON s.Id = plr.StepId ' +
                ' INNER JOIN birthsteplimit bsl on bsl.Season = plr.season AND bsl.StepId = plr.StepId ' +
                ' LEFT JOIN person crt ON crt.Id = plr.CaretakerId ' + 
            ' WHERE plr.PersonId = ? AND plr.TeamId = ? AND plr.StepId = ? AND plr.Season = ?', [personId, teamId, stepId, season])
        .then(result => { return { recordset: result, rowsAffected: [result.length] }; });
}

// function getPlayer(season, teamId, stepId, playerId) {
//     const query = function (db) {
//         const player = db.get('Player')
//             .cloneDeep()
//             .find({ Id: playerId, TeamId: teamId, StepId: stepId, Season: season })
//             .value();
        
//         if (!player) {
//             return { recordset: [ ], rowsAffected: [0] }; 
//         }
        
//         const person = db.get('Person')
//             .cloneDeep()
//             .find({ Id: player.PersonId })
//             .value();
        
//         const step = db.get('Step')
//             .cloneDeep()
//             .find({ Id: player.StepId })
//             .value();

//         const birthStepLimit = db.get('BirthStepLimit')
//             .cloneDeep()
//             .find({ Season: player.Season, StepId: player.StepId })
//             .value();

//         let caretaker = null;
//         if (player.CareTakerId) {
//             caretaker = db.get('Person')
//             .cloneDeep()
//             .find({ Id: player.CareTakerId })
//             .value();
//         }
        
//         const result = Object.assign({ step: Object.assign(step, birthStepLimit) }, player, { person: person }, { caretaker: caretaker });
//         console.log("Get Player: ", result);
//         return { recordset: [ result ], rowsAffected: [1] };
//     };
//     return new Promise((resolve, reject) => {
//         try {
//             const result = storage.statementQuery(query);
//             resolve(result);
//         }
//         catch(err) {
//             reject(err);
//         }
//     });
// }

function addPlayer(teamId, stepId, season, resident, personId, roleId, caretakerId, comments) {
    return mysql.executeStatement(' INSERT INTO player (Season, TeamId, StepId, PersonId, Resident, RoleId, CaretakerId, Comments) ' +
            ' VALUES (?,?,?,?,?,?,?,?); SELECT * FROM player WHERE Id = LAST_INSERTED_ID(); ', [season, teamId, stepId, personId, resident, roleId, caretakerId, comments])
        .then(result => { return { recordset: result, rowsAffected: [result.length] }; })
}

// function addPlayer(teamId, stepId, season, resident, personId, roleId, caretakerId, comments) {
//     const query = function (db) {
//         const last = db.get('Player')
//             .cloneDeep()
//             .last()
//             .value();
//         const id = last && last.Id ? last.Id + 1 : 1;
//         const player = { 
//             Id: id, 
//             Season: season, 
//             TeamId: teamId, 
//             StepId: stepId, 
//             PersonId: personId, 
//             Resident: resident, 
//             RoleId: roleId, 
//             CareTakerId: caretakerId,
//             Comments: comments,
//             PhotoFilename: null,
//             DocFilename: null,
//             CreatedAt: new Date()
//         };
//         db.get('Player')
//             .push(player)
//             .write();
//         return { recordset: [ player ], rowsAffected: [1] };
//     };
//     return new Promise((resolve, reject) => {
//         try {
//             const result = storage.statementQuery(query);
//             resolve(result);
//         }
//         catch(err) {
//             reject(err);
//         }
//     });
// }

function updatePlayer(id, caretakerId, comments, isResident){
    return mysql.executeStatement(' UPDATE player SET CaretakerId = ?, Resident = ?, Comments = ? ' +
            ' WHERE Id = ?; ', [caretakerId, isResident, comments, id])
        .then(result => { return { rowsAffected: [result.affectedRows]}; });
}

// function updatePlayer(id, caretakerId, comments, isResident){
//     const query = function (db) {
//         const person = db.get('Player')
//             .find({ Id: id })
//             .assign({ CareTakerId: caretakerId, Resident: isResident, Comments: comments, LastUpdatedAt: new Date() })
//             .write();
//         //console.log('Storage person: ', person);
//         return { rowsAffected: [1] };
//     };
//     return new Promise((resolve, reject) => {
//         try {
//             const result = storage.statementQuery(query);
//             resolve(result);
//         }
//         catch(err) {
//             reject(err);
//         }
//     });
// }

function removePlayer(teamId, stepId, season, playerId) {
    const query = function (db) {
        let result = [];
        const player = db.get('Player')
            .find({ Id: playerId })
            .value();
        
        if (player) {
            if (player.PhotoFilename) { result.push(player.PhotoFilename); }
            if (player.DocFilename) { result.push(player.DocFilename); }
        }

        db.get('Player')
            .remove(player)
            .write();
        
        return result;
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

module.exports = {
    addPlayer,
    existsPlayer,
    getPlayer,
    getPlayers,
    updatePlayer,
    removePlayer,
    importPlayers,
    addDocFile,
    addPhotoFile
}