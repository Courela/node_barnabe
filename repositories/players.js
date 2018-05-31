const db = require('../db/adapter');
const storage = require('../db/storage');

function getPlayers(season, teamId, stepId) {
    const query = function (db) {
        const players = db.get('Player')
            .filter({ Season: season, TeamId: teamId, StepId: stepId })
            .value();
        //console.log('Storage players:'); console.log(players);
        let persons = []
        players.forEach(player => {
            let person = db.get('Person').find({ Id: player.PersonId }).value();
            person = Object.assign({}, person);
            delete person.Id; 
            //console.log('Person:'); console.log(person);
            persons.push(Object.assign({}, player, person));
        });
        //const persons = db.get('Person').intersectionWith(players, (arrVal, othVal) => arrVal.Id == othVal.PersonId).value();
        //console.log('Storage persons:'); console.log(persons);
        return { recordset: persons };
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

function addPlayer(teamId, stepId, season, resident, personId, roleId, caretakerId) {
    const query = function (db) {
        const last = db.get('Player')
            .last();
        const id = last && last.Id ? last.Id + 1 : 1;
        db.get('Player')
            .push({ Id: id, Season: season, TeamId: teamId, StepId: stepId, PersonId: personId, 
                Resident: resident, RoleId: roleId, CaretakerId: caretakerId })
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

// function getPlayers(season, teamId, stepId) {
//     const query = ' SELECT plr.Id, prs.[Name],prs.Gender,prs.Birthdate,prs.IdCardNr,prs.IdCardExpireDate,prs.VoterNr,prs.Phone,prs.Email, r.[Description] FROM dbo.Player plr ' +
// 	    '   INNER JOIN dbo.Person prs ON prs.Id = plr.PersonId ' +
// 	    '   INNER JOIN dbo.[Role] r ON r.Id = plr.RoleId ' +
//         ' WHERE plr.Season = @season AND plr.TeamId = @teamId AND plr.StepId = @stepId ';
//     const parameters = [{
//         name: 'season',
//         type: db.sql_smallint,
//         value: season
//     },{
//         name: 'teamId',
//         type: db.sql_int,
//         value: teamId
//     },{
//         name: 'stepId',
//         type: db.sql_int,
//         value: stepId
//     }];
//     return db.statementQuery(query, parameters);
//}

function getPlayer(season, teamId, stepId, playerId) {
    const query = 
    ' SELECT plr.Id, prs.[Name], prs.Gender, prs.Birthdate, prs.IdCardNr, prs.IdCardExpireDate, ' +
    '   prs.VoterNr,prs.Phone,prs.Email, ' +
    '   s.[Description] ' +
    ' FROM dbo.Player plr ' +
	    '   INNER JOIN dbo.Person prs ON prs.Id = plr.PersonId ' +
        '   INNER JOIN dbo.[Step] s ON s.Id = plr.StepId ' +
        ' WHERE plr.Id = @playerId AND plr.Season = @season AND plr.TeamId = @teamId AND plr.StepId = @stepId;';
    const parameters = [{
        name: 'playerId',
        type: db.sql_int,
        value: playerId
    },{
        name: 'season',
        type: db.sql_smallint,
        value: season
    },{
        name: 'teamId',
        type: db.sql_int,
        value: teamId
    },{
        name: 'stepId',
        type: db.sql_int,
        value: stepId
    }];
    return db.statementQuery(query, parameters);
}

// function addPlayer(teamId, stepId, season, resident, personId, roleId, caretakerId) {
//     const query = ' INSERT INTO dbo.Player ([Season],[Resident],[PersonId],[TeamId],[StepId],[RoleId],[CaretakerId]) ' +
//         ' VALUES (@season, @resident, @personId, @teamId, @stepId, @roleId, @caretakerId); ' +
//         ' SELECT SCOPE_IDENTITY() AS Id; ' ;
//         const parameters = [{
//             name: 'teamId',
//             type: db.sql_int,
//             value: teamId
//         },{
//             name: 'stepId',
//             type: db.sql_smallint,
//             value: stepId
//         },{
//             name: 'season',
//             type: db.sql_int,
//             value: season
//         },{
//             name: 'resident',
//             type: db.sql_bit,
//             value: resident
//         },{
//             name: 'personId',
//             type: db.sql_int,
//             value: personId
//         },{
//             name: 'roleId',
//             type: db.sql_int,
//             value: roleId
//         },{
//             name: 'caretakerId',
//             type: db.sql_int,
//             value: caretakerId
//         }];
//         return db.statementQuery(query, parameters);
// }

module.exports = {
    addPlayer,
    getPlayer,
    getPlayers
}