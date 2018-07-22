const storage = require('../db/storage');

function getPlayers(season, teamId, stepId, roles) {
    const query = function (db) {
        const players = db.get('Player')
            .cloneDeep()
            .filter(p => p.Season == season && p.TeamId == teamId && p.StepId == stepId && roles.includes(p.RoleId))
            .value();
        //console.log('Storage players:'); console.log(players);
        let persons = []
        players.forEach(player => {
            let person = db.get('Person')
                .cloneDeep()
                .find({ Id: player.PersonId })
                .value();
            person = Object.assign({}, person);
            delete person.Id; 
            //console.log('Person:'); console.log(person);
            persons.push(Object.assign({}, player, person));
        });
        //const persons = db.get('Person').intersectionWith(players, (arrVal, othVal) => arrVal.Id == othVal.PersonId).value();
        //console.log('Storage persons:'); console.log(persons);
        return { recordset: persons, rowsAffected: [persons.length] };
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

function existsPlayer(teamId, stepId, season, personId) {
    const query = function (db) {
        const player = db.get('Player')
            .cloneDeep()
            .find({ PersonId: personId, TeamId: teamId, StepId: stepId, Season: season })
            .value();
        
        const result = player ? true : false;
        //console.log("Exists player: ",result);
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

function getPlayer(season, teamId, stepId, playerId) {
    const query = function (db) {
        //plr.Id, prs.[Name], prs.Gender, prs.Birthdate, prs.IdCardNr, prs.IdCardExpireDate, ' +
//     '   prs.VoterNr,prs.Phone,prs.Email, ' +
//     '   s.[Description] ' +
        const player = db.get('Player')
            .cloneDeep()
            .find({ Id: playerId, TeamId: teamId, StepId: stepId, Season: season })
            .value();
        
        if (!player) {
            return { recordset: [ ], rowsAffected: [0] }; 
        }
        
        const person = db.get('Person')
            .cloneDeep()
            .find({ Id: player.PersonId })
            .value();
        
        const step = db.get('Step')
            .cloneDeep()
            .find({ Id: player.StepId })
            .value();

        const birthStepLimit = db.get('BirthStepLimit')
            .cloneDeep()
            .find({ Season: player.Season, StepId: player.StepId })
            .value();

        let caretaker = null;
        if (player.CaretakerId) {
            caretaker = db.get('Person')
            .cloneDeep()
            .find({ Id: player.CaretakerId })
            .value();
        }
        
        const result = Object.assign({ step: Object.assign(step, birthStepLimit) }, player, { person: person }, { caretaker: caretaker });
        //console.log("Get Player: ", result);
        return { recordset: [ result ], rowsAffected: [1] };
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

function addPlayer(teamId, stepId, season, resident, personId, roleId, caretakerId, comments) {
    const query = function (db) {
        const last = db.get('Player')
            .cloneDeep()
            .last()
            .value();
        const id = last && last.Id ? last.Id + 1 : 1;
        const player = { 
            Id: id, 
            Season: season, 
            TeamId: teamId, 
            StepId: stepId, 
            PersonId: personId, 
            Resident: resident, 
            RoleId: roleId, 
            CaretakerId: caretakerId,
            Comments: comments,
            PhotoFilename: null,
            DocFilename: null
        };
        db.get('Player')
            .push(player)
            .write();
        return { recordset: [ player ], rowsAffected: [1] };
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

function updatePlayer(id, caretakerId, comments){
    const query = function (db) {
        const person = db.get('Player')
            .find({ Id: id })
            .assign({ CaretakerId: caretakerId, Comments: comments })
            .write();
        //console.log('Storage person: ', person);
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
            .assign({ DocFilename: filename })
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
            .assign({ PhotoFilename: filename })
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

module.exports = {
    addPlayer,
    existsPlayer,
    getPlayer,
    getPlayers,
    updatePlayer,
    removePlayer,
    addDocFile,
    addPhotoFile
}