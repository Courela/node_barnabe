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
        
            const person = db.get('Person')
            .cloneDeep()
            .find({ Id: player.PersonId })
            .value();
        delete person.Id;
        
        const step = db.get('Step')
            .cloneDeep()
            .find({ Id: player.StepId })
            .value();
        
        const result = Object.assign({ Description: step.Description }, player, person);
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
            Comments: comments
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

function removePlayer(teamId, stepId, season, playerId) {
    const query = function (db) {
        db.get('Player')
            .remove({ Id: playerId, Season: season, TeamId: teamId, StepId: stepId })
            .write();
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
    removePlayer
}